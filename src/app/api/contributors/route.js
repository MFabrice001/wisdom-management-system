import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const contributors = await prisma.user.findMany({
      where: {
        wisdoms: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            wisdoms: true,
            comments: true
          }
        },
        wisdoms: {
          select: {
            _count: {
              select: {
                likes: true
              }
            }
          }
        }
      }
    });

    // Calculate total likes for each contributor
    const contributorsWithLikes = contributors.map(contributor => ({
      ...contributor,
      totalLikes: contributor.wisdoms.reduce(
        (sum, wisdom) => sum + wisdom._count.likes,
        0
      ),
      wisdoms: undefined // Remove wisdoms array from response
    }));

    return NextResponse.json({ contributors: contributorsWithLikes });
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributors' },
      { status: 500 }
    );
  }
}