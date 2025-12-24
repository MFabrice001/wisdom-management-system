import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wisdom = await prisma.wisdom.findUnique({
      where: { id: params.id },
      select: { documentUrl: true, title: true }
    });

    if (!wisdom || !wisdom.documentUrl) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    console.log('Document URL from DB:', wisdom.documentUrl);
    
    // Try multiple possible file locations
    const possiblePaths = [
      path.join(process.cwd(), 'public', wisdom.documentUrl), // New format: uploads/timestamp-file.ext
      path.join(process.cwd(), 'public', 'uploads', wisdom.documentUrl), // Old filename in uploads
      path.join(process.cwd(), wisdom.documentUrl), // Direct path
      wisdom.documentUrl // Absolute path
    ];
    
    let filePath = null;
    for (const testPath of possiblePaths) {
      console.log('Checking path:', testPath);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        console.log('Found file at:', filePath);
        break;
      }
    }
    
    if (!filePath) {
      return NextResponse.json({ 
        error: 'File no longer available',
        message: 'This file was uploaded before the file storage system was properly configured. Please re-upload the document to make it available for download.'
      }, { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(wisdom.documentUrl);
    
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', 'application/octet-stream');
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    return response;

  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}