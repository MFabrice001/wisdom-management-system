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

    // Create user first
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: 'temp_password', // Will be set later
        nationalId,
        residence,
        gender,
        role: 'USER' // Will be upgraded to ELDER if approved
      }
    });

    // Create elder request
    const elderRequest = await prisma.elderRequest.create({
      data: {
        userId: user.id,
        reason: `Elder application for ${name}`,
        experience: `Application submitted via elder registration form`,
        cvUrl,
        documentsUrl: [documentUrl],
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      applicationId: elderRequest.id 
    });
  } catch (error) {
    console.error('Error creating elder application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}