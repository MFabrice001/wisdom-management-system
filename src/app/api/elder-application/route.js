import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { name, email, nationalId, residence, gender, category, qualifications, cvUrl, documentUrls } = await request.json();

    // Validation
    if (!name || !email || !nationalId || !residence || !gender || !category || !qualifications || !cvUrl || !documentUrls || !Array.isArray(documentUrls) || !documentUrls.length) {
      return NextResponse.json({ error: 'All fields are required including at least one supporting document' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Check if nationalId already exists
    const existingNationalId = await prisma.user.findUnique({
      where: { nationalId }
    });

    if (existingNationalId) {
      return NextResponse.json({ error: 'National ID already registered' }, { status: 400 });
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
        category,
        qualifications,
        reason: `Elder application for ${name} in ${category}`,
        experience: qualifications,
        cvUrl,
        documentsUrl: documentUrls,
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
      { error: `Failed to submit application: ${error.message}` },
      { status: 500 }
    );
  }
}