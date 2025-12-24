import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // 1. Fetch Basic Counts
    const totalUsers = await prisma.user.count();
    const totalWisdoms = await prisma.wisdom.count();
    const totalComments = await prisma.comment.count();
    const totalLikes = await prisma.like.count();
    
    // 2. Count Suggestions (Handling potential schema mismatch gracefully)
    let totalSuggestions = 0;
    try {
        // Try counting 'Suggestion' model
        // Note: This includes both general suggestions and [REQUEST] items
        totalSuggestions = await prisma.suggestion.count();
    } catch (e) {
        console.warn("Suggestion model count failed:", e.message);
    }

    // 3. Count Badges (AwardedBadge model)
    let totalBadges = 0;
    try {
        // This counts MANUALLY AWARDED badges stored in the DB
        totalBadges = await prisma.awardedBadge.count();
    } catch (e) {
        console.warn("AwardedBadge model count failed (table might be missing):", e.message);
    }

    // 4. Fetch Recent Activity (Last 30 days)
    const thirtyDaysAgo = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);
    
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });
    
    const newWisdoms = await prisma.wisdom.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
    });

    const newComments = await prisma.comment.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
    });

    // 5. Fetch Popular Wisdom
    const popularWisdoms = await prisma.wisdom.findMany({
      orderBy: { views: 'desc' },
      take: 3,
      include: {
        _count: { select: { likes: true, comments: true } }
      }
    });

    // 6. Category Stats
    const categoryStats = await prisma.wisdom.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 5
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        totalWisdoms,
        totalComments,
        totalLikes,
        totalSuggestions,
        totalBadges
      },
      recentActivity: {
        newUsers,
        newWisdoms,
        newComments,
        activeUsers: totalUsers 
      },
      popularWisdoms,
      categoryStats
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}