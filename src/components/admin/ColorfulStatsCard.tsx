import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorfulStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  colorClass: string;
  isLoading?: boolean;
}

export function ColorfulStatsCard({
  title,
  value,
  description,
  icon: Icon,
  colorClass,
  isLoading = false,
}: ColorfulStatsCardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
      colorClass
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90 mb-1 truncate">{title}</p>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-white/20" />
            ) : (
              <div className="text-2xl font-bold text-white truncate mb-1">{value}</div>
            )}
            {description && (
              <p className="text-xs text-white/80 truncate">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
