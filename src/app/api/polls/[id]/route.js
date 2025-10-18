import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true }
            }
          }
        },
        _count: {
          select: { options: true }
        }
      }
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Add user's vote if authenticated
    const session = await getServerSession(authOptions);
    
    if (session) {
      const userVote = await prisma.pollVote.findFirst({
        where: {
          userId: session.user.id,
          pollOptionId: {
            in: poll.options.map(opt => opt.id)
          }
        }
      });

      poll.userVote = userVote?.pollOptionId || null;
    } else {
      poll.userVote = null;
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

    const { id } = await params;
    const body = await request.json();
    const { question, endDate, isActive } = body;

    const updatedPoll = await prisma.poll.update({
      where: { id },
      data: {
        ...(question && { question }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(typeof isActive === 'boolean' && { isActive })
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

    const { id } = await params;

    await prisma.poll.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Poll deleted successfully' });

  } catch (error) {
    console.error('Poll delete error:', error);
    return NextResponse.json({ error: 'Failed to delete poll' }, { status: 500 });
  }
}