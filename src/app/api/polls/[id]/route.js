import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: { id: true, name: true }
        },
        _count: {
          select: { votes: true }
        }
      }
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Add user's vote if authenticated
    const session = await getServerSession(authOptions);
    
    if (session) {
      const userVote = await prisma.vote.findUnique({
        where: {
          pollId_userId: {
            pollId: params.id,
            userId: session.user.id
          }
        }
      });

      poll.userVote = userVote?.option || null;
    }

    return NextResponse.json(poll);

  } catch (error) {
    console.error('Poll fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 });
  }
}

// Update poll (Admin only)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question, isActive, endDate } = body;

    const updatedPoll = await prisma.poll.update({
      where: { id: params.id },
      data: {
        ...(question && { question }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(endDate && { endDate: new Date(endDate) })
      }
    });

    return NextResponse.json(updatedPoll);

  } catch (error) {
    console.error('Poll update error:', error);
    return NextResponse.json({ error: 'Failed to update poll' }, { status: 500 });
  }
}

// Delete poll (Admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.poll.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Poll deleted successfully' });

  } catch (error) {
    console.error('Poll delete error:', error);
    return NextResponse.json({ error: 'Failed to delete poll' }, { status: 500 });
  }
}