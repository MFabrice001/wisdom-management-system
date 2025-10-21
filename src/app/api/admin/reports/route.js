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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999); // End of day

    // Get all data
    const [
      allUsers,
      allWisdoms,
      allComments,
      allLikes,
      allBookmarks,
      newUsers,
      newWisdoms,
      newComments,
      newLikes,
      usersByRole,
      wisdomsByCategory,
      topWisdoms
    ] = await Promise.all([
      // All Users
      prisma.user.count(),
      
      // All Wisdoms
      prisma.wisdom.count(),
      
      // All Comments
      prisma.comment.count(),
      
      // All Likes
      prisma.like.count(),
      
      // All Bookmarks
      prisma.bookmark.count(),
      
      // New Users in period
      prisma.user.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      
      // New Wisdoms in period
      prisma.wisdom.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      
      // New Comments in period
      prisma.comment.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      
      // New Likes in period
      prisma.like.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      
      // Users by Role
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      
      // Wisdoms by Category
      prisma.wisdom.groupBy({
        by: ['category'],
        _count: true
      }),
      
      // Top Wisdoms
      prisma.wisdom.findMany({
        take: 10,
        orderBy: {
          views: 'desc'
        },
        select: {
          id: true,
          title: true,
          views: true,
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      })
    ]);

    // Get additional wisdom stats
    const wisdomsData = await prisma.wisdom.findMany({
      select: {
        views: true,
        isPublished: true,
        isFeatured: true
      }
    });

    const totalViews = wisdomsData.reduce((sum, w) => sum + w.views, 0);
    const avgViews = allWisdoms > 0 ? Math.round(totalViews / allWisdoms) : 0;
    const published = wisdomsData.filter(w => w.isPublished).length;
    const featured = wisdomsData.filter(w => w.isFeatured).length;

    // Active users (users who created wisdom, commented, or liked in period)
    const activeUsersData = await prisma.user.findMany({
      where: {
        OR: [
          {
            wisdoms: {
              some: {
                createdAt: {
                  gte: start,
                  lte: end
                }
              }
            }
          },
          {
            comments: {
              some: {
                createdAt: {
                  gte: start,
                  lte: end
                }
              }
            }
          },
          {
            likes: {
              some: {
                createdAt: {
                  gte: start,
                  lte: end
                }
              }
            }
          }
        ]
      }
    });

    const activeUsers = activeUsersData.length;

    // Format users by role
    const roleStats = {};
    usersByRole.forEach(item => {
      roleStats[item.role] = item._count;
    });

    // Format category stats with percentages
    const categoryStats = wisdomsByCategory.map(cat => ({
      category: cat.category,
      count: cat._count,
      percentage: allWisdoms > 0 ? ((cat._count / allWisdoms) * 100).toFixed(1) : 0
    }));

    // Format top wisdoms
    const formattedTopWisdoms = topWisdoms.map(wisdom => ({
      id: wisdom.id,
      title: wisdom.title,
      views: wisdom.views,
      likesCount: wisdom._count.likes,
      commentsCount: wisdom._count.comments
    }));

    // Build report data
    const reportData = {
      summary: {
        totalUsers: allUsers,
        totalWisdoms: allWisdoms,
        totalComments: allComments,
        totalLikes: allLikes
      },
      userStats: {
        total: allUsers,
        newUsers: newUsers,
        activeUsers: activeUsers,
        byRole: roleStats
      },
      wisdomStats: {
        total: allWisdoms,
        newWisdoms: newWisdoms,
        published: published,
        featured: featured,
        totalViews: totalViews,
        avgViews: avgViews
      },
      categoryStats: categoryStats,
      topWisdoms: formattedTopWisdoms,
      engagementStats: {
        totalComments: allComments,
        newComments: newComments,
        totalLikes: allLikes,
        newLikes: newLikes,
        totalBookmarks: allBookmarks
      }
    };

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}