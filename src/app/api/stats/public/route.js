import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Count Wisdom Entries (Only published ones, or all if you prefer)
    const wisdomCount = await prisma.wisdom.count({
      where: { isPublished: true } 
    });

    // 2. Count Community Members (Users with role 'USER' or 'CITIZEN')
    const userCount = await prisma.user.count({
        where: {
            role: 'USER' // Or whatever your default role string is
        }
    });

    // 3. Count Elders (Users with role 'ELDER')
    const elderCount = await prisma.user.count({
      where: { role: 'ELDER' }
    });

    return NextResponse.json({
      wisdomCount,
      userCount,
      elderCount
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}