export const dynamic = 'force-dynamic';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ItemTabs } from '@/components/profile/ItemTabs';
import { ImportModalTrigger } from '@/components/profile/ImportModalTrigger';
import { PageHero } from '@/components/shared/PageHero';
import { Orbit, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="page-shell page-stack">
      <PageHero
        kicker="档案图谱"
        title="我的档案"
        summary="管理你的技能、经历、项目、教育和证书，让每一条履历都能被匹配、排序、隐藏、重写。"
        icon={Orbit}
        className="panel-tint-jade"
        iconClassName="text-[hsl(var(--signal-jade))]"
        glowClassName="bg-[radial-gradient(circle,hsl(var(--glow-jade)/0.18)_0%,transparent_70%)]"
        side={
          <>
            <div className="hidden items-center gap-2 page-hero-pill sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--signal-solar))]" />
              即时编辑
            </div>
            <ImportModalTrigger />
          </>
        }
      />

      <ProfileHeader />

      <section className="surface-panel panel-tint-ink rounded-[30px] p-4 sm:p-6">
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            结构化清单
          </p>
        </div>
        <ItemTabs />
      </section>
    </div>
  );
}
