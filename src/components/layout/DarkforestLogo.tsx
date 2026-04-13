import { cn } from '@/lib/utils';

interface DarkforestLogoProps {
  className?: string;
  compact?: boolean;
}

export function DarkforestLogo({ className, compact = false }: DarkforestLogoProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-[1.15rem] border border-primary/20 bg-[linear-gradient(180deg,hsl(var(--background)/0.96),hsl(var(--background-alt)/0.86))] text-primary shadow-[0_16px_36px_hsl(var(--primary)/0.14),inset_0_1px_0_hsl(0_0%_100%/0.16)]',
        compact ? 'h-11 w-11' : 'h-12 w-12',
        className
      )}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-[2px] rounded-[0.95rem] bg-[radial-gradient(circle_at_top,hsl(var(--glow-solar)/0.18),transparent_62%)]" />
      <svg
        viewBox="0 0 64 64"
        className={cn('relative z-10', compact ? 'h-7 w-7' : 'h-8 w-8')}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 10L19 22.5L32 35L45 22.5L32 10Z"
          className="fill-[hsl(var(--signal-solar)/0.18)] stroke-current"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M32 18.5V49.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M32 24L24 31"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M32 24L40 31"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M32 31L21 40"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <path
          d="M32 31L43 40"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <path
          d="M16 49.5H48"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle cx="32" cy="18.5" r="2.6" className="fill-current" />
        <circle cx="24" cy="31" r="2.1" className="fill-[hsl(var(--signal-rose))]" />
        <circle cx="40" cy="31" r="2.1" className="fill-[hsl(var(--signal-jade))]" />
        <circle cx="21" cy="40" r="1.9" className="fill-current" />
        <circle cx="43" cy="40" r="1.9" className="fill-current" />
        <path
          d="M13 14.5H22"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.34"
        />
        <path
          d="M42 50.5H51"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.34"
        />
      </svg>
    </div>
  );
}
