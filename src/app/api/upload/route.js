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
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const urls = [];

    for (const file of files) {
      // 5MB limit check
      if (file.size > 5 * 1024 * 1024) { 
        return NextResponse.json({ error: 'File size too large (Max 5MB)' }, { status: 400 });
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
    console.error('Upload error details:', error);
    // Return the EXACT error to the frontend so we know what is failing instead of a generic message
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` }, 
      { status: 500 }
    );
  }
}