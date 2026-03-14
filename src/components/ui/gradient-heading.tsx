'use client';

import { cn } from '@/lib/utils';

interface GradientHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'default' | 'light';
  className?: string;
}

export function GradientHeading({
  children,
  as: Component = 'h2',
  variant = 'default',
  className,
}: GradientHeadingProps) {
  return (
    <Component
      className={cn(
        'font-bold',
        variant === 'default'
          ? 'bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'
          : 'text-white',
        className
      )}
    >
      {children}
    </Component>
  );
}
