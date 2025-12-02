// src/app/api/wisdom/[id]/bookmark/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';


export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to bookmark' },
        { status: 401 }
      );
    }

    const { id: wisdomId } = params;

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_wisdomId: {
          userId: session.user.id,
          wisdomId: wisdomId
        }
      }
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id
        }
      });

      return NextResponse.json({ bookmarked: false }, { status: 200 });
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          wisdomId: wisdomId
        }
      });

      return NextResponse.json({ bookmarked: true }, { status: 200 });
    }

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}