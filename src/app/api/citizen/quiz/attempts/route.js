import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attemptCount = await prisma.quizAttempt.count({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ attemptCount });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
