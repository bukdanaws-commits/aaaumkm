import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findOne, findMany, create, update } from '@/lib/supabase-queries';
import { fetchSlikData, calculateSlikScore, type SlikOjkData, type SlikOjkScore } from '@/lib/integrations/slik-ojk';
import {
  fetchFacebookData,
  fetchInstagramData,
  fetchLinkedInData,
  calculateSocialMediaScore,
  analyzeSocialMediaPatterns,
} from '@/lib/integrations/social-media';
import { predictCreditScore, AIFeatures } from '@/lib/ai/credit-scoring-ai';
import { Profile, CreditScore } from '@/types/supabase';

/**
 * AI-Powered Credit Score Calculation
 * POST /api/credit-score/ai-calculate
 * 
 * Integrates:
 * 1. Platform data (transactions, ratings, etc.)
 * 2. SLIK OJK data (credit history)
 * 3. Social media data (Facebook, Instagram, LinkedIn)
 * 4. AI model prediction
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body (optional social media tokens)
    const body = await request.json();
    const {
      facebookToken,
      instagramToken,
      linkedinToken,
      ktpNumber, // For SLIK OJK lookup
    } = body;

    const adminSupabase = getSupabaseClient();

    // 1. Fetch platform data
    const { data: profile } = await findOne<Profile>(adminSupabase, 'profiles', user.id);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get related data
    const { data: umkmProfile } = await adminSupabase
      .from('umkm_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: kyc } = await adminSupabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: listings } = await adminSupabase
      .from('listings')
      .select('id')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    const { data: orders } = await adminSupabase
      .from('orders')
      .select('id, total_amount')
      .eq('seller_id', user.id)
      .eq('status', 'completed');

    // 2. Fetch SLIK OJK data (if KTP number provided)
    let slikData: SlikOjkData | null = null;
    let slikScore: SlikOjkScore | null = null;
    if (ktpNumber && kyc?.status === 'approved') {
      slikData = await fetchSlikData(ktpNumber);
      slikScore = calculateSlikScore(slikData);
    }

    // 3. Fetch social media data (if tokens provided)
    const socialMediaData: any = {};
    if (facebookToken) {
      socialMediaData.facebook = await fetchFacebookData(facebookToken);
    }
    if (instagramToken) {
      socialMediaData.instagram = await fetchInstagramData(instagramToken);
    }
    if (linkedinToken) {
      socialMediaData.linkedin = await fetchLinkedInData(linkedinToken);
    }

    const socialMediaScore = calculateSocialMediaScore(socialMediaData);
    const socialMediaAnalysis = analyzeSocialMediaPatterns(socialMediaData);

    // 4. Prepare AI features
    const createdAt = profile.createdAt ? new Date(profile.createdAt) : new Date();
    const businessDurationMonths = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    const completedOrders = (orders || []).length;
    const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const monthlyAverageRevenue = businessDurationMonths > 0 ? totalRevenue / businessDurationMonths : 0;
    const activeListings = (listings || []).length;

    const aiFeatures: AIFeatures = {
      // Platform data
      businessDurationMonths,
      totalRevenue,
      monthlyAverageRevenue,
      transactionCount: completedOrders,
      activeListings,
      averageRating: profile.average_rating || 0,
      totalReviews: profile.total_reviews || 0,
      completionRate: completedOrders > 0 ? 1.0 : 0,
      responseRate: 0.85,
      disputeRate: 0.02,
      
      // SLIK OJK data
      slikCreditScore: slikData?.creditScore || 0,
      slikTotalDebt: slikData?.totalDebt || 0,
      slikMonthlyInstallment: slikData?.monthlyInstallment || 0,
      slikActiveLoans: slikData?.activeLoans || 0,
      slikOnTimePaymentRate: slikData
        ? slikData.paymentHistory.onTime /
          (slikData.paymentHistory.onTime + slikData.paymentHistory.late + slikData.paymentHistory.defaulted || 1)
        : 0,
      slikDebtToIncomeRatio: monthlyAverageRevenue > 0
        ? (slikData?.monthlyInstallment || 0) / monthlyAverageRevenue
        : 0,
      slikKolektibilitas: slikData?.creditScore || 0,
      
      // Social media data
      facebookFriendsCount: socialMediaData.facebook?.friendsCount || 0,
      facebookHasBusinessPage: socialMediaData.facebook?.hasBusinessPage ? 1 : 0,
      instagramFollowersCount: socialMediaData.instagram?.followersCount || 0,
      instagramEngagementRate: socialMediaData.instagram?.engagementRate || 0,
      linkedinConnectionsCount: socialMediaData.linkedin?.connectionsCount || 0,
      socialMediaVerified:
        (socialMediaData.facebook?.verified ? 1 : 0) +
        (socialMediaData.instagram?.verified ? 1 : 0) +
        (socialMediaData.linkedin?.verified ? 1 : 0) > 0
          ? 1
          : 0,
      socialMediaSuspicious: socialMediaAnalysis.isSuspicious ? 1 : 0,
      
      // KYC & documents
      kycVerified: profile.is_kyc_verified ? 1 : 0,
      hasNPWP: umkmProfile?.npwp ? 1 : 0,
      hasNIB: umkmProfile?.nib ? 1 : 0,
      umkmVerified: umkmProfile?.is_verified ? 1 : 0,
      documentCompleteness: calculateDocumentCompleteness(profile, umkmProfile),
      
      // Behavioral data
      loginFrequency: 15,
      avgSessionDuration: 25,
      mobileAppUsage: 1,
      nighttimeActivity: 0.1,
      locationConsistency: 0.9,
    };

    // 5. Run AI prediction
    const aiPrediction = predictCreditScore(aiFeatures);

    // 6. Save to database
    const creditScoreData = {
      user_id: user.id,
      total_score: aiPrediction.score,
      business_duration_score: Math.round(aiFeatures.businessDurationMonths / 36 * 15),
      revenue_score: Math.round(Math.min(totalRevenue / 25000000, 1) * 20),
      transaction_score: Math.round(Math.min(completedOrders / 100, 1) * 20),
      rating_score: Math.round(((profile.average_rating || 0) / 5) * 15),
      kyc_score: profile.is_kyc_verified ? 10 : 0,
      asset_score: calculateAssetScore(umkmProfile),
      payment_history_score: slikScore?.paymentBehaviorScore || 0,
      eligibility_status: getEligibilityStatus(aiPrediction.score),
      risk_level: aiPrediction.riskLevel,
      recommended_loan_amount: calculateRecommendedLoan(aiPrediction.score, totalRevenue),
      last_calculated_at: new Date().toISOString(),
    };

    // Check if exists and upsert
    const { data: existingScore } = await adminSupabase
      .from('credit_scores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingScore) {
      await update<CreditScore>(adminSupabase, 'credit_scores', user.id, creditScoreData);
    } else {
      await create<CreditScore>(adminSupabase, 'credit_scores', creditScoreData);
    }

    // Fetch the saved record
    const { data: creditScore } = await findOne<CreditScore>(adminSupabase, 'credit_scores', user.id);

    return NextResponse.json({
      success: true,
      creditScore,
      aiPrediction: {
        score: aiPrediction.score,
        probability: aiPrediction.probability,
        riskLevel: aiPrediction.riskLevel,
        confidence: aiPrediction.confidence,
        explainability: aiPrediction.explainability,
        recommendations: aiPrediction.recommendations,
      },
      dataSources: {
        platform: true,
        slik: !!slikData,
        socialMedia: {
          facebook: !!socialMediaData.facebook,
          instagram: !!socialMediaData.instagram,
          linkedin: !!socialMediaData.linkedin,
        },
      },
      socialMediaAnalysis: socialMediaAnalysis.isSuspicious
        ? {
            warning: 'Pola media sosial mencurigakan terdeteksi',
            reasons: socialMediaAnalysis.reasons,
          }
        : null,
    });
  } catch (error) {
    console.error('Error calculating AI credit score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function calculateDocumentCompleteness(profile: any, umkmProfile: any): number {
  let score = 0;
  let total = 0;

  if (profile.name) score++;
  total++;
  if (profile.phone) score++;
  total++;
  if (profile.address) score++;
  total++;
  if (profile.is_kyc_verified) score++;
  total++;
  if (umkmProfile) score++;
  total++;

  return score / total;
}

function calculateAssetScore(umkmProfile: any): number {
  let score = 0;
  if (umkmProfile) {
    score += 3;
    if (umkmProfile.npwp) score += 3;
    if (umkmProfile.nib) score += 2;
    if (umkmProfile.is_verified) score += 2;
  }
  return Math.min(score, 10);
}

function getEligibilityStatus(score: number): string {
  if (score >= 85) return 'highly_eligible';
  if (score >= 70) return 'eligible';
  if (score >= 50) return 'review_needed';
  return 'not_eligible';
}

function calculateRecommendedLoan(score: number, totalSales: number): number {
  let maxLoan = 0;
  if (score >= 85) {
    maxLoan = Math.min(totalSales * 0.6, 50000000);
  } else if (score >= 70) {
    maxLoan = Math.min(totalSales * 0.4, 25000000);
  } else if (score >= 50) {
    maxLoan = Math.min(totalSales * 0.2, 10000000);
  }
  return Math.floor(maxLoan / 1000000) * 1000000;
}
