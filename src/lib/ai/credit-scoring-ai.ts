/**
 * AI-Powered Credit Scoring Model
 * Uses machine learning to predict creditworthiness
 * 
 * Model: Gradient Boosting (simulated)
 * Features: 50+ data points from multiple sources
 * Output: Probability score 0-100 with explainability
 */

import { SlikOjkData, SlikOjkScore } from '../integrations/slik-ojk';
import { SocialMediaData } from '../integrations/social-media';

export interface AIFeatures {
  // Platform Data (20 features)
  businessDurationMonths: number;
  totalRevenue: number;
  monthlyAverageRevenue: number;
  transactionCount: number;
  activeListings: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  responseRate: number;
  disputeRate: number;
  
  // SLIK OJK Data (10 features)
  slikCreditScore: number;
  slikTotalDebt: number;
  slikMonthlyInstallment: number;
  slikActiveLoans: number;
  slikOnTimePaymentRate: number;
  slikDebtToIncomeRatio: number;
  slikKolektibilitas: number; // 1-5
  
  // Social Media Data (10 features)
  facebookFriendsCount: number;
  facebookHasBusinessPage: number; // 0 or 1
  instagramFollowersCount: number;
  instagramEngagementRate: number;
  linkedinConnectionsCount: number;
  socialMediaVerified: number; // 0 or 1
  socialMediaSuspicious: number; // 0 or 1
  
  // KYC & Documents (5 features)
  kycVerified: number; // 0 or 1
  hasNPWP: number; // 0 or 1
  hasNIB: number; // 0 or 1
  umkmVerified: number; // 0 or 1
  documentCompleteness: number; // 0-1
  
  // Behavioral Data (5 features)
  loginFrequency: number; // logins per month
  avgSessionDuration: number; // minutes
  mobileAppUsage: number; // 0 or 1
  nighttimeActivity: number; // 0-1 (suspicious if high)
  locationConsistency: number; // 0-1
}

export interface AIPrediction {
  score: number; // 0-100
  probability: number; // 0-1
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  confidence: number; // 0-1
  explainability: FeatureImportance[];
  recommendations: string[];
}

export interface FeatureImportance {
  feature: string;
  importance: number; // 0-1
  contribution: number; // positive or negative
  description: string;
}

/**
 * Main AI prediction function
 * Simulates a trained ML model (Gradient Boosting)
 */
export function predictCreditScore(features: AIFeatures): AIPrediction {
  // Normalize features
  const normalized = normalizeFeatures(features);
  
  // Calculate weighted score (simulating ML model)
  const rawScore = calculateWeightedScore(normalized);
  
  // Apply non-linear transformation (sigmoid-like)
  const probability = 1 / (1 + Math.exp(-((rawScore - 50) / 15)));
  const score = Math.round(probability * 100);
  
  // Determine risk level
  const riskLevel = getRiskLevel(score);
  
  // Calculate confidence based on data completeness
  const confidence = calculateConfidence(features);
  
  // Generate explainability (SHAP-like values)
  const explainability = generateExplainability(features, normalized);
  
  // Generate recommendations
  const recommendations = generateRecommendations(features, explainability);
  
  return {
    score,
    probability,
    riskLevel,
    confidence,
    explainability,
    recommendations,
  };
}

/**
 * Normalize features to 0-1 range
 */
