import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  kicker: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  iconClassName?: string;
  glowClassName?: string;
  side?: React.ReactNode;
}

export function PageHero({
  kicker,
  title,
  summary,
  icon: Icon,
  iconClassName,
  glowClassName,
  side,
}: PageHeroProps) {
  return (
    <section className="surface-panel page-hero">
      <div
        className={cn(
          'absolute -right-8 top-0 h-36 w-36 rounded-full blur-2xl',
          glowClassName
        )}
      />
      <div className="page-hero-body">
        <div className="page-hero-copy">
          <div className="page-hero-kicker">
            <Icon className={cn('h-3.5 w-3.5', iconClassName)} />
            {kicker}
          </div>
          <h1 className="page-hero-title mt-4 text-3xl font-semibold sm:text-4xl">
            <span className="inline-block text-gradient-cyber">{title}</span>
          </h1>
          <p className="page-hero-summary">{summary}</p>
        </div>

        {side ? <div className="page-hero-side">{side}</div> : null}
      </div>
    </section>
  );
}
