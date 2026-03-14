import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container px-4">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Siap Untuk Mulai Berjualan?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Daftar gratis dan mulai jual produk Anda sekarang. Jangkau ribuan pembeli potensial di seluruh Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth?register=true">
                Daftar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link href="/marketplace">Jelajahi Produk</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
