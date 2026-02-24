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
    const status = searchParams.get('status');

    const whereClause = status ? { status } : {};

    const requests = await prisma.elderRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nationalId: true,
            residence: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching elder requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch elder requests' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, status, reviewNote } = await request.json();

    if (!requestId || !status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const elderRequest = await prisma.elderRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewNote,
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      },
      include: {
        user: true
      }
    });

    // If approved, update user role to ELDER
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: elderRequest.userId },
        data: { role: 'ELDER' }
      });
    }

    return NextResponse.json({ 
      message: `Request ${status.toLowerCase()} successfully`,
      request: elderRequest 
    });
  } catch (error) {
    console.error('Error updating elder request:', error);
    return NextResponse.json(
      { error: 'Failed to update elder request' },
      { status: 500 }
    );
  }
}