export const dynamic = 'force-dynamic';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ItemTabs } from '@/components/profile/ItemTabs';
import { ImportModalTrigger } from '@/components/profile/ImportModalTrigger';
import { Orbit, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="page-shell page-stack">
      <section className="surface-panel page-hero">
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,hsl(var(--glow-jade)/0.18)_0%,transparent_70%)] blur-2xl" />
        <div className="page-hero-body">
          <div className="page-hero-copy">
            <div className="page-hero-kicker">
              <Orbit className="h-3.5 w-3.5 text-[hsl(var(--signal-jade))]" />
              Profile Atlas
            </div>
            <h1 className="page-hero-title mt-4 text-3xl font-semibold sm:text-4xl">
              <span className="inline-block text-gradient-cyber">我的档案</span>
            </h1>
            <p className="page-hero-summary">
              管理你的技能、经历、项目、教育和证书，让每一条履历都能被匹配、排序、隐藏、重写。
            </p>
          </div>

          <div className="page-hero-side">
            <div className="hidden items-center gap-2 page-hero-pill sm:inline-flex">
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
