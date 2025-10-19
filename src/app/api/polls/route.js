import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET all polls
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const now = new Date();
    
    const where = status === 'active' 
      ? { endDate: { gte: now }, isActive: true }
      : { endDate: { lt: now } };

    const polls = await prisma.poll.findMany({
      where,
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

      // Check if user voted
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

      return {
        ...poll,
        options: optionsWithVotes,
        userVote
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

// POST create new poll (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question, options, endDate } = body;

    console.log('Creating poll:', { question, options, endDate });

    // Validation
    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      );
    }

    if (!endDate) {
      return NextResponse.json(
        { error: 'End date is required' },
        { status: 400 }
      );
    }

    // Check if end date is in the future
    if (new Date(endDate) <= new Date()) {
      return NextResponse.json(
        { error: 'End date must be in the future' },
        { status: 400 }
      );
    }

    // Format options for JSON storage
    const formattedOptions = options.map(text => ({ text, votes: 0 }));

    const poll = await prisma.poll.create({
      data: {
        question,
        options: formattedOptions, // Store as JSON
        endDate: new Date(endDate),
        createdBy: session.user.id,
        isActive: true
      }
    });

    console.log('Poll created successfully:', poll);

    return NextResponse.json(poll, { status: 201 });

  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create poll' },
      { status: 500 }
    );
  }
}