'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ListingForm } from '@/components/listing/ListingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, AlertTriangle } from 'lucide-react';

export default function CreateListingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkKycStatus() {
      if (!user) return;

      try {
        const response = await fetch('/api/kyc');
        if (response.ok) {
          const data = await response.json();
          setKycStatus(data.kyc?.status || 'not_submitted');
        }
      } catch (error) {
        console.error('Error checking KYC status:', error);
      } finally {
        setLoading(false);
      }
    }

    checkKycStatus();
  }, [user]);

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Pasang Iklan Baru" description="Buat iklan untuk menjual produk Anda">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  // Block access if KYC not approved
  if (kycStatus !== 'approved') {
    return (
      <DashboardLayout title="Verifikasi KYC Diperlukan" description="Selesaikan verifikasi identitas untuk mulai berjualan">
        <div className="max-w-2xl mx-auto">
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Verifikasi KYC Diperlukan</CardTitle>
                  <CardDescription className="text-yellow-700">
                    {kycStatus === 'not_submitted' && 'Anda belum mengajukan verifikasi KYC'}
                    {kycStatus === 'pending' && 'Verifikasi KYC Anda sedang dalam proses review'}
                    {kycStatus === 'rejected' && 'Verifikasi KYC Anda ditolak, silakan perbaiki data'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Untuk menjual barang di platform kami, Anda harus menyelesaikan verifikasi identitas (KYC) terlebih dahulu.
                  </p>
                  <p className="text-sm text-gray-600">
                    Verifikasi ini membantu menjaga keamanan dan kepercayaan dalam komunitas kami.
                  </p>
                </div>
              </div>

              {kycStatus === 'not_submitted' && (
                <Button
                  onClick={() => router.push('/dashboard/kyc')}
                  className="w-full rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:opacity-90"
                  size="lg"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Mulai Verifikasi KYC
                </Button>
              )}

              {kycStatus === 'pending' && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    Proses verifikasi membutuhkan 1-3 hari kerja. Kami akan memberitahu Anda melalui email setelah verifikasi selesai.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="mt-4 rounded-full"
                  >
                    Kembali ke Dashboard
                  </Button>
                </div>
              )}

              {kycStatus === 'rejected' && (
                <Button
                  onClick={() => router.push('/dashboard/kyc')}
                  className="w-full rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:opacity-90"
                  size="lg"
                >
                  Perbaiki Data KYC
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pasang Iklan Baru" description="Buat iklan untuk menjual produk Anda">
      <div className="max-w-4xl mx-auto">
        <ListingForm mode="create" />
      </div>
    </DashboardLayout>
  );
}
