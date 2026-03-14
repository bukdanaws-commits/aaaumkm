'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Ticket, Loader2, Gift, Coins, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Credits {
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  totalBonus: number;
}

interface RedeemedCoupon {
  id: string;
  code: string;
  credits_amount: number;
  used_at: string;
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardContent>
    </Card>
  );
}

export default function DashboardCoupons() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [credits, setCredits] = useState<Credits>({ balance: 0, totalPurchased: 0, totalUsed: 0, totalBonus: 0 });
  const [redeemedCoupons, setRedeemedCoupons] = useState<RedeemedCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  useEffect(() => {
    const fetchCouponsData = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/dashboard/coupons');
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits);
          setRedeemedCoupons(data.redeemedCoupons);
        }
      } catch (error) {
        console.error('Error fetching coupons data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchCouponsData();
    }
  }, [user, authLoading]);

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim() || !user) return;
    
    setRedeemLoading(true);
    try {
      const response = await fetch('/api/dashboard/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setCredits(prev => ({
          ...prev,
          balance: data.newBalance,
          totalBonus: prev.totalBonus + data.creditsAdded,
        }));
        setCouponCode('');
        toast({ 
          title: '🎉 Kupon Berhasil!', 
          description: `${data.creditsAdded} kredit telah ditambahkan ke akun Anda` 
        });
        // Refresh redeemed coupons list
        const refreshResponse = await fetch('/api/dashboard/coupons');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setRedeemedCoupons(refreshData.redeemedCoupons);
        }
      } else {
        toast({ 
          variant: 'destructive',
          title: 'Gagal Menukarkan Kupon', 
          description: data.error || 'Terjadi kesalahan' 
        });
      }
    } catch (error) {
      toast({ 
        variant: 'destructive',
        title: 'Gagal Menukarkan Kupon', 
        description: 'Terjadi kesalahan, silakan coba lagi' 
      });
    } finally {
      setRedeemLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout title="Kupon" description="Memuat...">
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Kupon" description="Tukarkan kode kupon untuk mendapatkan kredit gratis">
      {/* Credit Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Saldo Kredit Anda</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{credits.balance}</p>
          <p className="text-sm text-muted-foreground">Kredit tersedia untuk boost & fitur premium</p>
          {credits.totalBonus > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Total bonus: {credits.totalBonus} kredit
            </p>
          )}
        </CardContent>
      </Card>

      {/* Redeem Coupon */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="h-5 w-5 text-primary" />
            Tukar Kupon Kredit
          </CardTitle>
          <CardDescription>Punya kode kupon? Masukkan di sini untuk mendapatkan kredit gratis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 max-w-md">
            <Input
              placeholder="Contoh: PROMO2025 atau ADFFDS2311_4"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleRedeemCoupon()}
              className="font-mono uppercase"
              maxLength={30}
            />
            <Button
              onClick={handleRedeemCoupon}
              disabled={redeemLoading || !couponCode.trim()}
              className="shrink-0"
            >
              {redeemLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Ticket className="mr-2 h-4 w-4" />
                  Tukar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Redeemed Coupons */}
      {redeemedCoupons.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Kupon yang Sudah Ditukar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {redeemedCoupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-mono font-medium">{coupon.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(coupon.used_at), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-green-600">
                    +{coupon.credits_amount} kredit
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-5 w-5 text-primary" />
            Cara Mendapatkan Kupon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0">1</Badge>
              Ikuti event dan promosi dari UMKM ID di media sosial
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0">2</Badge>
              Dapatkan kode kupon dari admin atau program referral
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0">3</Badge>
              Masukkan kode kupon di kolom di atas dan klik "Tukar"
            </li>
          </ul>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