function normalizeFeatures(features: AIFeatures): Record<string, number> {
  return {
    // Platform features
    businessDuration: Math.min(features.businessDurationMonths / 36, 1),
    revenue: Math.min(features.totalRevenue / 100000000, 1),
    monthlyRevenue: Math.min(features.monthlyAverageRevenue / 10000000, 1),
    transactions: Math.min(features.transactionCount / 200, 1),
    listings: Math.min(features.activeListings / 50, 1),
    rating: features.averageRating / 5,
    reviews: Math.min(features.totalReviews / 100, 1),
    completionRate: features.completionRate,
    responseRate: features.responseRate,
    disputeRate: 1 - features.disputeRate, // Inverse (lower is better)
    
    // SLIK features
    slikScore: (6 - features.slikKolektibilitas) / 5, // Inverse (1 is best)
    slikDebt: 1 - Math.min(features.slikTotalDebt / 100000000, 1), // Inverse
    slikPayment: features.slikOnTimePaymentRate,
    slikLoans: 1 - Math.min(features.slikActiveLoans / 5, 1), // Inverse
    slikRatio: 1 - Math.min(features.slikDebtToIncomeRatio, 1), // Inverse
    
    // Social media features
    fbFriends: Math.min(features.facebookFriendsCount / 1000, 1),
    fbBusiness: features.facebookHasBusinessPage,
    igFollowers: Math.min(features.instagramFollowersCount / 10000, 1),
    igEngagement: features.instagramEngagementRate * 10, // Scale up
    liConnections: Math.min(features.linkedinConnectionsCount / 1000, 1),
    socialVerified: features.socialMediaVerified,
    socialSafe: 1 - features.socialMediaSuspicious, // Inverse
    
    // KYC features
    kyc: features.kycVerified,
    npwp: features.hasNPWP,
    nib: features.hasNIB,
    umkm: features.umkmVerified,
    docs: features.documentCompleteness,
    
    // Behavioral features
    loginFreq: Math.min(features.loginFrequency / 30, 1),
    sessionTime: Math.min(features.avgSessionDuration / 60, 1),
    mobileApp: features.mobileAppUsage,
    nightActivity: 1 - features.nighttimeActivity, // Inverse
    locationConsist: features.locationConsistency,
  };
}

/**
 * Calculate weighted score (simulating trained model weights)
 */
function calculateWeightedScore(normalized: Record<string, number>): number {
  // Weights learned from training data (simulated)
  const weights = {
    // Platform weights (total: 30)
    businessDuration: 4.5,
    revenue: 5.0,
    monthlyRevenue: 4.0,
    transactions: 4.5,
    listings: 2.5,
    rating: 3.5,
    reviews: 2.0,
    completionRate: 2.0,
    responseRate: 1.5,
    disputeRate: 0.5,
    
    // SLIK weights (total: 35)
    slikScore: 10.0,
    slikDebt: 7.0,
    slikPayment: 8.0,
    slikLoans: 5.0,
    slikRatio: 5.0,
    
    // Social media weights (total: 15)
    fbFriends: 2.0,
    fbBusiness: 2.5,
    igFollowers: 2.5,
    igEngagement: 2.0,
    liConnections: 2.5,
    socialVerified: 2.0,
    socialSafe: 1.5,
    
    // KYC weights (total: 12)
    kyc: 4.0,
    npwp: 2.5,
    nib: 2.0,
    umkm: 2.0,
    docs: 1.5,
    
    // Behavioral weights (total: 8)
    loginFreq: 1.5,
    sessionTime: 1.5,
    mobileApp: 1.5,
    nightActivity: 2.0,
    locationConsist: 1.5,
  };
  
  let score = 0;
  for (const [key, value] of Object.entries(normalized)) {
    score += value * (weights[key as keyof typeof weights] || 0);
  }
  
  return score;
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score: number): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
  if (score >= 85) return 'very_low';
  if (score >= 70) return 'low';
  if (score >= 50) return 'medium';
  if (score >= 30) return 'high';
  return 'very_high';
}

/**
 * Calculate model confidence based on data completeness
 */
function calculateConfidence(features: AIFeatures): number {
  let dataPoints = 0;
  let totalPoints = 0;
  
  // Check platform data
  if (features.businessDurationMonths > 0) dataPoints++;
  if (features.totalRevenue > 0) dataPoints++;
  if (features.transactionCount > 0) dataPoints++;
  if (features.averageRating > 0) dataPoints++;
  totalPoints += 4;
  
  // Check SLIK data
  if (features.slikCreditScore > 0) dataPoints += 3;
  totalPoints += 3;
  
  // Check social media
  if (features.facebookFriendsCount > 0) dataPoints++;
  if (features.instagramFollowersCount > 0) dataPoints++;
  if (features.linkedinConnectionsCount > 0) dataPoints++;
  totalPoints += 3;
  
  // Check KYC
  if (features.kycVerified) dataPoints += 2;
  totalPoints += 2;
  
  return dataPoints / totalPoints;
}

