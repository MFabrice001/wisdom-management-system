import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET: Fetch conversations
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { id: session.user.id } }
      },
      include: {
        participants: { select: { id: true, name: true, email: true, role: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formatted = conversations.map(c => ({
      id: c.id,
      updatedAt: c.updatedAt,
      participants: c.participants,
      lastMessage: c.messages[0] || null
    }));

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error('GET Messages Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// POST: Send Message
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { recipientEmail, initialMessage } = await req.json();

    console.log(`[DEBUG] Sender: ${session.user.email} -> Recipient: ${recipientEmail}`);

    if (!recipientEmail || !initialMessage) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const cleanEmail = recipientEmail.trim(); // Do not lowercase yet, let database handle insensitive if possible

    // 1. Find Recipient (Try strict first, then insensitive)
    let recipient = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!recipient) {
       // Fallback: Try finding by case-insensitive search if exact fail
       const users = await prisma.user.findMany({
         where: { 
           email: { equals: cleanEmail, mode: 'insensitive' } 
         }
       });
       recipient = users[0];
    }

    if (!recipient) {
      console.log(`[DEBUG] Failed to find user with email: ${cleanEmail}`);
      return NextResponse.json({ error: `User with email '${cleanEmail}' not found.` }, { status: 404 });
    }

    if (recipient.id === session.user.id) {
        return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    // 2. Find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: session.user.id } } },
          { participants: { some: { id: recipient.id } } }
        ]
      }
    });

    // 3. Create if missing
    if (!conversation) {
      console.log(`[DEBUG] Creating new conversation...`);
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: session.user.id }, { id: recipient.id }]
          }
        }
      });
    }

    // 4. Create Message
    await prisma.message.create({
      data: {
        content: initialMessage,
        senderId: session.user.id,
        conversationId: conversation.id
      }
    });

    // 5. Update timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error('[ERROR] Send Message Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}