import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: conversationId } = params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: { select: { id: true, name: true, email: true, role: true } },
        messages: {
          orderBy: { createdAt: 'asc' } // Oldest first for chat history
        }
      }
    });

    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Check participation
    const isParticipant = conversation.participants.some(p => p.id === session.user.id);
    if (!isParticipant) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    return NextResponse.json({ conversation, messages: conversation.messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}