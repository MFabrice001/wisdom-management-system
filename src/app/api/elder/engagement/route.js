import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ELDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch recent comments on wisdom authored by this Elder
    const comments = await prisma.comment.findMany({
      where: {
        wisdom: {
          authorId: session.user.id
        }
      },
      include: {
        user: { select: { name: true, profileImage: true } },
        wisdom: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Fetch recent likes on wisdom authored by this Elder
    const likes = await prisma.like.findMany({
      where: {
        wisdom: {
          authorId: session.user.id
        }
      },
      include: {
        user: { select: { name: true } },
        wisdom: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({ comments, likes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching engagement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}