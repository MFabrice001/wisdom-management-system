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
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Build date filter
  const dateFilter = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  try {
    let items = [];
    let title = "";
    let summary = null;

    if (type === 'GENERAL_SYSTEM') {
      title = "General System Report";
      
      // Build where clause for date filtering
      const userDateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
      const wisdomDateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
      
      // Get system statistics with date filter
      const [totalUsers, totalWisdoms, totalComments, totalLikes, totalPolls, totalSuggestions, totalCertificates] = await Promise.all([
        prisma.user.count({ where: userDateWhere }),
        prisma.wisdom.count({ where: wisdomDateWhere }),
        prisma.comment.count({ where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {} }),
        prisma.like.count({ where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {} }),
        prisma.poll.count({ where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {} }),
        prisma.suggestion.count({ where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {} }),
        prisma.certificate.count({ where: Object.keys(dateFilter).length > 0 ? { issuedAt: dateFilter } : {} })
      ]);

      // Get users based on date filter or last 30 days
      let userCreatedAtFilter;
      if (Object.keys(dateFilter).length > 0) {
        userCreatedAtFilter = dateFilter;
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        userCreatedAtFilter = { gte: thirtyDaysAgo };
      }
      
      const newUsers = await prisma.user.findMany({
        where: {
          createdAt: userCreatedAtFilter
        },
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      // Get wisdom entries based on date filter or last 30 days
      let wisdomCreatedAtFilter;
      if (Object.keys(dateFilter).length > 0) {
        wisdomCreatedAtFilter = dateFilter;
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        wisdomCreatedAtFilter = { gte: thirtyDaysAgo };
      }
      
      const recentWisdoms = await prisma.wisdom.findMany({
        where: {
          createdAt: wisdomCreatedAtFilter
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
      if (Object.keys(dateFilter).length > 0) {
        whereClause.createdAt = dateFilter;
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
      
      const wisdomWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
      
      const users = await prisma.user.findMany({
        include: {
          wisdoms: {
            where: wisdomWhere
          }
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
      
      const suggestionWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
      
      const suggestions = await prisma.suggestion.findMany({
        where: suggestionWhere,
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
      
      const dateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
      
      const [totalUsers, totalWisdoms, totalComments, totalLikes, totalPolls] = await Promise.all([
        prisma.user.count({ where: dateWhere }),
        prisma.wisdom.count({ where: dateWhere }),
        prisma.comment.count({ where: dateWhere }),
        prisma.like.count({ where: dateWhere }),
        prisma.poll.count({ where: dateWhere })
      ]);

      items = [
        { metric: 'Total Users', value: totalUsers },
        { metric: 'Total Wisdom Entries', value: totalWisdoms },
        { metric: 'Total Comments', value: totalComments },
        { metric: 'Total Likes', value: totalLikes },
        { metric: 'Total Polls', value: totalPolls }
      ];
    }
    else if (type === 'QUIZ_ATTEMPTS') {
      title = "Quiz Attempts Report";
      
      const quizWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
      
      const attempts = await prisma.quizAttempt.findMany({
        where: quizWhere,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const userAttempts = {};
      attempts.forEach(attempt => {
        const userId = attempt.user.id;
        if (!userAttempts[userId]) {
          userAttempts[userId] = {
            userName: attempt.user.name,
            email: attempt.user.email,
            attempts: 0,
            lastScore: 0,
            lastTotal: 0,
            lastPercentage: 0,
            lastDate: attempt.createdAt,
            timeSpent: 0
          };
        }
        userAttempts[userId].attempts++;
        if (new Date(attempt.createdAt) >= new Date(userAttempts[userId].lastDate)) {
          userAttempts[userId].lastScore = attempt.score;
          userAttempts[userId].lastTotal = attempt.totalQuestions;
          userAttempts[userId].lastPercentage = attempt.percentage;
          userAttempts[userId].lastDate = attempt.createdAt;
          userAttempts[userId].timeSpent = attempt.timeSpentMinutes || 0;
        }
      });

      items = Object.values(userAttempts).map(ua => ({
        userName: ua.userName,
        email: ua.email,
        score: ua.lastScore,
        totalQuestions: ua.lastTotal,
        percentage: ua.lastPercentage.toFixed(1),
        timeSpent: ua.timeSpent,
        attempts: ua.attempts,
        date: new Date(ua.lastDate).toLocaleDateString()
      }));
    }
    else if (type === 'CERTIFICATES_BADGES') {
      title = "Certificates & Badges Report";
      
      const certWhere = Object.keys(dateFilter).length > 0 ? { issuedAt: dateFilter } : {};
      const badgeWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
      
      const [certificates, badges] = await Promise.all([
        prisma.certificate.findMany({
          where: certWhere,
          include: {
            user: { select: { name: true, email: true } },
            quizAttempt: { select: { score: true, totalQuestions: true, percentage: true } }
          },
          orderBy: { issuedAt: 'desc' }
        }),
        prisma.awardedBadge.findMany({
          where: badgeWhere,
          include: {
            user: { select: { name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      items = [
        ...certificates.map(cert => ({
          userName: cert.user.name,
          email: cert.user.email,
          type: 'Certificate',
          details: `${cert.certificateNumber} - Score: ${cert.quizAttempt.percentage.toFixed(1)}%`,
          date: new Date(cert.issuedAt).toLocaleDateString()
        })),
        ...badges.map(badge => ({
          userName: badge.user.name,
          email: badge.user.email,
          type: 'Badge',
          details: badge.badgeType,
          date: new Date(badge.createdAt).toLocaleDateString()
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    else if (type === 'POLLS_REPORT') {
      title = "Polls Report";
      
      const pollWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
      
      const polls = await prisma.poll.findMany({
        where: pollWhere,
        include: {
          votes: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      items = polls.map(poll => {
        const now = new Date();
        const endDate = new Date(poll.endDate);
        const isExpired = now > endDate;
        const actualStatus = poll.isActive && !isExpired ? 'Active' : 'Expired';
        
        return {
          question: poll.question,
          totalVotes: poll.votes.length,
          voters: poll.votes.map(v => v.user.name).join(', ') || 'No votes yet',
          status: actualStatus,
          startDate: new Date(poll.startDate).toLocaleDateString(),
          endDate: new Date(poll.endDate).toLocaleDateString()
        };
      });
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