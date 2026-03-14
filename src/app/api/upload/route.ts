import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Check for single file upload (banner or listing image)
    const singleFile = formData.get('file') as File;
    
    // Check for KYC multiple files
    const ktpImage = formData.get('ktp_image') as File;
    const selfieImage = formData.get('selfie_image') as File;

    // Check upload type
    const uploadType = formData.get('type') as string; // 'banner', 'listing', or undefined for KYC

    // Handle single file upload (banner or listing)
    if (singleFile) {
      // Validate file type
      if (!singleFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
      }

      // Validate file size (max 5MB)
      if (singleFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = singleFile.name.split('.').pop();
      
      let bucketName: string;
      let filename: string;

      // Determine bucket based on type
      if (uploadType === 'listing') {
        filename = `listing-${user.id}-${timestamp}-${randomString}.${extension}`;
        bucketName = 'images';
      } else {
        // Default to banner
        filename = `banner-${timestamp}-${randomString}.${extension}`;
        bucketName = 'images';
      }

      // Upload to Supabase Storage
      const bytes = await singleFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`uploads/${uploadType || 'banner'}/${filename}`, buffer, {
          contentType: singleFile.type,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`uploads/${uploadType || 'banner'}/${filename}`);

      return NextResponse.json({ success: true, url: publicData.publicUrl });
    }

    // Handle KYC multiple files upload
    if (ktpImage && selfieImage) {
      // Validate KTP image
      if (!ktpImage.type.startsWith('image/')) {
        return NextResponse.json({ error: 'KTP file must be an image' }, { status: 400 });
      }
      if (ktpImage.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'KTP file size must be less than 5MB' }, { status: 400 });
      }

      // Validate Selfie image
      if (!selfieImage.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Selfie file must be an image' }, { status: 400 });
      }
      if (selfieImage.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Selfie file size must be less than 5MB' }, { status: 400 });
      }

      // Upload KTP image
      const ktpTimestamp = Date.now();
      const ktpRandomString = Math.random().toString(36).substring(2, 15);
      const ktpExtension = ktpImage.name.split('.').pop();
      const ktpFilename = `ktp-${user.id}-${ktpTimestamp}-${ktpRandomString}.${ktpExtension}`;
      
      const ktpBytes = await ktpImage.arrayBuffer();
      const ktpBuffer = Buffer.from(ktpBytes);

      const { data: ktpData, error: ktpError } = await supabase.storage
        .from('images')
        .upload(`uploads/kyc/${ktpFilename}`, ktpBuffer, {
          contentType: ktpImage.type,
          upsert: false,
        });

      if (ktpError) {
        console.error('KTP upload error:', ktpError);
        return NextResponse.json({ error: 'KTP upload failed' }, { status: 500 });
      }

      // Upload Selfie image
      const selfieTimestamp = Date.now();
      const selfieRandomString = Math.random().toString(36).substring(2, 15);
      const selfieExtension = selfieImage.name.split('.').pop();
      const selfieFilename = `selfie-${user.id}-${selfieTimestamp}-${selfieRandomString}.${selfieExtension}`;
      
      const selfieBytes = await selfieImage.arrayBuffer();
      const selfieBuffer = Buffer.from(selfieBytes);

      const { data: selfieData, error: selfieError } = await supabase.storage
        .from('images')
        .upload(`uploads/kyc/${selfieFilename}`, selfieBuffer, {
          contentType: selfieImage.type,
          upsert: false,
        });

      if (selfieError) {
        console.error('Selfie upload error:', selfieError);
        return NextResponse.json({ error: 'Selfie upload failed' }, { status: 500 });
      }

      // Get public URLs
      const { data: ktpPublicData } = supabase.storage
        .from('images')
        .getPublicUrl(`uploads/kyc/${ktpFilename}`);

      const { data: selfiePublicData } = supabase.storage
        .from('images')
        .getPublicUrl(`uploads/kyc/${selfieFilename}`);

      return NextResponse.json({
        ktp_image_url: ktpPublicData.publicUrl,
        selfie_image_url: selfiePublicData.publicUrl,
      });
    }

    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
