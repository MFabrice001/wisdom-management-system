import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        quizAttempt: {
          select: {
            score: true,
            totalQuestions: true,
            percentage: true
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    return NextResponse.json({ certificates }, { status: 200 });

  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}