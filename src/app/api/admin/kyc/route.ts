import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, findOne } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { KycVerification, Profile } from '@/types/supabase';

// GET /api/admin/kyc - Get all KYC requests
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const adminSupabase = getSupabaseClient();

    // Build filters
    const filters: any = {};
    if (status && status !== 'all') {
      filters.status = status;
    }

    // Get KYC requests
    const { data: kycRequests } = await findMany<KycVerification>(adminSupabase, 'kyc_verifications', {
      filters,
      orderBy: [{ column: 'submittedAt', ascending: false }]
    });

    // Get user profiles
    const userIds = (kycRequests || []).map(k => k.userId);
    const { data: profiles } = userIds.length > 0 ? await adminSupabase
      .from('profiles')
      .select('user_id, name, email, province_id, regency_id')
      .in('user_id', userIds) : { data: null };

    const profileMap = new Map();
    (profiles || []).forEach(p => {
      profileMap.set(p.user_id, {
        name: p.name,
        email: p.email,
        provinceId: p.province_id,
        regencyId: p.regency_id,
      });
    });

    // Get documents
    const kycIds = (kycRequests || []).map(k => k.id);
    const { data: documents } = kycIds.length > 0 ? await adminSupabase
      .from('kyc_documents')
      .select('id, document_type, document_url, status, kyc_id')
      .in('kyc_id', kycIds) : { data: null };

    const documentMap = new Map();
    (documents || []).forEach(d => {
      if (!documentMap.has(d.kyc_id)) {
        documentMap.set(d.kyc_id, []);
      }
      documentMap.get(d.kyc_id).push({
        id: d.id,
        documentType: d.document_type,
        documentUrl: d.document_url,
        status: d.status,
      });
    });

    // Get provinces and regencies
    const { data: provinces } = await adminSupabase
      .from('provinces')
      .select('id, name');

    const { data: regencies } = await adminSupabase
      .from('regencies')
      .select('id, name');

    const provinceMap = new Map();
    (provinces || []).forEach(p => provinceMap.set(p.id, p.name));

    const regencyMap = new Map();
    (regencies || []).forEach(r => regencyMap.set(r.id, r.name));

    // Filter by search if provided
    let filteredRequests = kycRequests || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRequests = filteredRequests.filter(req => {
        const profile = profileMap.get(req.userId);
        return profile?.name?.toLowerCase().includes(searchLower) ||
          profile?.email?.toLowerCase().includes(searchLower) ||
          req.ktpNumber?.toLowerCase().includes(searchLower);
      });
    }

    // Format response
    const requestsWithLocation = filteredRequests.map(req => {
      const profile = profileMap.get(req.userId) || {};
      return {
        ...req,
        profile: {
          name: profile.name,
          email: profile.email,
          provinceId: profile.provinceId,
          regencyId: profile.regencyId,
        },
        documents: documentMap.get(req.id) || [],
        provinceName: profile.provinceId ? (provinceMap.get(profile.provinceId) || '-') : '-',
        regencyName: profile.regencyId ? (regencyMap.get(profile.regencyId) || '-') : '-',
      };
    });

    return NextResponse.json({
      requests: requestsWithLocation,
      total: requestsWithLocation.length,
    });

  } catch (error) {
    console.error('Error fetching KYC requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
