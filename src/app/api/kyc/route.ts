import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-client';
import { findOne, findMany, update, create } from '@/lib/supabase-queries';
import { KycVerification, KycDocument, Profile } from '@/types/supabase';

// GET /api/kyc - Get current user's KYC data
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseClient = getSupabaseClient();

    // Get KYC data from database
    const { data: kyc, error: kycError } = await findOne<KycVerification>(supabaseClient, 'kyc_verifications', user.id);

    if (kycError && kycError.code !== 'PGRST116') {
      throw kycError;
    }

    // Get documents if KYC exists
    let documents: KycDocument[] = [];
    if (kyc) {
      const { data: docs, error: docsError } = await findMany<KycDocument>(supabaseClient, 'kyc_documents', {
        filters: { kycVerificationId: kyc.id },
      });
      if (docsError) throw docsError;
      documents = docs || [];
    }

    // Get profile data for region info
    const { data: profile, error: profileError } = await findOne<Profile>(supabaseClient, 'profiles', user.id);

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // Format response to match frontend expectations
    const formattedKyc = kyc ? {
      id: kyc.id,
      userId: kyc.userId,
      status: kyc.status,
      full_name: profile?.name || '',
      ktp_number: kyc.ktpNumber,
      provinceId: profile?.provinceId || '',
      regencyId: profile?.regencyId || '',
      districtId: profile?.districtId || '',
      villageId: profile?.villageId || '',
      full_address: profile?.address || '',
      rejection_reason: kyc.rejectionReason,
      created_at: kyc.createdAt,
      updated_at: kyc.updatedAt,
    } : null;

    return NextResponse.json({ kyc: formattedKyc });
  } catch (error) {
    console.error('Error fetching KYC:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/kyc - Submit KYC verification
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      full_name,
      ktp_number,
      phone_number,
      provinceId,
      regencyId,
      districtId,
      villageId,
      full_address,
      ktp_image_url,
      selfie_image_url,
    } = body;

    // Validate required fields
    if (!full_name || !ktp_number || !phone_number || !provinceId || !regencyId || !ktp_image_url || !selfie_image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const supabaseAdmin = getSupabaseAdmin();

    // Check if KYC already exists
    const { data: existingKyc, error: existingError } = await findOne<KycVerification>(supabaseClient, 'kyc_verifications', user.id);

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    let kycRecord: KycVerification | null = null;

    if (existingKyc) {
      // Update existing KYC
      const { data: updatedKyc, error: updateError } = await update<KycVerification>(supabaseAdmin, 'kyc_verifications', user.id, {
        ktpNumber: ktp_number,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        rejectionReason: null,
      });

      if (updateError) throw updateError;
      kycRecord = updatedKyc;

      // Delete old documents
      await supabaseAdmin
        .from('kyc_documents')
        .delete()
        .eq('kycVerificationId', kycRecord.id);
    } else {
      // Create new KYC
      const { data: newKyc, error: createError } = await create<KycVerification>(supabaseAdmin, 'kyc_verifications', {
        userId: user.id,
        ktpNumber: ktp_number,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });

      if (createError) throw createError;
      kycRecord = newKyc;
    }

    // Create KYC documents
    const { error: docsError } = await supabaseAdmin.from('kyc_documents').insert([
      {
        kycVerificationId: kycRecord!.id,
        documentType: 'ktp',
        documentUrl: ktp_image_url,
        status: 'pending',
      },
      {
        kycVerificationId: kycRecord!.id,
        documentType: 'selfie',
        documentUrl: selfie_image_url,
        status: 'pending',
      },
    ]);

    if (docsError) throw docsError;

    // Update profile with region and address data
    const { error: profileUpdateError } = await update<Profile>(supabaseAdmin, 'profiles', user.id, {
      name: full_name,
      phone: phone_number,
      provinceId,
      regencyId,
      districtId,
      villageId,
      address: full_address,
    });

    if (profileUpdateError) throw profileUpdateError;

    // Fetch updated KYC
    const { data: updatedKyc, error: fetchError } = await findOne<KycVerification>(supabaseClient, 'kyc_verifications', user.id);

    if (fetchError) throw fetchError;

    // Get profile data
    const { data: profile, error: profileError } = await findOne<Profile>(supabaseClient, 'profiles', user.id);

    if (profileError) throw profileError;

    // Format response
    const formattedKyc = {
      id: updatedKyc!.id,
      userId: updatedKyc!.userId,
      status: updatedKyc!.status,
      full_name: profile?.name || '',
      ktp_number: updatedKyc!.ktpNumber,
      provinceId: profile?.provinceId || '',
      regencyId: profile?.regencyId || '',
      districtId: profile?.districtId || '',
      villageId: profile?.villageId || '',
      full_address: profile?.address || '',
      rejection_reason: updatedKyc!.rejectionReason,
      created_at: updatedKyc!.createdAt,
      updated_at: updatedKyc!.updatedAt,
    };

    return NextResponse.json({
      success: true,
      kyc: formattedKyc,
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}