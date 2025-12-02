import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.wisdom.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Wisdom deleted successfully' });
  } catch (error) {
    console.error('Error deleting wisdom:', error);
    return NextResponse.json(
      { error: 'Failed to delete wisdom' },
      { status: 500 }
    );
  }
}