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
        },
        // Include quizzes for youth engagement indicators
        quizzes: {
          select: {
            id: true,
            question: true
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
    
    console.log('Received form data:');
    console.log('title:', title);
    console.log('content:', content);
    console.log('category:', category);
    const language = formData.get('language');
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags')) : [];
    const images = formData.get('images') ? JSON.parse(formData.get('images')) : [];
    const audioUrl = formData.get('audioUrl');
    const documentFile = formData.get('document');
    
    // New: Video/Reels support
    const videoFile = formData.get('video');
    const videoThumbnail = formData.get('videoThumbnail');
    
    // New: Quiz questions for youth engagement
    const quizzes = formData.get('quizzes') ? JSON.parse(formData.get('quizzes')) : [];

    // Validation
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    let documentUrl = null;
    let videoUrl = null;
    
    // Handle document upload if present
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
    
    // Handle video upload if present (for Reels feature)
    if (videoFile && videoFile.size > 0) {
      // 50MB limit for videos
      if (videoFile.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: 'Video size too large (Max 50MB)' }, { status: 400 });
      }

      // Check if BLOB_READ_WRITE_TOKEN is configured
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('Missing BLOB_READ_WRITE_TOKEN environment variable');
        return NextResponse.json(
          { error: 'Server configuration error: Missing Blob Token. Please contact administrator.' },
          { status: 500 }
        );
      }

      try {
        // Upload video to Vercel Blob
        const videoBlob = await put(videoFile.name, videoFile, {
          access: 'public',
        });
        
        videoUrl = videoBlob.url;
        console.log('Video uploaded successfully:', videoUrl);
      } catch (blobError) {
        console.error('Video upload error:', blobError);
        return NextResponse.json(
          { error: `Video upload failed: ${blobError.message}` },
          { status: 500 }
        );
      }
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
        videoUrl: videoUrl,
        videoThumbnail: videoThumbnail || null,
        authorId: session.user.id,
        isPublished: true,
        // Create quizzes if provided
        quizzes: quizzes.length > 0 ? {
          create: quizzes.map((quiz, index) => ({
            question: quiz.question,
            options: quiz.options,
            correctAnswer: quiz.correctAnswer,
            explanation: quiz.explanation || null,
            order: index
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        quizzes: true
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