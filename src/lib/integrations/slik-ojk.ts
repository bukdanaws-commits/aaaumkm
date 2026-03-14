/**
 * SLIK OJK Integration
 * Sistem Layanan Informasi Keuangan - OJK
 * 
 * IMPORTANT: This is a MOCK implementation for development.
 * In production, you need to:
 * 1. Register with OJK and get API credentials
 * 2. Complete legal requirements and data protection compliance
 * 3. Implement proper authentication and encryption
 * 4. Handle rate limiting and error cases
 */

export interface SlikOjkData {
  nik: string;
  name: string;
  creditScore: number; // 1-5 (1=Lancar, 5=Macet)
  totalLoans: number;
  activeLoans: number;
  totalDebt: number;
  monthlyInstallment: number;
  paymentHistory: {
    onTime: number;
    late: number;
    defaulted: number;
  };
  kolektibilitas: 'lancar' | 'dpk' | 'kurang_lancar' | 'diragukan' | 'macet';
  lastUpdated: Date;
}

export interface SlikOjkScore {
  creditHistoryScore: number; // 0-25
  debtRatioScore: number; // 0-20
  paymentBehaviorScore: number; // 0-15
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
}

/**
 * Fetch SLIK data from OJK
 * MOCK: In production, this would call actual OJK API
 */
export async function fetchSlikData(nik: string): Promise<SlikOjkData | null> {
  try {
    // MOCK: Simulate API call
    // In production: const response = await fetch(OJK_API_URL, { ... });
    
    // For development, return mock data based on NIK pattern
    const mockData = generateMockSlikData(nik);
    
    return mockData;
  } catch (error) {
    console.error('Error fetching SLIK data:', error);
    return null;
  }
}

/**
 * Calculate credit score from SLIK data
 */
export function calculateSlikScore(slikData: SlikOjkData | null): SlikOjkScore {
  if (!slikData) {
    return {
      creditHistoryScore: 0,
      debtRatioScore: 0,
      paymentBehaviorScore: 0,
      riskLevel: 'very_high',
    };
  }

  // 1. Credit History Score (0-25)
  let creditHistoryScore = 0;
  if (slikData.kolektibilitas === 'lancar') creditHistoryScore = 25;
  else if (slikData.kolektibilitas === 'dpk') creditHistoryScore = 20;
  else if (slikData.kolektibilitas === 'kurang_lancar') creditHistoryScore = 10;
  else if (slikData.kolektibilitas === 'diragukan') creditHistoryScore = 5;
  else creditHistoryScore = 0; // macet

  // 2. Debt Ratio Score (0-20)
  const debtRatio = slikData.totalDebt / (slikData.monthlyInstallment * 12 || 1);
  let debtRatioScore = 0;
  if (debtRatio < 0.3) debtRatioScore = 20;
  else if (debtRatio < 0.5) debtRatioScore = 15;
  else if (debtRatio < 0.7) debtRatioScore = 10;
  else if (debtRatio < 1.0) debtRatioScore = 5;
  else debtRatioScore = 0;

  // 3. Payment Behavior Score (0-15)
  const totalPayments = slikData.paymentHistory.onTime + slikData.paymentHistory.late + slikData.paymentHistory.defaulted;
  const onTimeRate = totalPayments > 0 ? slikData.paymentHistory.onTime / totalPayments : 0;
  let paymentBehaviorScore = 0;
  if (onTimeRate >= 0.95) paymentBehaviorScore = 15;
  else if (onTimeRate >= 0.85) paymentBehaviorScore = 12;
  else if (onTimeRate >= 0.75) paymentBehaviorScore = 8;
  else if (onTimeRate >= 0.60) paymentBehaviorScore = 4;
  else paymentBehaviorScore = 0;

  // Determine risk level
  const totalScore = creditHistoryScore + debtRatioScore + paymentBehaviorScore;
  let riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  if (totalScore >= 50) riskLevel = 'low';
  else if (totalScore >= 35) riskLevel = 'medium';
  else if (totalScore >= 20) riskLevel = 'high';
  else riskLevel = 'very_high';

  return {
    creditHistoryScore,
    debtRatioScore,
    paymentBehaviorScore,
    riskLevel,
  };
}

/**
 * Generate mock SLIK data for development
 * REMOVE THIS IN PRODUCTION
 */
function generateMockSlikData(nik: string): SlikOjkData {
  // Use NIK to generate consistent mock data
  const nikSum = nik.split('').reduce((sum, char) => sum + parseInt(char || '0'), 0);
  const seed = nikSum % 5;

  const scenarios: SlikOjkData[] = [
    // Scenario 0: Excellent credit
    {
      nik,
      name: 'Mock User',
      creditScore: 1,
      totalLoans: 2,
      activeLoans: 1,
      totalDebt: 5000000,
      monthlyInstallment: 500000,
      paymentHistory: { onTime: 24, late: 0, defaulted: 0 },
      kolektibilitas: 'lancar',
      lastUpdated: new Date(),
    },
    // Scenario 1: Good credit
    {
      nik,
      name: 'Mock User',
      creditScore: 2,
      totalLoans: 3,
      activeLoans: 2,
      totalDebt: 15000000,
      monthlyInstallment: 1200000,
      paymentHistory: { onTime: 20, late: 2, defaulted: 0 },
      kolektibilitas: 'dpk',
      lastUpdated: new Date(),
    },
    // Scenario 2: Fair credit
    {
      nik,
      name: 'Mock User',
      creditScore: 3,
      totalLoans: 4,
      activeLoans: 3,
      totalDebt: 25000000,
      monthlyInstallment: 2000000,
      paymentHistory: { onTime: 15, late: 5, defaulted: 1 },
      kolektibilitas: 'kurang_lancar',
      lastUpdated: new Date(),
    },
    // Scenario 3: Poor credit
    {
      nik,
      name: 'Mock User',
      creditScore: 4,
      totalLoans: 5,
      activeLoans: 4,
      totalDebt: 40000000,
      monthlyInstallment: 3000000,
      paymentHistory: { onTime: 10, late: 8, defaulted: 3 },
      kolektibilitas: 'diragukan',
      lastUpdated: new Date(),
    },
    // Scenario 4: Bad credit
    {
      nik,
      name: 'Mock User',
      creditScore: 5,
      totalLoans: 6,
      activeLoans: 5,
      totalDebt: 60000000,
      monthlyInstallment: 4000000,
      paymentHistory: { onTime: 5, late: 10, defaulted: 8 },
      kolektibilitas: 'macet',
      lastUpdated: new Date(),
    },
  ];

  return scenarios[seed];
}

/**
 * Verify SLIK data authenticity
 * In production, implement proper verification with OJK
 */
export async function verifySlikData(nik: string, name: string): Promise<boolean> {
  // MOCK: Always return true for development
  // In production: Verify with OJK API
  return true;
}
