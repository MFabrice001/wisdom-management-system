import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { action, note } = await request.json();

    const elderRequest = await prisma.elderRequest.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!elderRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.elderRequest.update({
      where: { id },
      data: {
        status: action,
        reviewedBy: session.user.id,
        reviewNote: note || null,
        reviewedAt: new Date()
      }
    });

    if (action === 'APPROVED') {
      await prisma.user.update({
        where: { id: elderRequest.userId },
        data: { role: 'ELDER' }
      });
    }

    return NextResponse.json({ message: 'Request processed successfully' });
  } catch (error) {
    console.error('Error processing elder request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
