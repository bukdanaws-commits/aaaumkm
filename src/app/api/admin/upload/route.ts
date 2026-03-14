import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkUserRole } from '@/lib/auth/checkRole';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const POSITION_DIMENSIONS: Record<string, { width: number; height: number }> = {
  'marketplace-top': { width: 800, height: 150 },
  'marketplace-inline': { width: 800, height: 150 },
  'marketplace-sidebar': { width: 400, height: 150 },
  'marketplace-inline-sidebar': { width: 400, height: 150 },
  'home-center': { width: 800, height: 150 },
  'home-inline': { width: 800, height: 150 },
  'home-center-sidebar': { width: 400, height: 150 },
  'home-inline-sidebar': { width: 400, height: 150 },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const position = formData.get('position') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!position || !POSITION_DIMENSIONS[position]) {
      return NextResponse.json({ error: 'Invalid position' }, { status: 400 });
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const dimensions = POSITION_DIMENSIONS[position];
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with sharp - auto crop to fit dimensions
    const processedImage = await sharp(buffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover', // Crop to fill the dimensions
        position: 'center', // Crop from center
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'banners');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${position}-${timestamp}.jpg`;
    const filepath = join(uploadDir, filename);

    // Save file
    await writeFile(filepath, processedImage);

    const url = `/uploads/banners/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
