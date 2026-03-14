'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Shield, Truck, CreditCard } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-12 md:py-20">
      <div className="container px-4">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Jual Beli Mudah,{' '}
            <span className="text-primary">Aman & Terpercaya</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl">
            Platform marketplace terbaik untuk menjual dan membeli produk berkualitas dengan harga terbaik. Ribuan transaksi sukses setiap hari.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" asChild>
              <Link href="/marketplace">
                <Search className="mr-2 h-5 w-5" />
                Jelajahi Marketplace
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/listing/create">
                Jual Produk
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t w-full max-w-xl">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">50K+</p>
              <p className="text-sm text-muted-foreground">Pengguna Aktif</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">100K+</p>
              <p className="text-sm text-muted-foreground">Produk Terjual</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">99%</p>
              <p className="text-sm text-muted-foreground">Kepuasan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container px-4 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-6 bg-card rounded-xl border">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Transaksi Aman</h3>
              <p className="text-sm text-muted-foreground">
                Pembayaran terproteksi dan dana ditahan sampai transaksi selesai
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-card rounded-xl border">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Pengiriman Terjamin</h3>
              <p className="text-sm text-muted-foreground">
                Tracking real-time dan asuransi pengiriman otomatis
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-card rounded-xl border">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Pembayaran Mudah</h3>
              <p className="text-sm text-muted-foreground">
                Berbagai metode pembayaran termasuk e-wallet dan transfer bank
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
