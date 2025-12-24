import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  try {
    // 1. Fetch Real Counts
    const commentsCount = await prisma.comment.count({ where: { userId } });
    const votesCount = await prisma.vote.count({ where: { userId } });
    const bookmarksCount = await prisma.bookmark.count({ where: { userId } });

    // 2. Define Badges with Real Progress
    const badges = [
      {
        id: 'seeker',
        name: { en: 'Wisdom Seeker', rw: 'Ushaka Ubwenge' },
        description: { en: 'Save 5 wisdom entries to your collection.', rw: 'Bika inyandiko 5 z\'ubwenge.' },
        icon: 'book',
        target: 5,
        progress: bookmarksCount,
        earned: bookmarksCount >= 5
      },
      {
        id: 'voice',
        name: { en: 'Active Voice', rw: 'Ijwi Rikora' },
        description: { en: 'Post 5 comments on community stories.', rw: 'Tanga ibitekerezo 5 ku nkuru z\'umuryango.' },
        icon: 'zap',
        target: 5,
        progress: commentsCount,
        earned: commentsCount >= 5
      },
      {
        id: 'pillar',
        name: { en: 'Community Pillar', rw: 'Inkingi y\'Umuryango' },
        description: { en: 'Participate in 3 polls.', rw: 'Witabiye amatora 3.' },
        icon: 'star',
        target: 3,
        progress: votesCount,
        earned: votesCount >= 3
      }
    ];

    // Calculate Level based on badges earned
    const earnedCount = badges.filter(b => b.earned).length;
    const level = 1 + Math.floor(earnedCount / 1); // Simple level logic

    const stats = {
      level,
      points: (commentsCount * 10) + (votesCount * 5) + (bookmarksCount * 5)
    };

    return NextResponse.json({ badges, stats }, { status: 200 });

  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}