import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { quizId, selectedAnswer, isCorrect } = body;

    if (!quizId || !selectedAnswer) {
      return NextResponse.json(
        { error: 'Quiz ID and selected answer are required' },
        { status: 400 }
      );
    }

    // Create the quiz attempt
    const attempt = await prisma.wisdomQuizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        selectedAnswer,
        isCorrect: isCorrect || false
      }
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz attempt' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const wisdomId = searchParams.get('wisdomId');

    // Get quiz attempts for a specific wisdom
    const where = {
      userId: session.user.id
    };

    if (wisdomId) {
      const quizzes = await prisma.wisdomQuiz.findMany({
        where: { wisdomId },
        select: { id: true }
      });
      
      const quizIds = quizzes.map(q => q.id);
      where.quizId = { in: quizIds };
    }

    const attempts = await prisma.wisdomQuizAttempt.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz attempts' },
      { status: 500 }
    );
  }
}
