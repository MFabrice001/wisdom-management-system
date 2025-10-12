import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wisdom = await prisma.wisdom.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        comments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, image: true } }
          }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    if (!wisdom) {
      return NextResponse.json({ error: 'Wisdom not found' }, { status: 404 });
    }

    return NextResponse.json(wisdom);

  } catch (error) {
    console.error('Wisdom fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch wisdom' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category, status } = body;

    const updatedWisdom = await prisma.wisdom.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
        ...(status && { status })
      }
    });

    return NextResponse.json(updatedWisdom);

  } catch (error) {
    console.error('Wisdom update error:', error);
    return NextResponse.json({ error: 'Failed to update wisdom' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete wisdom and all related data (cascade)
    await prisma.wisdom.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Wisdom deleted successfully' });

  } catch (error) {
    console.error('Wisdom delete error:', error);
    return NextResponse.json({ error: 'Failed to delete wisdom' }, { status: 500 });
  }
}