import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, nationalId, residence } = body;

    // 1. Basic Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // 2. Email Validation (Gmail only as requested)
    if (!email.endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: 'Please use a valid @gmail.com address' },
        { status: 400 }
      );
    }

    // 3. Password Length Validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // 4. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // 5. Determine Role and Validate Elder Fields
    let roleToAssign = 'USER'; // Default to Citizen
    
    if (role === 'ELDER') {
        roleToAssign = 'ELDER';
        
        // Elder specific validation
        if (!nationalId || !residence) {
            return NextResponse.json(
                { error: 'National ID and Residence are required for Elders' }, 
                { status: 400 }
            );
        }

        // Check if NID is unique
        const existingNid = await prisma.user.findUnique({
            where: { nationalId }
        });
        if (existingNid) {
            return NextResponse.json(
                { error: 'This National ID is already registered' },
                { status: 400 }
            );
        }
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: roleToAssign,
        // Only save these if role is ELDER
        nationalId: roleToAssign === 'ELDER' ? nationalId : undefined,
        residence: roleToAssign === 'ELDER' ? residence : undefined,
        // Elders might need manual verification (default false)
        isVerified: roleToAssign === 'ELDER' ? false : true 
      }
    });

    // 8. Return success
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}