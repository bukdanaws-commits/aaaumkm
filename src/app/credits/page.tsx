'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Zap, Star, Crown, Check, Coins, Banknote, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits: number;
  isActive: boolean;
  sortOrder: number;
}

const packageIcons: Record<number, any> = {
  0: CreditCard,
  1: Zap,
  2: Star,
  3: Crown,
};

const packageColors: Record<number, { color: string; bgColor: string }> = {
  0: { color: 'text-gray-600', bgColor: 'bg-gray-50' },
  1: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
  2: { color: 'text-purple-600', bgColor: 'bg-purple-50' },
  3: { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
};

const boostFeatures = [
  {
    name: 'Highlight Listing',
    cost: 10,
    duration: '1 hari',
    description: 'Iklan Anda ditampilkan dengan highlight warna',
  },
  {
    name: 'Top Search',
    cost: 20,
    duration: '1 hari',
    description: 'Iklan muncul di posisi teratas hasil pencarian',
  },
  {
    name: 'Premium Badge',
    cost: 30,
    duration: '1 hari',
    description: 'Badge premium pada iklan Anda',
  },
];

export default function CreditsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Fetch credit packages from database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/admin/credit-packages?active=true');
        if (response.ok) {
          const data = await response.json();
          setCreditPackages(data.packages || []);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) {
        setLoadingCredits(false);
        return;
      }

      try {
        const response = await fetch('/api/wallet');
        if (response.ok) {
          const data = await response.json();
          setUserCredits(data.credits?.balance || 0);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      } finally {
        setLoadingCredits(false);
      }
    };

    fetchCredits();
  }, [user]);

  const handlePurchase = async (packageId: string, packageName: string, paymentMethod: 'online' | 'manual') => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/auth');
      return;
    }

    setLoading(packageId);
    
    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (paymentMethod === 'online') {
      toast.success(`Paket ${packageName} berhasil dibeli!`, {
        description: 'Kredit akan segera ditambahkan ke akun Anda.',
      });
    } else {
      toast.info(`Instruksi transfer untuk ${packageName}`, {
        description: 'Silakan transfer ke rekening BNI yang tertera.',
      });
    }
    
    setLoading(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* User Credits Balance */}
        {user && (
          <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Kredit Anda</p>
                {loadingCredits ? (
                  <Skeleton className="mt-1 h-8 w-24" />
                ) : (
                  <p className="text-3xl font-bold text-primary">
                    {userCredits || 0} <span className="text-lg">Kredit</span>
                  </p>
                )}
              </div>
              <Coins className="h-12 w-12 text-primary/50" />
            </CardContent>
          </Card>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Paket Kredit UKM.ID</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tingkatkan visibilitas iklan Anda dengan kredit. Dapatkan lebih banyak pembeli dengan fitur boost dan highlight.
          </p>
        </div>

        {/* Credit Usage Info */}
        <Card className="mb-12 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Kegunaan Kredit</CardTitle>
            <CardDescription>Gunakan kredit untuk berbagai fitur premium</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span><strong>1 Kredit</strong> = Pasang 1 Iklan</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span><strong>1 Kredit</strong> = Tambah Gambar Extra</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span><strong>5-20 Kredit/hari</strong> = Boost Iklan</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span><strong>2 Kredit</strong> = Buat Lelang</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        {loadingPackages ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : creditPackages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Coins className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Belum ada paket kredit tersedia</p>
            <p className="text-sm mt-1">Silakan cek kembali nanti</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {creditPackages.map((pkg, index) => {
              const Icon = packageIcons[index] || CreditCard;
              const colors = packageColors[index] || packageColors[0];
              const isPopular = index === 1; // Second package is popular
              
              return (
                <Card 
                  key={pkg.id} 
                  className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">Paling Populer</Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${colors.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${colors.color}`} />
                    </div>
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>
                      <div className="text-3xl font-bold text-foreground mt-2">
                        {pkg.credits}
                        {pkg.bonusCredits > 0 && (
                          <span className="text-sm text-green-600 ml-2">
                            +{pkg.bonusCredits} bonus
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-1">kredit</div>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Boost iklan</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Highlight listing</span>
                      </div>
                      {pkg.bonusCredits > 0 && (
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Bonus {pkg.bonusCredits} kredit</span>
                        </div>
                      )}
                      {index >= 1 && (
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Top search placement</span>
                        </div>
                      )}
                      {index >= 2 && (
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Support prioritas</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(pkg.price)}
                    </div>
                    {pkg.bonusCredits > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Hemat {Math.round((pkg.bonusCredits / (pkg.credits + pkg.bonusCredits)) * 100)}%
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <div className="w-full space-y-2">
                      <Button 
                        className="w-full"
                        variant={isPopular ? 'default' : 'outline'}
                        onClick={() => handlePurchase(pkg.id, pkg.name, 'online')}
                        disabled={loading === pkg.id}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        {loading === pkg.id ? 'Memproses...' : 'Bayar Online'}
                      </Button>
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => handlePurchase(pkg.id, pkg.name, 'manual')}
                        disabled={loading === pkg.id}
                      >
                        <Banknote className="mr-2 h-4 w-4" />
                        Transfer Manual BNI
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Boost Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Fitur Boost</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boostFeatures.map((feature, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">{feature.cost}</span>
                    <span className="text-sm text-muted-foreground">kredit / {feature.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Pertanyaan Umum</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apa itu kredit UKM.ID?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Kredit adalah mata uang virtual yang digunakan untuk meningkatkan visibilitas iklan Anda. 
                  Dengan kredit, Anda bisa menggunakan fitur boost seperti highlight, top search, dan premium badge.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bagaimana cara menggunakan kredit?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Setelah membeli paket kredit, Anda bisa menggunakan kredit untuk boost iklan dari halaman dashboard. 
                  Pilih iklan yang ingin di-boost, pilih jenis boost, dan tentukan durasi.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apakah kredit bisa hangus?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tidak, kredit Anda tidak akan hangus dan bisa digunakan kapan saja. 
                  Kredit akan tetap tersimpan di akun Anda sampai digunakan.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bagaimana cara pembayaran?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Kami menerima berbagai metode pembayaran termasuk transfer bank, e-wallet (GoPay, OVO, Dana), 
                  dan kartu kredit. Setelah pembayaran dikonfirmasi, kredit akan otomatis masuk ke akun Anda.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
