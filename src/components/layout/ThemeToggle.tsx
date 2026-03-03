'use client';

import { useEffect, useState } from 'react';
import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (mounted ? resolvedTheme : 'dark') === 'dark';
  const label = isDark ? '夜间' : '日间';

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? 'icon' : 'sm'}
      className={cn(
        'group rounded-full border-border/70 bg-background/50 text-foreground shadow-[0_14px_38px_hsl(var(--shadow-color)/0.14)] backdrop-blur-xl hover:border-primary/40 hover:bg-background/75',
        compact ? 'h-10 w-10' : 'h-10 gap-2.5 px-3.5',
        className
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`切换到${isDark ? '日间' : '夜间'}模式`}
      title={`切换到${isDark ? '日间' : '夜间'}模式`}
    >
      <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full">
        <SunMedium
          className={cn(
            'absolute h-4 w-4 text-[hsl(var(--signal-solar))] transition-all duration-300',
            isDark ? 'translate-y-6 rotate-90 opacity-0' : 'translate-y-0 rotate-0 opacity-100'
          )}
        />
        <MoonStar
          className={cn(
            'absolute h-4 w-4 text-[hsl(var(--signal-rose))] transition-all duration-300',
            isDark ? 'translate-y-0 rotate-0 opacity-100' : '-translate-y-6 -rotate-90 opacity-0'
          )}
        />
      </span>
      {!compact && (
        <span className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
          {label}
        </span>
      )}
    </Button>
  );
}
