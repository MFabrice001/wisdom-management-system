import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Correct way to await params in Next.js 15 (though usually auto-unwrapped in handlers, being safe)
  const { id: conversationId } = params;
  const { content } = await req.json();

  if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

  try {
    // 1. Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true }
    });

    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const isParticipant = conversation.participants.some(p => p.id === session.user.id);
    if (!isParticipant) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // 2. Create Message
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        conversationId
      }
    });

    // 3. Update Conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}