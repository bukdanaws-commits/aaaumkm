'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  MapPin, 
  Star, 
  Package, 
  CheckCircle, 
  Clock,
  MessageCircle,
  Phone
} from 'lucide-react';

interface SellerCardProps {
  seller: {
    userId: string;
    name: string;
    avatarUrl?: string | null;
    city?: string | null;
    province?: string | null;
    isVerified?: boolean;
    averageRating?: number;
    totalReviews?: number;
    totalListings?: number;
    soldCount?: number;
    phone?: string | null;
    createdAt?: string;
  };
  isOwnListing?: boolean;
  onChat?: () => void;
  onCall?: () => void;
  chatLoading?: boolean;
}

export function SellerCard({ 
  seller, 
  isOwnListing,
  onChat,
  onCall,
  chatLoading 
}: SellerCardProps) {
  const initials = seller.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  const memberSince = seller.createdAt 
    ? new Date(seller.createdAt).toLocaleDateString('id-ID', { 
        month: 'long', 
        year: 'numeric' 
      })
    : null;

  return (
    <Card className="shadow-lg overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
      <CardContent className="p-5">
        {/* Seller Header */}
        <Link 
          href={`/user/${seller.userId}`}
          className="flex items-center gap-3 mb-4 group"
        >
          <Avatar className="h-14 w-14 border-2 border-muted">
            <AvatarImage src={seller.avatarUrl || ''} alt={seller.name} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {seller.name}
              </h3>
              {seller.isVerified && (
                <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">
                {seller.city || seller.province || 'Indonesia'}
              </span>
            </div>
          </div>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">
              {seller.totalListings || 0}
            </p>
            <p className="text-xs text-muted-foreground">Produk</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">
              {seller.soldCount || 0}
            </p>
            <p className="text-xs text-muted-foreground">Terjual</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-lg font-bold text-foreground">
                {seller.averageRating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {seller.totalReviews || 0} ulasan
            </p>
          </div>
        </div>

        {/* Member Since */}
        {memberSince && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4" />
            <span>Bergabung {memberSince}</span>
          </div>
        )}

        {/* Actions */}
        {!isOwnListing && (
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              asChild
            >
              <Link href={`/user/${seller.userId}`}>
                <Store className="h-4 w-4" />
                Lihat Toko
              </Link>
            </Button>
            
            {onChat && (
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={onChat}
                disabled={chatLoading}
              >
                <MessageCircle className="h-4 w-4" />
                {chatLoading ? 'Memproses...' : 'Chat Penjual'}
              </Button>
            )}

            {onCall && (
              <Button 
                variant="ghost" 
                className="w-full gap-2 text-muted-foreground"
                onClick={onCall}
              >
                <Phone className="h-4 w-4" />
                Hubungi via Telepon
              </Button>
            )}
          </div>
        )}

        {isOwnListing && (
          <Badge variant="secondary" className="w-full justify-center py-2">
            Ini adalah iklan Anda
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
