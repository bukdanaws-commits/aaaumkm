import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list buckets: ' + listError.message,
      }, { status: 500 });
    }

    const existingBucket = buckets?.find(b => b.id === 'images');
    
    if (existingBucket) {
      return NextResponse.json({
        success: true,
        message: 'Bucket "images" already exists',
        bucket: existingBucket,
      });
    }

    // Create new bucket
    const { data, error } = await supabase.storage.createBucket('images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create bucket: ' + error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Bucket "images" created successfully',
      bucket: data,
    });

  } catch (error) {
    console.error('Create bucket error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
