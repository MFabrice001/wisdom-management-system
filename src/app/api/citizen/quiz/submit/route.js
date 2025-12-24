import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { score, totalQuestions, percentage, tabSwitches = 0, violations = [], certificateEligible } = await request.json();
    
    const userId = session.user.id;

    // Save quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId,
        score,
        totalQuestions,
        percentage,
        tabSwitches,
        violations,
        isProctored: true
      }
    });

    let certificate = null;
    if (certificateEligible) {
      const certificateNumber = `WMS-${Date.now()}-${userId.slice(-4)}`;
      certificate = await prisma.certificate.create({
        data: {
          userId,
          quizAttemptId: quizAttempt.id,
          certificateNumber
        }
      });
    }

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      passed: certificateEligible,
      certificate: certificate?.certificateNumber || null
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}