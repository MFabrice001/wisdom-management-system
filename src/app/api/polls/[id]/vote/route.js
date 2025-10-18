import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { optionId } = body;

    // Check if poll exists and is active
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: true
      }
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Check if poll has ended
    if (new Date(poll.endDate) < new Date()) {
      return NextResponse.json({ error: 'Poll has ended' }, { status: 400 });
    }

    // Check if option belongs to this poll
    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    // Check if user has already voted
    const existingVote = await prisma.pollVote.findFirst({
      where: {
        userId: session.user.id,
        pollOptionId: {
          in: poll.options.map(opt => opt.id)
        }
      }
    });

    if (existingVote) {
      // Update existing vote
      await prisma.pollVote.update({
        where: { id: existingVote.id },
        data: { pollOptionId: optionId }
      });
    } else {
      // Create new vote
      await prisma.pollVote.create({
        data: {
          userId: session.user.id,
          pollOptionId: optionId
        }
      });
    }

    return NextResponse.json({ message: 'Vote recorded successfully' });

  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}