import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, update } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity, ActivityType } from '@/lib/activityLog';
import { KycVerification, Profile } from '@/types/supabase';

// PATCH /api/admin/kyc/[id] - Approve or reject KYC
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params;
    
    console.log('🔍 KYC Approval API called');
    console.log('KYC ID:', id);
    
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('User:', user?.email);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, rejectionReason } = body; // action: 'approve' or 'reject'
    
    console.log('Action:', action);
    console.log('Rejection Reason:', rejectionReason);

    if (!action || !['approve', 'reject'].includes(action)) {
      console.log('❌ Invalid action');
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseClient();

    // Get KYC request
    console.log('Fetching KYC request...');
    const { data: kycRequest, error: kycError } = await findOne<KycVerification>(adminSupabase, 'kyc_verifications', id);

    console.log('KYC Request found:', kycRequest ? 'Yes' : 'No');

    if (kycError || !kycRequest) {
      console.log('❌ KYC request not found');
      return NextResponse.json(
        { error: 'KYC request not found' },
        { status: 404 }
      );
    }

    // Get profile for logging
    const { data: profile } = await findOne<Profile>(adminSupabase, 'profiles', kycRequest.userId);

    // Update KYC status
    console.log('Updating KYC status...');
    await update<KycVerification>(adminSupabase, 'kyc_verifications', id, {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString(),
      rejectionReason: action === 'reject' ? rejectionReason : null,
    });

    // Update profile isKycVerified if approved
    if (action === 'approve') {
      console.log('Updating profile isKycVerified...');
      await update<Profile>(adminSupabase, 'profiles', kycRequest.userId, {
        isKycVerified: true,
      });
      console.log('✅ Profile updated');
    }

    // Log activity
    console.log('Logging activity...');
    await logActivity({
      userId: user.id,
      userEmail: user.email || 'admin',
      action: action === 'approve' ? ActivityType.APPROVE_KYC : ActivityType.REJECT_KYC,
      description: `${action === 'approve' ? 'Menyetujui' : 'Menolak'} KYC untuk ${profile?.name || profile?.email || 'user'}`,
      metadata: {
        kycId: id,
        targetUserId: kycRequest.userId,
        rejectionReason: action === 'reject' ? rejectionReason : undefined,
      }
    });
    
    console.log('✅ Activity logged');
    console.log('✅ KYC approval successful');

    return NextResponse.json({
      success: true,
      kyc: {
        ...kycRequest,
        status: action === 'approve' ? 'approved' : 'rejected',
      },
    });

  } catch (error) {
    console.error('❌ Error updating KYC:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
