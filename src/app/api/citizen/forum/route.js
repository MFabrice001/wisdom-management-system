import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const topics = await prisma.forumTopic.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } },
        _count: { select: { replies: true } }
      }
    });

    const discussions = topics.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      preview: t.content.substring(0, 100) + (t.content.length > 100 ? '...' : ''),
      author: t.author.name,
      createdAt: t.createdAt,
      replies: t._count.replies,
      views: t.views
    }));

    return NextResponse.json({ discussions }, { status: 200 });
  } catch (error) {
    console.error('Forum fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, category, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const newTopic = await prisma.forumTopic.create({
      data: {
        title,
        category,
        content,
        authorId: session.user.id
      }
    });

    return NextResponse.json(newTopic, { status: 201 });

  } catch (error) {
    console.error('Forum post error:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}