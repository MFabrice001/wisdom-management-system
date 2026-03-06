import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This is the PUBLIC route for the homepage Contact Us form.
// Do NOT add getServerSession here, or regular visitors won't be able to contact you!

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // 1. Basic Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // 2. Save to the database
    // By saving it here, your Admin Dashboard's /api/admin/contacts route 
    // will automatically pick it up and display it!
    const newContact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'NEW', // This ensures it gets the orange "New" badge in the admin panel
      }
    });

    return NextResponse.json(
      { success: true, message: 'Message sent successfully!' },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}