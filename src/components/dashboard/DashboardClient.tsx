'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ImportModal } from '@/components/profile/ImportModal';
import { useItems } from '@/lib/hooks/useItems';
import { useMatchResults } from '@/lib/hooks/useMatch';
import { useProfile } from '@/lib/hooks/useProfile';
import {
  Upload,
  Target,
  Zap,
  Brain,
  Briefcase,
  FolderOpen,
  GraduationCap,
  Award,
  TreePine,
  ArrowRight,
  Orbit,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export function DashboardClient() {
  const [importOpen, setImportOpen] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: skills } = useItems('skill');
  const { data: experiences } = useItems('experience');
  const { data: projects } = useItems('project');
  const { data: educations } = useItems('education');
  const { data: certifications } = useItems('certification');
  const { data: matchResults = [], isLoading: matchResultsLoading } = useMatchResults();

  const totalItems =
    (skills?.length ?? 0) +
    (experiences?.length ?? 0) +
    (projects?.length ?? 0) +
    (educations?.length ?? 0) +
    (certifications?.length ?? 0);

  const hasData = totalItems > 0;
  const recentMatchResults = matchResults.slice(0, 5);

  const statsCards = [
    {
      label: '技能',
      value: skills?.length ?? 0,
      icon: Brain,
      href: '/profile?tab=skill',
      color: 'text-[hsl(var(--signal-solar))]',
      glow: 'bg-[radial-gradient(circle,hsl(var(--signal-solar)/0.22)_0%,transparent_72%)]',
    },
    {
      label: '工作经历',
      value: experiences?.length ?? 0,
      icon: Briefcase,
      href: '/profile?tab=experience',
      color: 'text-[hsl(var(--signal-rose))]',
      glow: 'bg-[radial-gradient(circle,hsl(var(--signal-rose)/0.22)_0%,transparent_72%)]',
    },
    {
      label: '项目',
      value: projects?.length ?? 0,
      icon: FolderOpen,
      href: '/profile?tab=project',
      color: 'text-[hsl(var(--signal-jade))]',
      glow: 'bg-[radial-gradient(circle,hsl(var(--signal-jade)/0.22)_0%,transparent_72%)]',
    },
    {
      label: '教育',
      value: educations?.length ?? 0,
      icon: GraduationCap,
      href: '/profile?tab=education',
      color: 'text-[hsl(var(--signal-gold))]',
      glow: 'bg-[radial-gradient(circle,hsl(var(--signal-gold)/0.22)_0%,transparent_72%)]',
    },
    {
      label: '证书',
      value: certifications?.length ?? 0,
      icon: Award,
      href: '/profile?tab=certification',
      color: 'text-[hsl(var(--signal-ink))]',
      glow: 'bg-[radial-gradient(circle,hsl(var(--signal-ink)/0.22)_0%,transparent_72%)]',
    },
  ];

  return (
    <div className="page-shell page-stack">
      <section className="surface-panel page-hero panel-tint-rose">
        <div className="absolute inset-x-8 top-3 h-16 rounded-full bg-[linear-gradient(180deg,hsl(var(--foreground)/0.045),transparent_100%)] blur-xl" />
        <div className="absolute inset-x-16 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--signal-solar)/0.4),transparent)]" />
        <div className="absolute -right-16 top-8 h-48 w-48 rounded-full bg-[radial-gradient(circle,hsl(var(--glow-rose)/0.18)_0%,transparent_70%)] blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-[radial-gradient(circle,hsl(var(--glow-jade)/0.16)_0%,transparent_70%)] blur-2xl" />

        <div className="page-hero-body">
          <div className="page-hero-copy space-y-4">
            <div className="page-hero-kicker">
              <Orbit className="h-3.5 w-3.5 text-[hsl(var(--signal-solar))]" />
              职业观测台
            </div>

            <div className="space-y-3">
              <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
                <TreePine className="h-7 w-7 text-primary" />
                <h1 className="page-hero-title min-w-0 pb-1 text-3xl font-semibold md:text-4xl xl:text-[2.8rem]">
                  {profileLoading ? (
                    <Skeleton className="h-10 w-56" />
                  ) : profile?.name ? (
                    <span className="inline-block text-gradient-cyber">
                      {`你好，${profile.name}`}
                    </span>
                  ) : (
                    <span className="inline-block text-gradient-cyber">
                      欢迎进入你的职业图谱
                    </span>
                  )}
                </h1>
              </div>
              <p className="page-hero-summary max-w-[46rem]">
                {hasData
                  ? `你的能力图谱已上线${profile?.title ? `，当前轨道聚焦 ${profile.title}` : ''}。现在可以把经历、技能和目标岗位组织成一份更锋利的叙事。`
                  : '把履历拆成可计算的模块，再用 AI 让它针对不同岗位重新编排。先上传旧简历，或者直接手动搭建你的职业宇宙。'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button size="lg" onClick={() => setImportOpen(true)} className="gap-2.5">
                <Upload className="h-4 w-4" />
                上传我的简历
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/match" className="gap-2.5">
                  <Target className="h-4 w-4" />
                  开始匹配 JD
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground sm:text-xs">
              <span className="rounded-full border border-transparent bg-background/46 px-3 py-1 shadow-[0_8px_18px_hsl(var(--shadow-color)/0.05)]">
                结构化档案
              </span>
              <span className="rounded-full border border-transparent bg-background/46 px-3 py-1 shadow-[0_8px_18px_hsl(var(--shadow-color)/0.05)]">
                JD 评分分析
              </span>
              <span className="rounded-full border border-transparent bg-background/46 px-3 py-1 shadow-[0_8px_18px_hsl(var(--shadow-color)/0.05)]">
                多版本简历生成
              </span>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 lg:max-w-[28rem]">
            <div className="rounded-[24px] border border-transparent bg-[linear-gradient(180deg,hsl(var(--signal-jade)/0.14),transparent),linear-gradient(180deg,hsl(var(--background)/0.82),hsl(var(--background-alt)/0.42))] p-3.5 shadow-[0_16px_36px_hsl(var(--shadow-color)/0.08)]">
              <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                档案状态
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="cyber-dot inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--signal-jade))]" />
                <span className="text-lg font-semibold">
                  {hasData ? '可开始定向优化' : '等待首次导入'}
                </span>
              </div>
            </div>

            <div className="rounded-[24px] border border-transparent bg-[linear-gradient(180deg,hsl(var(--signal-solar)/0.14),transparent),linear-gradient(180deg,hsl(var(--background)/0.82),hsl(var(--background-alt)/0.42))] p-3.5 shadow-[0_16px_36px_hsl(var(--shadow-color)/0.08)]">
              <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                条目总数
              </div>
              <div className="mt-3 text-4xl font-semibold tabular-nums">{totalItems}</div>
            </div>

            <div className="rounded-[24px] border border-transparent bg-[linear-gradient(180deg,hsl(var(--signal-rose)/0.14),transparent),linear-gradient(180deg,hsl(var(--background)/0.82),hsl(var(--background-alt)/0.42))] p-3.5 shadow-[0_16px_36px_hsl(var(--shadow-color)/0.08)]">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--signal-gold))]" />
                叙事就绪度
              </div>
              <div className="mt-3 text-sm leading-6 text-muted-foreground">
                {hasData
                  ? '已有可用于匹配与生成的基础档案。'
                  : '导入一次旧简历，就能快速生成第一版结构化档案。'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {!hasData ? (
        <EmptyState
          icon={Zap}
          title="还没有档案数据"
          description="上传你的简历，AI 会自动解析并构建结构化档案。也可以手动添加每一条记录。"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button className="gap-2" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4" />
                上传简历
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">手动创建</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                  能力图谱
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">能力概览</h2>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-transparent bg-background/46 px-3 py-1.5 text-xs text-muted-foreground shadow-[0_8px_18px_hsl(var(--shadow-color)/0.05)] sm:flex">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--signal-rose))]" />
                实时条目统计
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {statsCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.label} href={card.href}>
                    <Card className="glow-card-hover corner-bracket relative h-full cursor-pointer overflow-hidden">
                      <div className={`pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full blur-2xl ${card.glow}`} />
                      <CardContent className="relative space-y-6 p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                            {card.label}
                          </span>
                          <Icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <div className="space-y-1">
                          <div className="text-3xl font-semibold tabular-nums">{card.value}</div>
                          <div className="text-xs text-muted-foreground">点击查看</div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card className="glow-card-hover corner-bracket overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  JD 匹配分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  粘贴职位描述，让系统从技术、经验、文化和成长潜力多个维度重算你的竞争力。
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/match" className="gap-2">
                    开始分析
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="glow-card-hover corner-bracket overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-[hsl(var(--signal-gold))]" />
                  生成简历
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  选择叙事策略、语言和长度，生成一份更贴合目标岗位的 Markdown 简历。
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/generate" className="gap-2">
                    进入生成器
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              匹配存档
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">最近匹配记录</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/match" className="gap-2">
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {matchResultsLoading ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="space-y-3 p-5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-14 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentMatchResults.length === 0 ? (
          <EmptyState
            title="暂无匹配记录"
            description="前往 JD 匹配页面开始你的第一次分析"
          />
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {recentMatchResults.map((result) => (
              <Link key={result.id} href="/match">
                <Card className="glow-card-hover corner-bracket h-full overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                          Match Result
                        </div>
                        <CardTitle className="text-base">
                          {result.position || '未命名岗位'}
                          {result.company ? ` · ${result.company}` : ''}
                        </CardTitle>
                      </div>
                      <div className="rounded-full border border-border/70 bg-background/50 px-3 py-1 text-sm font-semibold tabular-nums text-primary">
                        {Math.round(result.overallScore)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {result.summary || '该条分析暂无摘要，可前往匹配页查看完整结果。'}
                    </p>
                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{format(new Date(result.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                      <span className="inline-flex items-center gap-1">
                        查看分析
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <ImportModal open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
