import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = false, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { height: 28, width: 140 },
    md: { height: 36, width: 180 },
    lg: { height: 44, width: 220 },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/ukm-logo.png"
        alt="UKM.ID Logo"
        width={sizeConfig.width}
        height={sizeConfig.height}
        className="object-contain"
        priority
      />
    </div>
  );
}
