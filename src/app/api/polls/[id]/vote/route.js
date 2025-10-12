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

    const body = await request.json();
    const { option } = body;

    if (!option) {
      return NextResponse.json({ error: 'Option is required' }, { status: 400 });
    }

    // Check if poll exists and is active
    const poll = await prisma.poll.findUnique({
      where: { id: params.id }
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    if (!poll.isActive || new Date() > poll.endDate) {
      return NextResponse.json({ error: 'Poll is no longer active' }, { status: 400 });
    }

    // Check if option is valid
    const validOption = poll.options.find(opt => opt.text === option);
    if (!validOption) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        pollId_userId: {
          pollId: params.id,
          userId: session.user.id
        }
      }
    });

    if (existingVote) {
      // Update existing vote
      await prisma.$transaction(async (tx) => {
        // Decrease old option count
        const updatedOptions = poll.options.map(opt => {
          if (opt.text === existingVote.option) {
            return { ...opt, votes: Math.max(0, opt.votes - 1) };
          }
          if (opt.text === option) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });

        await tx.poll.update({
          where: { id: params.id },
          data: { options: updatedOptions }
        });

        await tx.vote.update({
          where: {
            pollId_userId: {
              pollId: params.id,
              userId: session.user.id
            }
          },
          data: { option }
        });
      });

      return NextResponse.json({ message: 'Vote updated successfully' });
    } else {
      // Create new vote
      await prisma.$transaction(async (tx) => {
        // Increase option count
        const updatedOptions = poll.options.map(opt => {
          if (opt.text === option) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });

        await tx.poll.update({
          where: { id: params.id },
          data: { options: updatedOptions }
        });

        await tx.vote.create({
          data: {
            pollId: params.id,
            userId: session.user.id,
            option
          }
        });
      });

      return NextResponse.json({ message: 'Vote recorded successfully' }, { status: 201 });
    }

  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}