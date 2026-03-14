'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  MessageSquare, 
  Send, 
  ThumbsUp,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    name: string;
    avatarUrl?: string;
  };
}

interface ReviewSectionProps {
  sellerId: string;
  onRatingUpdate?: (stats: { totalReviews: number; averageRating: number }) => void;
}

export function ReviewSection({ sellerId, onRatingUpdate }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?sellerId=${sellerId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats({
          totalReviews: data.totalReviews || 0,
          averageRating: data.averageRating || 0,
        });
        onRatingUpdate?.({
          totalReviews: data.totalReviews || 0,
          averageRating: data.averageRating || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Harap tulis ulasan Anda');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (res.ok) {
        toast.success('Ulasan berhasil dikirim!');
        setNewReview({ rating: 5, comment: '' });
        fetchReviews();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Gagal mengirim ulasan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'text-yellow-500 fill-current'
                  : 'text-gray-300'
              } ${interactive ? 'hover:text-yellow-400' : ''}`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-card to-muted/30">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Ulasan Penjual
          <Badge variant="secondary" className="ml-2">
            {stats.totalReviews} ulasan
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Rating Summary */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">
              {stats.averageRating.toFixed(1)}
            </p>
            <div className="flex justify-center mt-1">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalReviews} ulasan
            </p>
          </div>
        </div>

        {/* Write Review Form (if logged in) */}
        {user && (
          <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-muted/30 rounded-lg border">
            <Label className="text-sm font-medium mb-2 block">Beri Ulasan</Label>
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-1">Rating Anda:</p>
              {renderStars(newReview.rating, true, (r) => setNewReview({ ...newReview, rating: r }))}
            </div>
            <Textarea
              placeholder="Tulis pengalaman Anda bertransaksi dengan penjual ini..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="mb-3"
              rows={3}
            />
            <Button type="submit" disabled={submitting} className="gap-2">
              <Send className="h-4 w-4" />
              {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
            </Button>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada ulasan untuk penjual ini</p>
            <p className="text-sm">Jadilah yang pertama memberikan ulasan!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-muted/30 rounded-lg border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewer?.avatarUrl || ''} />
                    <AvatarFallback>
                      {review.reviewer?.name?.charAt(0) || <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{review.reviewer?.name || 'Anonim'}</p>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </p>
                    <p className="text-sm mt-2 whitespace-pre-wrap">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
