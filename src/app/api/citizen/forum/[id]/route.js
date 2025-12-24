import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    // Await params if necessary in Next.js 15, though often auto-resolved in route handlers
    const { id } = params; 

    // Increment view count
    await prisma.forumTopic.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    const topic = await prisma.forumTopic.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, profileImage: true } },
        replies: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { name: true, profileImage: true } }
          }
        }
      }
    });

    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

    return NextResponse.json({ topic }, { status: 200 });
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}