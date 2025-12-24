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
    // 1. Fetch Counts
    const totalUsers = await prisma.user.count();
    const totalWisdoms = await prisma.wisdom.count();
    const totalComments = await prisma.comment.count();
    const totalLikes = await prisma.like.count();
    
    // NEW: Count Suggestions and Badges
    const totalSuggestions = await prisma.suggestion.count();
    // Assuming you added AwardedBadge model from Turn 102
    // If not, this might fail, so ensure schema is updated.
    // Fallback to 0 if model doesn't exist yet in your active schema
    let totalBadges = 0;
    try {
        totalBadges = await prisma.awardedBadge.count();
    } catch (e) {
        console.warn("AwardedBadge model not found or empty");
    }

    // 2. Fetch Recent Activity (Example: Last 5 users)
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) } }
    });
    
    const newWisdoms = await prisma.wisdom.count({
        where: { createdAt: { gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) } }
    });

    const newComments = await prisma.comment.count({
        where: { createdAt: { gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) } }
    });

    // 3. Fetch Popular Wisdom (Top 3 by views)
    const popularWisdoms = await prisma.wisdom.findMany({
      orderBy: { views: 'desc' },
      take: 3,
      include: {
        _count: { select: { likes: true, comments: true } }
      }
    });

    // 4. Category Stats
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
        totalSuggestions, // This fixes the missing count
        totalBadges
      },
      recentActivity: {
        newUsers,
        newWisdoms,
        newComments,
        activeUsers: totalUsers // Placeholder for active metric
      },
      popularWisdoms,
      categoryStats
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}