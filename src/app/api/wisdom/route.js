import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { put } from '@vercel/blob';

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
    const images = formData.get('images') ? JSON.parse(formData.get('images')) : [];
    const audioUrl = formData.get('audioUrl');
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
      // 5MB limit check for the document
      if (documentFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Document size too large (Max 5MB)' }, { status: 400 });
      }

      // Upload directly to Vercel Blob
      const blob = await put(documentFile.name, documentFile, {
        access: 'public',
      });
      
      // Store the secure cloud URL in the database
      documentUrl = blob.url;
    }

    // Create wisdom
    const wisdom = await prisma.wisdom.create({
      data: {
        title,
        content,
        category,
        language: language || 'KINYARWANDA',
        tags: tags || [],
        images: images || [],
        audioUrl: audioUrl || null,
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