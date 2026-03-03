export const dynamic = 'force-dynamic';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ItemTabs } from '@/components/profile/ItemTabs';
import { ImportModalTrigger } from '@/components/profile/ImportModalTrigger';
import { Orbit, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-10">
      <section className="surface-panel relative overflow-hidden rounded-[32px] px-6 py-7 sm:px-8">
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,hsl(var(--glow-jade)/0.18)_0%,transparent_70%)] blur-2xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1 text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              <Orbit className="h-3.5 w-3.5 text-[hsl(var(--signal-jade))]" />
              Profile Atlas
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="text-gradient-cyber">我的档案</span>
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              管理你的技能、经历、项目、教育和证书，让每一条履历都能被匹配、排序、隐藏、重写。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--signal-solar))]" />
              Inline editing
            </div>
            <ImportModalTrigger />
          </div>
        </div>
      </section>

      <ProfileHeader />

      <section className="surface-panel rounded-[30px] p-4 sm:p-6">
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            Structured Inventory
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            管理你的技能、经历、项目、教育和证书
          </p>
        </div>
        <ItemTabs />
      </section>
    </div>
  );
}
