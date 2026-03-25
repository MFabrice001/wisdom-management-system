import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    // 1. Quick check to help debug if the token is missing!
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("Missing BLOB_READ_WRITE_TOKEN");
      return NextResponse.json(
        { error: "Server configuration error: Missing Blob Token. Check Vercel Environment Variables." }, 
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('video');

    if (!file) {
      return NextResponse.json({ error: 'No video file uploaded' }, { status: 400 });
    }

    // Check file type - only allow video formats
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP4, WebM, and MOV videos are allowed.' }, 
        { status: 400 }
      );
    }

    // 50MB limit for videos (Reels feature)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Video size too large (Max 50MB)' }, 
        { status: 400 }
      );
    }

    // Upload video to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Return the video URL
    return NextResponse.json({ url: blob.url });
    
  } catch (error) {
    console.error('Video upload error details:', error);
    return NextResponse.json(
      { error: `Video upload failed: ${error.message}` }, 
      { status: 500 }
    );
  }
}
