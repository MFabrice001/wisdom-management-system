import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    console.log(`[DEBUG] API Received Token: "${token}"`);

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
    }

    // DEBUG: Print all users who have a reset token to see if we have a match
    // This is for development debugging only! Remove in production.
    const allTokens = await prisma.user.findMany({
      where: { resetToken: { not: null } },
      select: { email: true, resetToken: true, resetTokenExpiry: true }
    });
    console.log("[DEBUG] Current Reset Tokens in DB:", JSON.stringify(allTokens, null, 2));

    // 1. Find user with valid token
    // We temporarily remove the expiry check to see if the token exists at all
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token
      }
    });

    if (!user) {
      console.log(`[DEBUG] Token "${token}" not found in DB.`);
      return NextResponse.json({ error: 'Invalid reset token.' }, { status: 400 });
    }

    console.log(`[DEBUG] User found: ${user.email}. Checking expiry...`);
    
    // Check expiry manually
    if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
         console.log(`[DEBUG] Token expired. Expiry: ${user.resetTokenExpiry}, Now: ${new Date()}`);
         return NextResponse.json({ error: 'Reset token has expired.' }, { status: 400 });
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update User
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}