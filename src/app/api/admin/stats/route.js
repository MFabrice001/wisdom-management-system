import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total counts
    const [totalUsers, totalWisdoms, totalComments, totalLikes] = await Promise.all([
      prisma.user.count(),
      prisma.wisdom.count(),
      prisma.comment.count(),
      prisma.like.count()
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newUsers, newWisdoms, activeUsers] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.wisdom.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.user.count({
        where: { 
          OR: [
            { wisdoms: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { comments: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { likes: { some: { createdAt: { gte: thirtyDaysAgo } } } }
          ]
        }
      })
    ]);

    // Get category distribution
    const categoryStats = await prisma.wisdom.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    // Get most popular wisdoms
    const popularWisdoms = await prisma.wisdom.findMany({
      take: 5,
      orderBy: { views: 'desc' },
      select: {
        id: true,
        title: true,
        views: true,
        _count: { select: { likes: true, comments: true } }
      }
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        totalWisdoms,
        totalComments,
        totalLikes
      },
      recentActivity: {
        newUsers,
        newWisdoms,
        activeUsers
      },
      categoryStats,
      popularWisdoms
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}