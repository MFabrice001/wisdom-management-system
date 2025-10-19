import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email, secretKey } = await request.json();

    // IMPORTANT: Use a secret key to protect this endpoint
    // Add this to your .env file: ADMIN_SECRET_KEY=your-super-secret-key
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Invalid secret key' }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    return NextResponse.json({ 
      message: 'User promoted to admin successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error making user admin:', error);
    return NextResponse.json(
      { error: 'Failed to make user admin' },
      { status: 500 }
    );
  }
}