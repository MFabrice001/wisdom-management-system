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
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // User Analytics with daily breakdown
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'asc' }
    });

    // Daily wisdom creation
    const dailyWisdoms = await prisma.wisdom.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'asc' }
    });

    // Daily comments
    const dailyComments = await prisma.comment.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'asc' }
    });

    const activeUsers = await prisma.user.count({
      where: { updatedAt: { gte: sevenDaysAgo } }
    });

    // Content Analytics
    const wisdomViews = await prisma.wisdom.aggregate({
      _sum: { views: true },
      _avg: { views: true }
    });

    const topCategories = await prisma.wisdom.groupBy({
      by: ['category'],
      _count: { category: true },
      _sum: { views: true },
      orderBy: { _count: { category: 'desc' } },
      take: 5
    });

    // Engagement Analytics
    const engagementStats = await prisma.$transaction([
      prisma.like.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.comment.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.suggestion.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
    ]);

    const topContributors = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            wisdoms: true,
            comments: true,
            likes: true
          }
        }
      },
      orderBy: {
        wisdoms: { _count: 'desc' }
      },
      take: 5
    });

    return NextResponse.json({
      userAnalytics: {
        growth: userGrowth,
        activeUsers,
        totalUsers: await prisma.user.count()
      },
      contentAnalytics: {
        totalViews: wisdomViews._sum.views || 0,
        avgViews: wisdomViews._avg.views || 0,
        topCategories,
        dailyWisdoms
      },
      engagement: {
        likes: engagementStats[0],
        comments: engagementStats[1],
        suggestions: engagementStats[2],
        dailyComments
      },
      topContributors
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}