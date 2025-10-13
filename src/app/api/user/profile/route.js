// src/app/api/user/profile/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';



// GET - Fetch user profile data
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    // Fetch user with all related data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        role: true,
        createdAt: true,
      }
    });

    // Get user's wisdom entries
    const wisdoms = await prisma.wisdom.findMany({
      where: { authorId: session.user.id },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate stats
    const wisdomCount = wisdoms.length;
    const totalLikes = wisdoms.reduce((sum, w) => sum + w._count.likes, 0);
    const totalViews = wisdoms.reduce((sum, w) => sum + w.views, 0);
    
    const commentCount = await prisma.comment.count({
      where: { userId: session.user.id }
    });

    const stats = {
      wisdomCount,
      totalLikes,
      totalViews,
      commentCount,
    };

    return NextResponse.json(
      { user, wisdoms, stats },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, bio } = body;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        bio: bio || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
      }
    });

    return NextResponse.json(
      { message: 'Profile updated successfully', user: updatedUser },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}