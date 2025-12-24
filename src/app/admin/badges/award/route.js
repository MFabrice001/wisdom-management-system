import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    // Authorization: Only Admin (and potentially Elder) can award badges
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ELDER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, badgeType } = await req.json();

    if (!userId || !badgeType) {
      return NextResponse.json({ error: 'Missing userId or badgeType' }, { status: 400 });
    }

    // Check if the badge has already been awarded to this user
    // (This prevents duplicate badge spamming)
    const existingBadge = await prisma.awardedBadge.findFirst({
        where: {
            userId: userId,
            badgeType: badgeType
        }
    });

    if (existingBadge) {
        return NextResponse.json({ message: 'User already has this badge' }, { status: 200 });
    }

    // Create the new badge record
    const award = await prisma.awardedBadge.create({
      data: {
        userId,
        badgeType,
        awardedBy: session.user.id
      }
    });

    return NextResponse.json({ success: true, award }, { status: 201 });

  } catch (error) {
    console.error('Error awarding badge:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}