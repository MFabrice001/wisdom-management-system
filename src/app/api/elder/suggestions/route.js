import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    // Authorization: Elder or Admin
    if (!session || (session.user.role !== 'ELDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch ALL suggestions (both general and requests)
    // We order by newest first
    const suggestions = await prisma.suggestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({ suggestions }, { status: 200 });

  } catch (error) {
    console.error('Error fetching suggestions for elder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}