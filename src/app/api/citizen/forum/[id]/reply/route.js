import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: topicId } = params;
    const { content } = await req.json();

    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

    const reply = await prisma.forumReply.create({
      data: {
        content,
        topicId,
        authorId: session.user.id
      },
      include: {
        author: { select: { name: true, profileImage: true } }
      }
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Error posting reply:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}