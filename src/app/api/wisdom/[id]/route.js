// src/app/api/wisdom/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single wisdom entry
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Increment view count
    await prisma.wisdom.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    // Fetch wisdom with all related data
    const wisdom = await prisma.wisdom.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          }
        }
      }
    });

    if (!wisdom) {
      return NextResponse.json(
        { error: 'Wisdom not found' },
        { status: 404 }
      );
    }

    // Check if current user has liked/bookmarked
    let isLiked = false;
    let isBookmarked = false;

    if (session) {
      const like = await prisma.like.findUnique({
        where: {
          userId_wisdomId: {
            userId: session.user.id,
            wisdomId: id
          }
        }
      });
      isLiked = !!like;

      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_wisdomId: {
            userId: session.user.id,
            wisdomId: id
          }
        }
      });
      isBookmarked = !!bookmark;
    }

    return NextResponse.json({ 
      wisdom, 
      isLiked, 
      isBookmarked 
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching wisdom:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wisdom' },
      { status: 500 }
    );
  }
}