/**
 * Generate feature importance (SHAP-like values)
 */
function generateExplainability(
  features: AIFeatures,
  normalized: Record<string, number>
): FeatureImportance[] {
  const importances: FeatureImportance[] = [
    {
      feature: 'SLIK Credit History',
      importance: 0.25,
      contribution: (6 - features.slikKolektibilitas) * 5,
      description: `Kolektibilitas: ${getKolektibilitasLabel(features.slikKolektibilitas)}`,
    },
    {
      feature: 'Total Revenue',
      importance: 0.15,
      contribution: normalized.revenue * 15,
      description: `Rp ${(features.totalRevenue / 1000000).toFixed(1)} juta`,
    },
    {
      feature: 'Transaction Count',
      importance: 0.12,
      contribution: normalized.transactions * 12,
      description: `${features.transactionCount} transaksi`,
    },
    {
      feature: 'SLIK Payment History',
      importance: 0.10,
      contribution: features.slikOnTimePaymentRate * 10,
      description: `${(features.slikOnTimePaymentRate * 100).toFixed(0)}% tepat waktu`,
    },
    {
      feature: 'Business Duration',
      importance: 0.08,
      contribution: normalized.businessDuration * 8,
      description: `${features.businessDurationMonths} bulan`,
    },
    {
      feature: 'KYC Verification',
      importance: 0.07,
      contribution: features.kycVerified * 7,
      description: features.kycVerified ? 'Terverifikasi' : 'Belum verifikasi',
    },
    {
      feature: 'Average Rating',
      importance: 0.06,
      contribution: normalized.rating * 6,
      description: `${features.averageRating.toFixed(1)} / 5.0`,
    },
    {
      feature: 'Social Media Presence',
      importance: 0.05,
      contribution: (normalized.fbFriends + normalized.igFollowers + normalized.liConnections) / 3 * 5,
      description: 'Aktivitas media sosial',
    },
  ];
  
  return importances.sort((a, b) => b.importance - a.importance);
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(
  features: AIFeatures,
  explainability: FeatureImportance[]
): string[] {
  const recommendations: string[] = [];
  
  // Check weak points
  if (!features.kycVerified) {
    recommendations.push('Lengkapi verifikasi KYC untuk meningkatkan skor hingga 7 poin');
  }
  
  if (features.slikKolektibilitas > 2) {
    recommendations.push('Perbaiki riwayat kredit dengan membayar cicilan tepat waktu');
  }
  
  if (features.transactionCount < 20) {
    recommendations.push('Tingkatkan transaksi untuk menunjukkan aktivitas usaha yang konsisten');
  }
  
  if (features.averageRating < 4.0) {
    recommendations.push('Tingkatkan kualitas layanan untuk mendapat rating lebih baik');
  }
  
  if (!features.hasNPWP) {
    recommendations.push('Daftarkan NPWP untuk meningkatkan kredibilitas usaha');
  }
  
  if (features.instagramFollowersCount < 1000 && features.facebookFriendsCount < 500) {
    recommendations.push('Bangun kehadiran media sosial untuk meningkatkan kepercayaan');
  }
  
  if (features.activeListings < 10) {
    recommendations.push('Tambah produk untuk menunjukkan keseriusan usaha');
  }
  
  return recommendations.slice(0, 5); // Top 5 recommendations
}

/**
 * Helper: Get kolektibilitas label
 */
function getKolektibilitasLabel(score: number): string {
  const labels = ['', 'Lancar', 'DPK', 'Kurang Lancar', 'Diragukan', 'Macet'];
  return labels[score] || 'Unknown';
}

/**
 * Batch prediction for multiple users
 */
export async function batchPredict(featuresArray: AIFeatures[]): Promise<AIPrediction[]> {
  return featuresArray.map(features => predictCreditScore(features));
}

/**
 * Model performance metrics (for monitoring)
 */
export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
}

/**
 * Get model performance metrics
 * In production, track these metrics over time
 */
export function getModelMetrics(): ModelMetrics {
  // MOCK: In production, calculate from validation data
  return {
    accuracy: 0.87,
    precision: 0.84,
    recall: 0.82,
    f1Score: 0.83,
    auc: 0.91,
  };
}
