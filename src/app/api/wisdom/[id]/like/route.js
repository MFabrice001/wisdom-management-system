// src/app/api/wisdom/[id]/like/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';


export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to like' },
        { status: 401 }
      );
    }

    const { id: wisdomId } = params;

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_wisdomId: {
          userId: session.user.id,
          wisdomId: wisdomId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });

      return NextResponse.json({ liked: false }, { status: 200 });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          wisdomId: wisdomId
        }
      });

      return NextResponse.json({ liked: true }, { status: 200 });
    }

  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}