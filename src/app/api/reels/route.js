import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch all wisdom entries with videos (Reels)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Fetch wisdom entries that have video URLs
    const reels = await prisma.wisdom.findMany({
      where: {
        isPublished: true,
        videoUrl: {
          not: null
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    // Get total count for pagination
    const total = await prisma.wisdom.count({
      where: {
        isPublished: true,
        videoUrl: {
          not: null
        }
      }
    });

    return NextResponse.json({ reels, total, hasMore: offset + limit < total });
  } catch (error) {
    console.error('Error fetching reels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reels' },
      { status: 500 }
    );
  }
}
