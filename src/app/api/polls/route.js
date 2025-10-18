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
      ? { endDate: { gte: now } }
      : { endDate: { lt: now } };

    const polls = await prisma.poll.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true }
            }
          }
        }
      }
    });

    // If user is logged in, get their votes
    let pollsWithUserVotes = polls;
    if (session) {
      pollsWithUserVotes = await Promise.all(
        polls.map(async (poll) => {
          const userVote = await prisma.pollVote.findFirst({
            where: {
              userId: session.user.id,
              pollOptionId: {
                in: poll.options.map(opt => opt.id)
              }
            }
          });
          
          return {
            ...poll,
            userVote: userVote?.pollOptionId || null
          };
        })
      );
    } else {
      pollsWithUserVotes = polls.map(poll => ({
        ...poll,
        userVote: null
      }));
    }

    return NextResponse.json({ polls: pollsWithUserVotes });
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

    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.create({
      data: {
        question,
        endDate: new Date(endDate),
        creatorId: session.user.id,
        isActive: true,
        options: {
          create: options.map((text) => ({ text }))
        }
      },
      include: {
        options: true
      }
    });

    return NextResponse.json(poll, { status: 201 });

  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    );
  }
}