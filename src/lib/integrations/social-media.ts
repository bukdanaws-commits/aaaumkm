/**
 * Social Media Integration for Credit Scoring
 * Analyzes social media presence and engagement
 * 
 * IMPORTANT: Requires user consent and OAuth tokens
 * Complies with GDPR and data privacy regulations
 */

export interface SocialMediaData {
  facebook?: FacebookData;
  instagram?: InstagramData;
  linkedin?: LinkedInData;
  aggregatedScore: number; // 0-15
}

export interface FacebookData {
  userId: string;
  friendsCount: number;
  hasBusinessPage: boolean;
  pageFollowers?: number;
  postFrequency: number; // posts per month
  engagementRate: number; // 0-1
  accountAge: number; // months
  verified: boolean;
}

export interface InstagramData {
  username: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate: number; // 0-1
  hasBusinessAccount: boolean;
  accountAge: number; // months
  verified: boolean;
}

export interface LinkedInData {
  profileId: string;
  connectionsCount: number;
  endorsementsCount: number;
  recommendationsCount: number;
  hasCompanyPage: boolean;
  yearsOfExperience: number;
  educationLevel: string;
  verified: boolean;
}

/**
 * Fetch Facebook data using OAuth token
 * MOCK: In production, use Facebook Graph API
 */
export async function fetchFacebookData(accessToken: string): Promise<FacebookData | null> {
  try {
    // MOCK: Simulate API call
    // In production:
    // const response = await fetch(`https://graph.facebook.com/me?fields=...&access_token=${accessToken}`);
    
    return generateMockFacebookData();
  } catch (error) {
    console.error('Error fetching Facebook data:', error);
    return null;
  }
}

/**
 * Fetch Instagram data using OAuth token
 * MOCK: In production, use Instagram Graph API
 */
export async function fetchInstagramData(accessToken: string): Promise<InstagramData | null> {
  try {
    // MOCK: Simulate API call
    // In production:
    // const response = await fetch(`https://graph.instagram.com/me?fields=...&access_token=${accessToken}`);
    
    return generateMockInstagramData();
  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    return null;
  }
}

/**
 * Fetch LinkedIn data using OAuth token
 * MOCK: In production, use LinkedIn API
 */
export async function fetchLinkedInData(accessToken: string): Promise<LinkedInData | null> {
  try {
    // MOCK: Simulate API call
    // In production:
    // const response = await fetch(`https://api.linkedin.com/v2/me?...`, { headers: { Authorization: `Bearer ${accessToken}` } });
    
    return generateMockLinkedInData();
  } catch (error) {
    console.error('Error fetching LinkedIn data:', error);
    return null;
  }
}

/**
 * Calculate social media score
 */
export function calculateSocialMediaScore(data: SocialMediaData): number {
  let score = 0;

  // Facebook Score (0-5)
  if (data.facebook) {
    const fb = data.facebook;
    if (fb.friendsCount > 500) score += 2;
    else if (fb.friendsCount > 200) score += 1;
    
    if (fb.hasBusinessPage && fb.pageFollowers && fb.pageFollowers > 1000) score += 2;
    else if (fb.hasBusinessPage) score += 1;
    
    if (fb.verified) score += 1;
  }

  // Instagram Score (0-5)
  if (data.instagram) {
    const ig = data.instagram;
    if (ig.followersCount > 5000) score += 2;
    else if (ig.followersCount > 1000) score += 1;
    
    if (ig.hasBusinessAccount) score += 1;
    if (ig.engagementRate > 0.05) score += 1;
    if (ig.verified) score += 1;
  }

  // LinkedIn Score (0-5)
  if (data.linkedin) {
    const li = data.linkedin;
    if (li.connectionsCount > 500) score += 2;
    else if (li.connectionsCount > 200) score += 1;
    
    if (li.hasCompanyPage) score += 1;
    if (li.endorsementsCount > 10) score += 1;
    if (li.verified) score += 1;
  }

  return Math.min(score, 15);
}

/**
 * Analyze social media patterns for fraud detection
 */
export function analyzeSocialMediaPatterns(data: SocialMediaData): {
  isSuspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let suspiciousCount = 0;

  // Check for fake accounts
  if (data.instagram) {
    const ig = data.instagram;
    const followRatio = ig.followingCount > 0 ? ig.followersCount / ig.followingCount : 0;
    
    if (followRatio < 0.1 && ig.followersCount > 1000) {
      reasons.push('Instagram: Suspicious follower ratio');
      suspiciousCount++;
    }
    
    if (ig.postsCount < 10 && ig.followersCount > 5000) {
      reasons.push('Instagram: High followers with low posts');
      suspiciousCount++;
    }
  }

  if (data.facebook) {
    const fb = data.facebook;
    if (fb.accountAge < 6) {
      reasons.push('Facebook: Account too new');
      suspiciousCount++;
    }
  }

  return {
    isSuspicious: suspiciousCount >= 2,
    reasons,
  };
}

// ============================================
// MOCK DATA GENERATORS (Remove in production)
// ============================================

function generateMockFacebookData(): FacebookData {
  return {
    userId: 'mock_fb_' + Math.random().toString(36).substr(2, 9),
    friendsCount: Math.floor(Math.random() * 1000) + 100,
    hasBusinessPage: Math.random() > 0.5,
    pageFollowers: Math.floor(Math.random() * 5000),
    postFrequency: Math.floor(Math.random() * 20) + 1,
    engagementRate: Math.random() * 0.1,
    accountAge: Math.floor(Math.random() * 60) + 12,
    verified: Math.random() > 0.8,
  };
}

function generateMockInstagramData(): InstagramData {
  const followers = Math.floor(Math.random() * 10000) + 100;
  const following = Math.floor(Math.random() * 1000) + 50;
  
  return {
    username: 'mock_ig_' + Math.random().toString(36).substr(2, 9),
    followersCount: followers,
    followingCount: following,
    postsCount: Math.floor(Math.random() * 500) + 10,
    engagementRate: Math.random() * 0.15,
    hasBusinessAccount: Math.random() > 0.6,
    accountAge: Math.floor(Math.random() * 48) + 6,
    verified: Math.random() > 0.9,
  };
}

function generateMockLinkedInData(): LinkedInData {
  return {
    profileId: 'mock_li_' + Math.random().toString(36).substr(2, 9),
    connectionsCount: Math.floor(Math.random() * 800) + 50,
    endorsementsCount: Math.floor(Math.random() * 50),
    recommendationsCount: Math.floor(Math.random() * 10),
    hasCompanyPage: Math.random() > 0.7,
    yearsOfExperience: Math.floor(Math.random() * 15) + 1,
    educationLevel: ['SMA', 'D3', 'S1', 'S2'][Math.floor(Math.random() * 4)],
    verified: Math.random() > 0.85,
  };
}
