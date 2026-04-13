'use client';

import { useEffect, useState } from 'react';
import { Orbit, Sparkles } from 'lucide-react';
import { DarkforestLogo } from '@/components/layout/DarkforestLogo';
import { cn } from '@/lib/utils';

const SPLASH_ENTER_MS = 1850;
const SPLASH_EXIT_MS = 2450;

export function EntranceGate({ children }: { children: React.ReactNode }) {
  const [showApp, setShowApp] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => {
      setShowApp(true);
      setLeaving(true);
    }, SPLASH_ENTER_MS);

    const settleTimer = window.setTimeout(() => {
      setLeaving(false);
    }, SPLASH_EXIT_MS);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(settleTimer);
    };
  }, []);

  return (
    <>
      {showApp ? children : null}

      {(!showApp || leaving) && (
        <div
          className={cn(
            'fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--glow-solar)/0.16),transparent_28%),radial-gradient(circle_at_18%_22%,hsl(var(--glow-rose)/0.16),transparent_24%),radial-gradient(circle_at_78%_18%,hsl(var(--glow-jade)/0.14),transparent_22%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background-alt))_100%)] transition duration-500',
            leaving ? 'pointer-events-none opacity-0 blur-sm' : 'opacity-100'
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--grid-color)/0.08)_1px,transparent_1px)] bg-[length:32px_32px] opacity-60" />
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.65),transparent)]" />

          <div className="relative flex w-full max-w-3xl flex-col items-center px-6 text-center">
            <div className="absolute top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.22),transparent_64%)] blur-3xl" />

            <div className="relative flex items-center gap-4 rounded-[32px] border border-border/70 bg-card/55 px-6 py-5 shadow-[0_30px_100px_hsl(var(--shadow-color)/0.26)] backdrop-blur-2xl">
              <DarkforestLogo className="h-16 w-16 rounded-[1.4rem]" />
              <div className="min-w-0 text-left">
                <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
                  Darkforest
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-gradient-cyber">
                  resume os
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  正在把你的经历整理成更清晰、更可定向优化的职业叙事系统。
                </p>
              </div>
            </div>

            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="page-hero-pill">
                <Orbit className="h-3.5 w-3.5 text-[hsl(var(--signal-solar))]" />
                正在启动职业图谱
              </div>
              <div className="page-hero-pill">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--signal-jade))]" />
                正在准备匹配与生成工作区
              </div>
            </div>

            <div className="relative mt-10 w-full max-w-xl overflow-hidden rounded-full border border-border/70 bg-background/45 p-1 shadow-[0_16px_40px_hsl(var(--shadow-color)/0.14)]">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
                <div className="entrance-progress h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--signal-solar)),hsl(var(--signal-rose))_50%,hsl(var(--signal-jade)))]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
