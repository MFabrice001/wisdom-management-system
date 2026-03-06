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
    const { status } = await request.json();

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { 
        status,
        repliedAt: status === 'READ' ? new Date() : undefined
      }
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
