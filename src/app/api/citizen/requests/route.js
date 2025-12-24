import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// POST: Citizen creates a request
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, details } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Reuse Suggestion model as fallback since WisdomRequest might not be migrated yet.
    // We prefix the title to distinguish requests from general suggestions.
    const request = await prisma.suggestion.create({
      data: {
        title: `[REQUEST] ${topic}`,
        content: details || topic,
        userId: session.user.id,
        status: 'PENDING'
      }
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Elders and Admins view requests
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authorized (Elder or Admin)
    if (!session || (session.user.role !== 'ELDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch suggestions that are marked as requests (via title prefix)
    const requests = await prisma.suggestion.findMany({
      where: {
        title: {
          startsWith: '[REQUEST]'
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}