import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// GET - Fetch all wisdom entries with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const language = searchParams.get('language');

    // Build filter conditions
    const where = {
      isPublished: true,
      ...(category && category !== 'ALL' && { category }),
      ...(language && language !== 'ALL' && { language })
    };

    const wisdoms = await prisma.wisdom.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    return NextResponse.json({ wisdoms });
  } catch (error) {
    console.error('Error fetching wisdom:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wisdom entries' },
      { status: 500 }
    );
  }
}

// POST - Create new wisdom entry
export async function POST(request) {
  try {
    console.log('POST /api/wisdom called');

    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 });
    }

    const formData = await request.formData();
    console.log('Request formData received');

    const title = formData.get('title');
    const content = formData.get('content');
    const category = formData.get('category');
    const language = formData.get('language');
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags')) : [];
    const audioUrl = formData.get('audioUrl');
    const imageUrl = formData.get('imageUrl');
    const documentFile = formData.get('document');

    // Validation
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    let documentUrl = null;
    
    // Handle file upload if present
    if (documentFile && documentFile.size > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${documentFile.name}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Save file to disk
      const bytes = await documentFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(filePath, buffer);
      
      // Store relative path in database
      documentUrl = `uploads/${fileName}`;
    }

    // Create wisdom
    const wisdom = await prisma.wisdom.create({
      data: {
        title,
        content,
        category,
        language: language || 'KINYARWANDA',
        tags: tags || [],
        audioUrl: audioUrl || null,
        imageUrl: imageUrl || null,
        documentUrl: documentUrl,
        authorId: session.user.id,
        isPublished: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('Created wisdom:', wisdom);

    return NextResponse.json(wisdom, { status: 201 });
  } catch (error) {
    console.error('Error creating wisdom:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create wisdom entry' },
      { status: 500 }
    );
  }
}