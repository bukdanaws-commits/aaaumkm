'use client';

import { useState } from 'react';
import { Brain, RefreshCw, Loader2, Award, AlertCircle, CheckCircle, Info, Target, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

interface CreditScoreResult {
  totalScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedLoanAmount: number;
  confidence: number;
  factors: Array<{
    name: string;
    score: number;
    importance: number;
    description: string;
  }>;
}

export default function AIScorePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreditScoreResult | null>(null);
  const [nikInput, setNikInput] = useState('3201234567890123');

  const generateMockData = (nik: string): CreditScoreResult => {
    const seed = nik.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return min + ((x - Math.floor(x)) * (max - min));
    };

    const baseScore = random(60, 95);
    const riskLevel = baseScore > 80 ? 'low' : baseScore > 60 ? 'medium' : 'high';

    return {
      totalScore: Math.round(baseScore),
      riskLevel,
      recommendedLoanAmount: Math.round(random(10, 50) * 1000000),
      confidence: Math.round(random(75, 95)),
      factors: [
        { name: 'SLIK Credit History', score: Math.round(random(15, 25)), importance: 25, description: 'Kolektibilitas: Lancar (Kol-1)' },
        { name: 'Total Revenue', score: Math.round(random(10, 18)), importance: 15, description: `Rp ${Math.round(random(10, 25))} juta / bulan` },
        { name: 'Transaction Count', score: Math.round(random(8, 15)), importance: 12, description: `${Math.round(random(30, 60))} transaksi dalam 30 hari` },
        { name: 'Social Media Presence', score: Math.round(random(5, 12)), importance: 10, description: 'Facebook, Instagram verified' },
        { name: 'KYC Verification', score: Math.round(random(5, 10)), importance: 12, description: 'NPWP & NIB verified' },
        { name: 'Payment History', score: Math.round(random(8, 15)), importance: 15, description: '95% tepat waktu' },
        { name: 'Business Duration', score: Math.round(random(5, 10)), importance: 8, description: '3+ tahun beroperasi' },
        { name: 'Account Rating', score: Math.round(random(3, 8)), importance: 3, description: '4.8/5.0 rating' },
      ],
    };
  };

  const handleCalculate = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockResult = generateMockData(nikInput);
    setResult(mockResult);
    setLoading(false);
  };

  const handleReset = () => {
    setResult(null);
    setNikInput('3201234567890123');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { color: '#10b981', label: 'Excellent', bg: 'bg-green-500' };
    if (score >= 60) return { color: '#3b82f6', label: 'Good', bg: 'bg-blue-500' };
    if (score >= 40) return { color: '#f59e0b', label: 'Fair', bg: 'bg-orange-500' };
    return { color: '#ef4444', label: 'Poor', bg: 'bg-red-500' };
  };

  const scoreInfo = result ? getScoreColor(result.totalScore) : getScoreColor(78);
  const rotation = result ? (result.totalScore / 100) * 180 - 90 : 0;

  return (
    <DashboardLayout
      title="AI Credit Scoring"
      description="Sistem penilaian kredit berbasis AI dengan analisis mendalam"
    >
      <div className="flex-1">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Credit Scoring</h1>
                <p className="text-purple-100 mt-1">Sistem penilaian kredit berbasis AI dengan analisis mendalam</p>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Simulasi Penilaian Kredit</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Identitas (NIK)</label>
                <input
                  type="text"
                  value={nikInput}
                  onChange={(e) => setNikInput(e.target.value)}
                  placeholder="Masukkan NIK (16 digit)"
                  maxLength={16}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <button
                onClick={handleCalculate}
                disabled={loading || nikInput.length !== 16}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghitung...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Hitung Skor
                  </>
                )}
              </button>
              {result && (
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 Tip: Ubah NIK untuk melihat hasil simulasi yang berbeda</p>
          </div>

          {/* Main Score Gauge */}
          {result && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  Skor Kredit AI Anda
                </h2>
                <p className="text-gray-500 mb-8">Berdasarkan analisis 50+ data points</p>
                
                {/* Bar Chart */}
                <div className="w-full max-w-2xl mb-6">
                  {/* Score Display */}
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold mb-2" style={{ color: scoreInfo.color }}>
                      {result.totalScore}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">dari 100</div>
                    <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold text-white ${scoreInfo.bg}`}>
                      {scoreInfo.label}
                    </div>
                  </div>

                  {/* Bar Chart Visualization */}
                  <div className="space-y-3">
                    {/* Score Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Skor Total</span>
                        <span className="text-sm font-bold" style={{ color: scoreInfo.color }}>{result.totalScore}/100</span>
                      </div>
                      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                          style={{ 
                            width: `${result.totalScore}%`,
                            backgroundColor: scoreInfo.color
                          }}
                        >
                          <span className="text-xs font-semibold text-white">{result.totalScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Score Range Indicators */}
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      <div className="text-center">
                        <div className="h-2 bg-red-300 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">0-20</span>
                        <div className="text-xs text-gray-500">Sangat Rendah</div>
                      </div>
                      <div className="text-center">
                        <div className="h-2 bg-orange-300 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">21-40</span>
                        <div className="text-xs text-gray-500">Rendah</div>
                      </div>
                      <div className="text-center">
                        <div className="h-2 bg-yellow-300 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">41-60</span>
                        <div className="text-xs text-gray-500">Sedang</div>
                      </div>
                      <div className="text-center">
                        <div className="h-2 bg-blue-300 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">61-80</span>
                        <div className="text-xs text-gray-500">Baik</div>
                      </div>
                      <div className="text-center">
                        <div className="h-2 bg-green-300 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">81-100</span>
                        <div className="text-xs text-gray-500">Sangat Baik</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Cards */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Level Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-100">Risk Level</span>
                  <AlertCircle className="w-6 h-6 text-blue-200" />
                </div>
                <div className="text-4xl font-bold text-white mb-3 capitalize">
                  {result.riskLevel === 'low' ? 'Rendah' : result.riskLevel === 'medium' ? 'Sedang' : 'Tinggi'}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-blue-400/30 rounded-full h-3">
                    <div 
                      className="bg-blue-200 h-3 rounded-full" 
                      style={{ width: `${result.confidence}%` }} 
                    />
                  </div>
                  <span className="text-sm text-blue-100 font-semibold">{result.confidence}%</span>
                </div>
                <div className="text-xs text-blue-100 mt-3">Confidence Level</div>
              </div>

              {/* Loan Recommendation Card */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-green-100">Rekomendasi Pinjaman</span>
                  <CheckCircle className="w-6 h-6 text-green-200" />
                </div>
                <div className="text-4xl font-bold text-white mb-3">
                  Rp {(result.recommendedLoanAmount / 1000000).toFixed(0)}jt
                </div>
                <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-green-700 bg-green-100 mb-3">
                  {result.totalScore >= 80 ? 'Sangat Layak' : result.totalScore >= 60 ? 'Layak' : 'Perlu Review'}
                </div>
                <div className="text-xs text-green-100">Maksimal pinjaman yang direkomendasikan</div>
              </div>

              {/* Approval Probability Card */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-purple-100">Probabilitas Approval</span>
                  <Target className="w-6 h-6 text-purple-200" />
                </div>
                <div className="text-4xl font-bold text-white mb-3">
                  {Math.round((result.totalScore / 100) * 100)}%
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-purple-400/30 rounded-full h-3">
                    <div 
                      className="bg-purple-200 h-3 rounded-full" 
                      style={{ width: `${(result.totalScore / 100) * 100}%` }} 
                    />
                  </div>
                </div>
                <div className="text-xs text-purple-100 mt-3">Kemungkinan disetujui oleh lender</div>
              </div>

              {/* Status Card */}
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-orange-100">Status Aplikasi</span>
                  <Award className="w-6 h-6 text-orange-200" />
                </div>
                <div className="text-4xl font-bold text-white mb-3">
                  {result.totalScore >= 80 ? 'Direkomendasikan' : result.totalScore >= 60 ? 'Layak Diproses' : 'Perlu Verifikasi'}
                </div>
                <div className="text-sm text-orange-100">
                  {result.totalScore >= 80 
                    ? 'Aplikasi Anda sangat layak untuk disetujui' 
                    : result.totalScore >= 60 
                    ? 'Aplikasi Anda layak untuk diproses lebih lanjut'
                    : 'Aplikasi Anda memerlukan verifikasi tambahan'}
                </div>
              </div>
            </div>
          )}

          {/* Feature Analysis */}
          {result && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <Info className="w-6 h-6 text-blue-600" />
                Analisis Faktor Penilaian
              </h2>
              <div className="space-y-6">
                {result.factors.map((factor, idx) => (
                  <div key={idx} className="group hover:bg-gray-50 p-4 rounded-lg transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">{factor.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{factor.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">+{factor.score}</div>
                        <div className="text-xs text-gray-500 font-medium">{factor.importance}% importance</div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${factor.importance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Rekomendasi Peningkatan Skor
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Lengkapi Verifikasi KYC</div>
                    <div className="text-sm text-gray-600 mt-1">Meningkatkan skor hingga +7 poin</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Tingkatkan Transaksi</div>
                    <div className="text-sm text-gray-600 mt-1">Aktivitas konsisten meningkatkan kredibilitas</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Daftarkan NPWP</div>
                    <div className="text-sm text-gray-600 mt-1">Meningkatkan kredibilitas usaha +5 poin</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Hubungkan Social Media</div>
                    <div className="text-sm text-gray-600 mt-1">LinkedIn verification +3 poin</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Tentang AI Credit Scoring
            </h3>
            <p className="text-purple-800 mb-4">
              Sistem ini menggunakan Machine Learning dengan algoritma Gradient Boosting untuk menganalisis 50+ data points dari berbagai sumber.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="font-semibold text-purple-900 mb-1">🏪 Platform Data (30%)</div>
                <div className="text-sm text-purple-700">Durasi usaha, omzet, transaksi, rating pelanggan</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="font-semibold text-purple-900 mb-1">🏦 SLIK OJK (35%)</div>
                <div className="text-sm text-purple-700">Riwayat kredit, kolektibilitas, pembayaran</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="font-semibold text-purple-900 mb-1">📱 Social Media (15%)</div>
                <div className="text-sm text-purple-700">Facebook, Instagram, LinkedIn verification</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="font-semibold text-purple-900 mb-1">📄 KYC & Dokumen (12%)</div>
                <div className="text-sm text-purple-700">Verifikasi identitas, NPWP, NIB</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="font-semibold text-purple-900 mb-1">📊 Behavioral Data (8%)</div>
                <div className="text-sm text-purple-700">Pola aktivitas dan engagement</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
