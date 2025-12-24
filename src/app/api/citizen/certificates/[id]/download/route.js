import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const certificateId = params.id;

  try {
    const certificate = await prisma.certificate.findFirst({
      where: { 
        id: certificateId,
        userId 
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        quizAttempt: {
          select: {
            score: true,
            totalQuestions: true,
            percentage: true,
            createdAt: true
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Create beautiful PDF certificate
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Background
    doc.setFillColor(245, 248, 255);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Main border
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    
    // Header section
    doc.setFillColor(41, 128, 185);
    doc.rect(20, 20, 257, 25, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPUBLIC OF RWANDA', 148.5, 30, { align: 'center' });
    doc.setFontSize(14);
    doc.text('WISDOM MANAGEMENT SYSTEM', 148.5, 38, { align: 'center' });
    
    // Certificate title
    doc.setTextColor(41, 128, 185);
    doc.setFontSize(24);
    doc.text('CERTIFICATE OF COMPLETION', 148.5, 65, { align: 'center' });
    
    // Main content
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', 148.5, 85, { align: 'center' });
    
    // Name highlight
    doc.setFillColor(46, 204, 113);
    doc.rect(60, 92, 177, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(certificate.user.name.toUpperCase(), 148.5, 100, { align: 'center' });
    
    // Achievement text
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the Rwandan Wisdom Knowledge', 148.5, 115, { align: 'center' });
    
   
    // Generate QR code - use local network IP for mobile access
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-certificate/${certificate.certificateNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 80, margin: 1 });
    
    // Add QR code to PDF
    doc.addImage(qrCodeDataUrl, 'PNG', 250, 160, 25, 25);
    doc.setTextColor(127, 140, 141);
    doc.setFontSize(8);
    doc.text('Scan to verify', 262.5, 190, { align: 'center' });
    
    
    // Certificate details
    doc.setTextColor(127, 140, 141);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Certificate Number: ${certificate.certificateNumber}`, 148.5, 170, { align: 'center' });
    doc.text(`Date Issued: ${new Date(certificate.issuedAt).toLocaleDateString()}`, 148.5, 178, { align: 'center' });
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certificate.certificateNumber}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}