import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch ALL suggestions/requests created by this user
    const items = await prisma.suggestion.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Error fetching my requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}