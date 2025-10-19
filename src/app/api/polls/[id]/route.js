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
        votes: true
      }
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Parse options and add vote counts
    const options = JSON.parse(JSON.stringify(poll.options));
    
    const optionsWithVotes = options.map((option, index) => {
      const voteCount = poll.votes.filter(vote => vote.option === option.text).length;
      return {
        id: `${poll.id}-${index}`,
        text: option.text,
        _count: { votes: voteCount }
      };
    });

    // Check if user voted
    const session = await getServerSession(authOptions);
    let userVote = null;
    if (session) {
      const vote = poll.votes.find(v => v.userId === session.user.id);
      if (vote) {
        const optionIndex = options.findIndex(opt => opt.text === vote.option);
        if (optionIndex !== -1) {
          userVote = `${poll.id}-${optionIndex}`;
        }
      }
    }

    return NextResponse.json({
      ...poll,
      options: optionsWithVotes,
      userVote
    });

  } catch (error) {
    console.error('Poll fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 });
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