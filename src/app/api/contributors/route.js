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
          }
        },
        wisdoms: {
          select: {
            _count: {
              select: {
                likes: true,
                comments: true // <-- ADDED: Now we fetch the comments on their wisdom
              }
            }
          }
        }
      }
    });

    // Calculate total likes and total comments received for each contributor
    const contributorsWithStats = contributors.map(contributor => ({
      ...contributor,
      totalLikes: contributor.wisdoms.reduce(
        (sum, wisdom) => sum + wisdom._count.likes,
        0
      ),
      _count: {
        wisdoms: contributor._count.wisdoms,
        // <-- CHANGED: Now we sum up the comments their wisdom posts RECEIVED
        comments: contributor.wisdoms.reduce(
          (sum, wisdom) => sum + wisdom._count.comments,
          0
        )
      },
      wisdoms: undefined // Remove wisdoms array from response to keep it clean
    }));

    return NextResponse.json({ contributors: contributorsWithStats });
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributors' },
      { status: 500 }
    );
  }
}