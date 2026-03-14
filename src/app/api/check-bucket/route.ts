import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        buckets: [],
      });
    }

    // Check if 'images' bucket exists
    const imagesBucket = buckets?.find(bucket => bucket.id === 'images');
    
    return NextResponse.json({
      success: true,
      bucketExists: !!imagesBucket,
      imagesBucket: imagesBucket || null,
      allBuckets: buckets?.map(b => ({
        id: b.id,
        name: b.name,
        public: b.public,
        created_at: b.created_at,
      })) || [],
    });

  } catch (error) {
    console.error('Check bucket error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      buckets: [],
    }, { status: 500 });
  }
}
