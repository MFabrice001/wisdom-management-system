import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Configure Nodemailer Transporter with your actual credentials
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.SMTP_EMAIL, // Should be 'wisdomsystem20@gmail.com'
    pass: process.env.SMTP_PASSWORD // Should be 'nolrzamyftdlhixk'
  }
});

async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_EMAIL, // Sender address
      to, // List of receivers
      subject, // Subject line
      text, // Plain text body
      // html: '<p>...</p>' // HTML body content
    });
    console.log(`[SUCCESS] Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to send email to ${to}:`, error);
    return false;
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ELDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, date, link } = await req.json();

    // 1. Create Meeting in DB
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        date: new Date(date),
        link,
        hostId: session.user.id,
      },
    });

    // 2. Fetch all Citizens (USER role)
    const citizens = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { email: true, name: true }
    });

    // 3. Send Notifications
    // We iterate through citizens and send an email to each
    const emailPromises = citizens.map(citizen => {
      const subject = `New Wisdom Session: ${title}`;
      const body = `Muraho ${citizen.name},\n\nElder ${session.user.name} has scheduled a live session titled "${title}".\n\nDate: ${new Date(date).toLocaleString()}\nLink: ${link}\n\nDescription: ${description || 'Join us to learn!'}\n\nSee you there,\nUmurage Wubwenge Team`;
      return sendEmail(citizen.email, subject, body);
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    return NextResponse.json({ 
      success: true, 
      meeting, 
      notifiedCount: citizens.length 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}