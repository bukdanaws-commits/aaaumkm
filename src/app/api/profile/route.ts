import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, findMany, update, create } from '@/lib/supabase-queries';
import { Profile, KycVerification, KycDocument, Province, Regency, District, Village } from '@/types/supabase';

// GET /api/profile - Get current user's profile and KYC data
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

    // Get profile data
    const { data: profile, error: profileError } = await findOne<Profile>(supabaseClient, 'profiles', user.id);

    // Get region names if IDs exist
    let provinceName = '';
    let regencyName = '';
    let districtName = '';
    let villageName = '';

    if (profile?.provinceId) {
      const { data: province } = await findOne<Province>(supabaseClient, 'provinces', profile.provinceId);
      provinceName = province?.name || '';
    }

    if (profile?.regencyId) {
      const { data: regency } = await findOne<Regency>(supabaseClient, 'regencies', profile.regencyId);
      regencyName = regency?.name || '';
    }

    if (profile?.districtId) {
      const { data: district } = await findOne<District>(supabaseClient, 'districts', profile.districtId);
      districtName = district?.name || '';
    }

    if (profile?.villageId) {
      const { data: village } = await findOne<Village>(supabaseClient, 'villages', profile.villageId);
      villageName = village?.name || '';
    }

    // Get KYC data
    const { data: kyc, error: kycError } = await findOne<KycVerification>(supabaseClient, 'kyc_verifications', user.id);

    // Get KYC documents if KYC exists
    let kycDocuments: KycDocument[] = [];
    if (kyc && !kycError) {
      const { data: documents } = await findMany<KycDocument>(supabaseClient, 'kyc_documents', {
        filters: { kycVerificationId: kyc.id },
      });
      kycDocuments = documents || [];
    }

    // Format KYC data with region names
    const formattedKyc = kyc ? {
      id: kyc.id,
      full_name: profile?.name || '',
      ktp_number: kyc.ktpNumber,
      province: provinceName,
      city: regencyName,
      district: districtName,
      village: villageName,
      full_address: profile?.address || '',
      ktp_image_url: kycDocuments.find(d => d.documentType === 'ktp')?.documentUrl || null,
      selfie_image_url: kycDocuments.find(d => d.documentType === 'selfie')?.documentUrl || null,
      status: kyc.status,
      rejection_reason: kyc.rejectionReason,
    } : null;

    // Use KYC data as fallback for profile if profile fields are empty
    const displayName = profile?.name || formattedKyc?.full_name || null;
    const displayPhone = profile?.phone || null;
    const displayAddress = profile?.address || formattedKyc?.full_address || null;

    return NextResponse.json({
      profile: {
        id: profile?.id || '',
        name: displayName,
        email: user.email || null,
        phone_number: displayPhone,
        address: displayAddress,
        postal_code: profile?.postalCode || null,
        avatar_url: profile?.avatarUrl || null,
      },
      kyc: formattedKyc,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
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
    const { name, phone_number, address, postal_code, avatar_url } = body;

    const supabaseClient = getSupabaseClient();

    // Update profile
    const { data: updatedProfile, error: updateError } = await update<Profile>(supabaseClient, 'profiles', user.id, {
      ...(name !== undefined && { name }),
      ...(phone_number !== undefined && { phone: phone_number }),
      ...(address !== undefined && { address }),
      ...(postal_code !== undefined && { postalCode: postal_code }),
      ...(avatar_url !== undefined && { avatarUrl: avatar_url }),
    });

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile?.id || '',
        name: updatedProfile?.name,
        email: user.email,
        phone_number: updatedProfile?.phone,
        address: updatedProfile?.address,
        postal_code: updatedProfile?.postalCode,
        avatar_url: updatedProfile?.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}