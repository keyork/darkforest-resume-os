'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ImportModal } from '@/components/profile/ImportModal';
import { useItems } from '@/lib/hooks/useItems';
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
} from 'lucide-react';

export function DashboardClient() {
  const [importOpen, setImportOpen] = useState(false);
  const router = useRouter();

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: skills } = useItems('skill');
  const { data: experiences } = useItems('experience');
  const { data: projects } = useItems('project');
  const { data: educations } = useItems('education');
  const { data: certifications } = useItems('certification');

  const totalItems =
    (skills?.length ?? 0) +
    (experiences?.length ?? 0) +
    (projects?.length ?? 0) +
    (educations?.length ?? 0) +
    (certifications?.length ?? 0);

  const hasData = totalItems > 0;

  const statsCards = [
    {
      label: '技能',
      value: skills?.length ?? 0,
      icon: Brain,
      href: '/profile?tab=skill',
      color: 'text-blue-500',
    },
    {
      label: '工作经历',
      value: experiences?.length ?? 0,
      icon: Briefcase,
      href: '/profile?tab=experience',
      color: 'text-purple-500',
    },
    {
      label: '项目',
      value: projects?.length ?? 0,
      icon: FolderOpen,
      href: '/profile?tab=project',
      color: 'text-green-500',
    },
    {
      label: '教育',
      value: educations?.length ?? 0,
      icon: GraduationCap,
      href: '/profile?tab=education',
      color: 'text-orange-500',
    },
    {
      label: '证书',
      value: certifications?.length ?? 0,
      icon: Award,
      href: '/profile?tab=certification',
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TreePine className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">
              {profileLoading ? (
                <Skeleton className="h-7 w-48 inline-block" />
              ) : profile?.name ? (
                `你好，${profile.name}`
              ) : (
                '欢迎使用 darkforest'
              )}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {hasData
              ? '你的能力图谱已就绪，随时可以进行 JD 匹配分析'
              : '从上传简历开始，或手动创建你的能力图谱'}
          </p>
        </div>
      </div>

      {/* Main actions */}
      <div className="flex gap-3">
        <Button size="lg" onClick={() => setImportOpen(true)} className="gap-2">
          <Upload className="h-5 w-5" />
          上传我的简历
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/match" className="gap-2">
            <Target className="h-5 w-5" />
            开始匹配 JD
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {!hasData ? (
        <EmptyState
          icon={Zap}
          title="还没有档案数据"
          description="上传你的简历，AI 会自动解析并构建结构化档案。也可以手动添加每一条记录。"
          action={
            <div className="flex gap-2">
              <Button onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
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
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              能力概览
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {statsCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.label} href={card.href}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 space-y-2">
                        <Icon className={`h-5 w-5 ${card.color}`} />
                        <div>
                          <div className="text-2xl font-bold">{card.value}</div>
                          <div className="text-xs text-muted-foreground">{card.label}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  JD 匹配分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  粘贴职位描述，AI 分析你与岗位的匹配度
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/match">开始分析</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  生成简历
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  选择叙事策略，AI 生成针对性的 Markdown 简历
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/generate">生成简历</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Match history placeholder */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          最近匹配记录
        </h2>
        <EmptyState
          title="暂无匹配记录"
          description="前往 JD 匹配页面开始你的第一次分析"
        />
      </div>

      <ImportModal open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
