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

    // Get poll
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: { votes: true }
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Check if poll has ended
    if (new Date(poll.endDate) < new Date()) {
      return NextResponse.json({ error: 'Poll has ended' }, { status: 400 });
    }

    // Parse options
    const options = JSON.parse(JSON.stringify(poll.options));
    
    // Extract option text from optionId (format: "pollId-index")
    const optionIndex = parseInt(optionId.split('-')[1]);
    const selectedOption = options[optionIndex];

    if (!selectedOption) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    // Check if user has already voted
    const existingVote = poll.votes.find(v => v.userId === session.user.id);

    if (existingVote) {
      // Update existing vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { option: selectedOption.text }
      });
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          pollId: id,
          userId: session.user.id,
          option: selectedOption.text
        }
      });
    }

    return NextResponse.json({ message: 'Vote recorded successfully' });

  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}