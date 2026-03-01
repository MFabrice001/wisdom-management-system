import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const urls = [];

    for (const file of files) {
      // 5MB limit check
      if (file.size > 5 * 1024 * 1024) { 
        return NextResponse.json({ error: 'File size too large' }, { status: 400 });
      }

      // Upload directly to Vercel Blob
      // (Vercel automatically adds a unique random string to the filename so they never overwrite)
      const blob = await put(file.name, file, {
        access: 'public',
      });

      // Push the secure cloud URL to the array
      urls.push(blob.url);
    }

    // Return the URLs exactly how your frontend expects them
    return NextResponse.json({ urls });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}