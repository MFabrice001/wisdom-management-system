import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') || 'PENDING';
    const statuses = statusParam.includes(',') ? statusParam.split(',') : [statusParam];

    const requests = await prisma.elderRequest.findMany({
      where: { 
        status: {
          in: statuses
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nationalId: true,
            residence: true,
            gender: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching elder requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, action } = await request.json();

    if (!userId || !action || !['approve', 'deny'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Find the elder request
    const elderRequest = await prisma.elderRequest.findFirst({
      where: { 
        userId,
        status: 'PENDING'
      },
      include: {
        user: true
      }
    });

    if (!elderRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    // Update elder request status
    await prisma.elderRequest.update({
      where: { id: elderRequest.id },
      data: {
        status: newStatus,
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      }
    });

    // If approved, update user role to ELDER and set temporary password
    if (action === 'approve') {
      // Generate a secure temporary password that meets requirements
      const tempPassword = 'Elder' + Math.floor(Math.random() * 9000 + 1000);
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      await prisma.user.update({
        where: { id: userId },
        data: { 
          role: 'ELDER',
          password: hashedPassword,
          requirePasswordChange: true,
          approvedCategory: elderRequest.category // <-- FIX: Saves the category to the User model
        }
      });
      
      elderRequest.user.tempPassword = tempPassword;
    }

    // Send email notification
    await sendNotificationEmail(elderRequest.user, action);

    return NextResponse.json({ message: 'Request processed successfully' });
  } catch (error) {
    console.error('Error processing elder request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

async function sendNotificationEmail(user, action) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const isApproved = action === 'approve';
    const subject = isApproved 
      ? 'Elder Application Approved - Umurage Wubwenge'
      : 'Elder Application Update - Umurage Wubwenge';

    const htmlContent = isApproved 
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #22c55e; text-align: center;">🎉 Congratulations! Your Elder Application has been Approved</h2>
          <p>Dear ${user.name},</p>
          <p>We are pleased to inform you that your application to become an Elder in the Umurage Wubwenge community has been <strong>approved</strong>.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">🔐 Your Login Credentials</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${user.tempPassword}</code></p>
            <p style="color: #dc2626; font-size: 14px;">⚠️ You will be required to change this password on your first login for security.</p>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">🚀 How to Access Your Elder Dashboard</h3>
            <ol>
              <li>Visit: <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="color: #2563eb;">${process.env.NEXT_PUBLIC_APP_URL}/login</a></li>
              <li>Select <strong>"Elder"</strong> as your role</li>
              <li>Enter your email and temporary password</li>
              <li>Create a new secure password when prompted</li>
              <li>Access your Elder dashboard and start contributing!</li>
            </ol>
          </div>
          
          <p>As an Elder, you can now:</p>
          <ul>
            <li>📝 Share wisdom and knowledge with the community</li>
            <li>💬 Engage with citizen questions and suggestions</li>
            <li>🤝 Participate in community meetings</li>
            <li>📊 Access Elder-specific features and analytics</li>
          </ul>
          
          <p>Welcome to the Elder community! We look forward to your valuable contributions.</p>
          <p>Best regards,<br><strong>Umurage Wubwenge Team</strong></p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Elder Application Update</h2>
          <p>Dear ${user.name},</p>
          <p>Thank you for your interest in becoming an Elder in the Umurage Wubwenge community.</p>
          <p>After careful review, we regret to inform you that your application has not been approved at this time.</p>
          <p>You are welcome to reapply in the future with additional qualifications or experience.</p>
          <p>Best regards,<br>Umurage Wubwenge Team</p>
        </div>
      `;

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject,
      html: htmlContent
    });
    
    console.log(`Email sent successfully to ${user.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error to prevent API failure
  }
}