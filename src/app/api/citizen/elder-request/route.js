import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const request = await prisma.elderRequest.findFirst({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ request }, { status: 200 });
  } catch (error) {
    console.error('Error fetching elder request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { reason, experience, certificates = [] } = await req.json();

    if (!reason || !experience) {
      return NextResponse.json({ error: 'Reason and experience are required' }, { status: 400 });
    }

    // Check if user already has a pending or approved request
    const existingRequest = await prisma.elderRequest.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    });

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'You already have a pending or approved elder request' 
      }, { status: 400 });
    }

    const request = await prisma.elderRequest.create({
      data: {
        userId: session.user.id,
        reason,
        experience,
        certificates,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error('Error creating elder request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}