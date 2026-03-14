import { Card, CardContent } from '@/components/ui/card';
import {
  ShieldCheck,
  MessageCircle,
  Star,
  Zap,
  Users,
  Clock,
} from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Keamanan Terjamin',
    description: 'Sistem escrow otomatis untuk melindungi setiap transaksi',
  },
  {
    icon: MessageCircle,
    title: 'Chat Real-time',
    description: 'Komunikasi langsung dengan penjual tanpa biaya',
  },
  {
    icon: Star,
    title: 'Review & Rating',
    description: 'Sistem review transparan untuk kepercayaan pengguna',
  },
  {
    icon: Zap,
    title: 'Boost Listing',
    description: 'Tingkatkan visibilitas produk Anda dengan sistem kredit',
  },
  {
    icon: Users,
    title: 'Komunitas Aktif',
    description: 'Bergabung dengan ribuan pengguna aktif setiap hari',
  },
  {
    icon: Clock,
    title: 'Support 24/7',
    description: 'Tim support siap membantu kapan saja Anda butuhkan',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Mengapa Memilih Kami?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Platform marketplace dengan fitur lengkap untuk pengalaman jual beli terbaik
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
