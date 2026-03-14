'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShoppingBag, Loader2 } from 'lucide-react';

function AuthForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [loading, setLoading] = useState(false);

  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();

      if (error) {
        toast.error(error.message || 'Login dengan Google gagal');
        setLoading(false);
        return;
      }

      // Google OAuth will redirect automatically
    } catch (err) {
      toast.error('Terjadi kesalahan saat login dengan Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center justify-center gap-2 font-bold text-2xl">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span>UKM Marketplace</span>
          </Link>
          <div>
            <CardTitle className="text-2xl">Selamat Datang</CardTitle>
            <CardDescription className="mt-2">
              Masuk atau daftar menggunakan akun Google Anda
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Box */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Bonus Registrasi!</h3>
                <p className="text-sm text-muted-foreground">
                  Dapatkan <span className="font-bold text-primary">500 kredit gratis</span> saat pertama kali mendaftar
                </p>
              </div>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button 
            variant="outline" 
            className="w-full h-12 text-base font-medium border-2 hover:bg-primary/5 hover:border-primary transition-all" 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Lanjutkan dengan Google
              </>
            )}
          </Button>

          {/* Benefits List */}
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm font-medium text-center text-muted-foreground">Keuntungan bergabung:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>500 kredit gratis untuk iklan pertama</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Jual & beli produk UMKM</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Boost iklan untuk jangkauan lebih luas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Transaksi aman & terpercaya</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground px-4">
            Dengan melanjutkan, Anda menyetujui{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Syarat & Ketentuan
            </Link>{' '}
            dan{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Kebijakan Privasi
            </Link>{' '}
            kami
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthForm />
    </Suspense>
  );
}
