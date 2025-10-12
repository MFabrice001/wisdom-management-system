import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Get all active polls
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const now = new Date();
    
    const where = includeInactive ? {} : {
      isActive: true,
      endDate: { gte: now }
    };

    const polls = await prisma.poll.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true }
        },
        _count: {
          select: { votes: true }
        }
      }
    });

    // Add user's vote if authenticated
    const session = await getServerSession(authOptions);
    
    if (session) {
      const userVotes = await prisma.vote.findMany({
        where: {
          userId: session.user.id,
          pollId: { in: polls.map(p => p.id) }
        },
        select: { pollId: true, option: true }
      });

      const voteMap = new Map(userVotes.map(v => [v.pollId, v.option]));

      polls.forEach(poll => {
        poll.userVote = voteMap.get(poll.id) || null;
      });
    }

    return NextResponse.json(polls);

  } catch (error) {
    console.error('Polls fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
  }
}

// Create new poll (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question, options, durationDays } = body;

    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      );
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (durationDays || 7));

    // Initialize options with vote counts
    const pollOptions = options.map(opt => ({
      text: opt,
      votes: 0
    }));

    const poll = await prisma.poll.create({
      data: {
        question,
        options: pollOptions,
        endDate,
        createdBy: session.user.id
      },
      include: {
        creator: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(poll, { status: 201 });

  } catch (error) {
    console.error('Poll create error:', error);
    return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
  }
}