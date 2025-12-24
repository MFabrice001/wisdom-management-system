import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

export async function POST(req) {
  try {
    const { email } = await req.json();
    console.log(`[DEBUG] Forgot Password request for: ${email}`);

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Verify User Exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`[DEBUG] User NOT found in database: ${email}`);
      // Return success to user (security), but log failure for dev
      return NextResponse.json({ message: 'If this email exists, a reset link has been sent.' }, { status: 200 });
    }

    console.log(`[DEBUG] User found: ${user.id}. Generating token...`);

    // 2. Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // 3. Send Email
    try {
        const info = await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: 'Password Reset Request - Umurage Wubwenge',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #16a34a;">Password Reset</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Click below to reset your password:</p>
            <a href="${resetLink}" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
        `
        });
        console.log(`[SUCCESS] Email sent to ${email}. Message ID: ${info.messageId}`);
    } catch (mailError) {
        console.error(`[ERROR] Nodemailer failed:`, mailError);
        return NextResponse.json({ error: 'Failed to send email via Gmail' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Reset link sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('[CRITICAL ERROR] Forgot password route failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}