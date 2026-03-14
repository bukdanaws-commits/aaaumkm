'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tag, 
  Package, 
  MapPin, 
  Eye, 
  Calendar,
  Star,
  Sparkles,
  Clock,
  Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const conditionConfig: Record<string, { label: string; color: string; description: string }> = {
  new: { label: 'Baru', color: 'bg-emerald-500', description: 'Barang baru, belum pernah dipakai' },
  like_new: { label: 'Seperti Baru', color: 'bg-blue-500', description: 'Bekas tapi masih sangat bagus' },
  good: { label: 'Bagus', color: 'bg-amber-500', description: 'Kondisi baik, ada tanda pemakaian wajar' },
  fair: { label: 'Cukup', color: 'bg-gray-500', description: 'Masih berfungsi dengan baik' },
};

interface ProductSpecsProps {
  condition: string;
  priceType: string;
  location: string;
  viewCount: number;
  createdAt: string;
  isFeatured?: boolean;
  category: string;
}

export function ProductSpecs({
  condition,
  priceType,
  location,
  viewCount,
  createdAt,
  isFeatured,
  category,
}: ProductSpecsProps) {
  const conditionData = conditionConfig[condition] || conditionConfig.good;

  const specs = [
    {
      icon: Tag,
      label: 'Kondisi',
      value: conditionData.label,
      badge: true,
      badgeClass: conditionData.color,
      description: conditionData.description,
    },
    {
      icon: Package,
      label: 'Kategori',
      value: category,
    },
    {
      icon: MapPin,
      label: 'Lokasi',
      value: location,
    },
    {
      icon: Eye,
      label: 'Dilihat',
      value: `${viewCount.toLocaleString('id-ID')} kali`,
    },
    {
      icon: Calendar,
      label: 'Diposting',
      value: formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: id }),
    },
  ];

  const priceTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    fixed: { label: 'Harga Pas', icon: <Tag className="h-4 w-4" /> },
    negotiable: { label: 'Bisa Nego', icon: <Sparkles className="h-4 w-4" /> },
    auction: { label: 'Lelang', icon: <Clock className="h-4 w-4" /> },
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Spesifikasi Produk
        </h2>

        <div className="space-y-4">
          {specs.map((spec, index) => (
            <div 
              key={index}
              className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <spec.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">{spec.label}</p>
                {spec.badge ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn("text-white border-0", spec.badgeClass)}>
                      {spec.value}
                    </Badge>
                    {spec.description && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {spec.description}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="font-medium truncate">{spec.value}</p>
                )}
              </div>
            </div>
          ))}

          {/* Price Type */}
          <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Tipe Harga</p>
              <Badge variant="outline" className="mt-1 gap-1">
                {priceTypeLabels[priceType]?.icon}
                {priceTypeLabels[priceType]?.label || priceType}
              </Badge>
            </div>
          </div>

          {/* Featured Status */}
          {isFeatured && (
            <div className="flex items-start gap-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600">
                <Star className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-700 dark:text-amber-400">Status Premium</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Premium Listing
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quality Guarantee */}
        <div className="mt-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-800 dark:text-emerald-300">Jaminan Kualitas</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                Produk telah diverifikasi dan dijamin kualitasnya oleh platform
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
