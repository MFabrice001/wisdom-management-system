import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const status = searchParams.get('status') || 'all';

    const skip = (page - 1) * limit;

    // Build filter
    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category !== 'all' && { category }),
      ...(status !== 'all' && { status })
    };

    // Get wisdoms with author info
    const [wisdoms, total] = await Promise.all([
      prisma.wisdom.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { likes: true, comments: true }
          }
        }
      }),
      prisma.wisdom.count({ where })
    ]);

    return NextResponse.json({
      wisdoms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Wisdoms fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch wisdoms' }, { status: 500 });
  }
}