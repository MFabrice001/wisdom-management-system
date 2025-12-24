import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const userId = searchParams.get('userId');
  const category = searchParams.get('category');

  try {
    let items = [];
    let title = "";
    let summary = null;

    if (type === 'GENERAL_SYSTEM') {
      title = "General System Report";
      
      // Get system statistics
      const [totalUsers, totalWisdoms, totalComments, totalLikes, totalPolls, totalSuggestions, totalCertificates] = await Promise.all([
        prisma.user.count(),
        prisma.wisdom.count(),
        prisma.comment.count(),
        prisma.like.count(),
        prisma.poll.count(),
        prisma.suggestion.count(),
        prisma.certificate.count()
      ]);

      // Get recent new users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newUsers = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      // Get recent wisdom entries (last 30 days)
      const recentWisdoms = await prisma.wisdom.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { name: true }
          }
        }
      });

      summary = {
        totalUsers,
        totalWisdoms,
        totalComments,
        totalLikes,
        totalPolls,
        totalSuggestions,
        totalCertificates,
        newUsersCount: newUsers.length,
        recentWisdomsCount: recentWisdoms.length
      };

      // Combine new users and recent wisdoms for the items list
      items = [
        ...newUsers.map(user => ({
          type: 'New User',
          name: user.name,
          email: user.email,
          role: user.role,
          date: new Date(user.createdAt).toLocaleDateString(),
          details: `Joined as ${user.role}`
        })),
        ...recentWisdoms.map(wisdom => ({
          type: 'New Wisdom',
          name: wisdom.author.name,
          email: wisdom.title,
          role: wisdom.category,
          date: new Date(wisdom.createdAt).toLocaleDateString(),
          details: `${wisdom.views} views`
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    else if (type === 'USER_SPECIFIC') {
      if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });
      
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      
      title = `Report for ${user.name}`;
      
      const whereClause = { authorId: userId };
      if (category && category !== 'ALL') {
        whereClause.category = category;
        title += ` - ${category.replace('_', ' ')}`;
      }

      const wisdoms = await prisma.wisdom.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          comments: true,
          likes: true,
          bookmarks: true
        }
      });

      items = wisdoms.map(w => ({
        title: w.title,
        category: w.category.replace('_', ' '),
        views: w.views,
        likes: w.likes.length,
        comments: w.comments.length,
        bookmarks: w.bookmarks.length,
        date: new Date(w.createdAt).toLocaleDateString(),
        status: w.isPublished ? 'Published' : 'Draft'
      }));

      summary = {
        totalWisdoms: wisdoms.length,
        totalViews: wisdoms.reduce((sum, w) => sum + w.views, 0),
        totalLikes: wisdoms.reduce((sum, w) => sum + w.likes.length, 0),
        totalComments: wisdoms.reduce((sum, w) => sum + w.comments.length, 0)
      };
    }
    else if (type === 'WISDOM_ENTRIES') {
      title = "Wisdom Contributors Report";
      
      const users = await prisma.user.findMany({
        include: {
          wisdoms: true
        }
      });

      items = users
        .filter(user => user.wisdoms.length > 0)
        .map(user => ({
          user: user.name,
          email: user.email,
          role: user.role,
          count: user.wisdoms.length
        }))
        .sort((a, b) => b.count - a.count);
    }
    else if (type === 'SUGGESTIONS_ACTIVITY') {
      title = "Suggestions Activity Report";
      
      const suggestions = await prisma.suggestion.findMany({
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      items = suggestions.map(s => ({
        user: s.user.name,
        title: s.title,
        status: s.status,
        date: s.createdAt
      }));
    }
    else if (type === 'SYSTEM_OVERVIEW') {
      title = "System Overview Report";
      
      const [totalUsers, totalWisdoms, totalComments, totalLikes, totalPolls] = await Promise.all([
        prisma.user.count(),
        prisma.wisdom.count(),
        prisma.comment.count(),
        prisma.like.count(),
        prisma.poll.count()
      ]);

      items = [
        { metric: 'Total Users', value: totalUsers },
        { metric: 'Total Wisdom Entries', value: totalWisdoms },
        { metric: 'Total Comments', value: totalComments },
        { metric: 'Total Likes', value: totalLikes },
        { metric: 'Total Polls', value: totalPolls }
      ];
    }

    return NextResponse.json({ title, items, summary }, { status: 200 });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Get all users for the dropdown
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}