import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { name, email, nationalId, residence, gender, cvUrl, documentUrl } = await request.json();

    // Validation
    if (!name || !email || !nationalId || !residence || !gender || !cvUrl || !documentUrl) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Create elder application record
    const application = await prisma.elderApplication.create({
      data: {
        name,
        email,
        nationalId,
        residence,
        gender,
        cvUrl,
        documentUrl,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      applicationId: application.id 
    });
  } catch (error) {
    console.error('Error creating elder application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}