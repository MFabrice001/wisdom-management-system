import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Authorization: Elder or Admin
    if (!session || (session.user.role !== 'ELDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const { reply } = await req.json();

    if (!reply) return NextResponse.json({ error: 'Reply required' }, { status: 400 });

    const updatedSuggestion = await prisma.suggestion.update({
      where: { id },
      data: {
        reply,
        repliedBy: session.user.name,
        repliedAt: new Date(),
        status: 'REVIEWED'
      }
    });

    return NextResponse.json(updatedSuggestion, { status: 200 });

  } catch (error) {
    console.error('Error replying:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}