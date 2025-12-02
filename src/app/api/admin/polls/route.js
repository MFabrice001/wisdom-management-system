import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        votes: true
      }
    });

    // Parse options and add vote counts
    const pollsWithCounts = polls.map(poll => {
      const options = JSON.parse(JSON.stringify(poll.options));
      
      // Count votes for each option
      const optionsWithVotes = options.map((option, index) => {
        const voteCount = poll.votes.filter(vote => vote.option === option.text).length;
        return {
          id: `${poll.id}-${index}`,
          text: option.text,
          _count: { votes: voteCount }
        };
      });

      return {
        ...poll,
        options: optionsWithVotes
      };
    });

    return NextResponse.json({ polls: pollsWithCounts });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}