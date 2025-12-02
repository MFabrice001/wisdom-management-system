// src/app/api/user/check-role/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        role: session.user.role,
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error checking role:', error);
    return NextResponse.json(
      { error: 'Failed to check role' },
      { status: 500 }
    );
  }
}