'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { DarkforestLogo } from '@/components/layout/DarkforestLogo';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  User,
  Target,
  FileText,
  PanelLeft,
  Sparkles,
  Settings2,
} from 'lucide-react';
import { useDemoMode } from '@/lib/hooks/useDemoMode';

const navItems = [
  { href: '/', label: '总览', icon: LayoutDashboard, slug: 'home' },
  { href: '/profile', label: '我的档案', icon: User, slug: 'profile' },
  { href: '/match', label: 'JD 匹配', icon: Target, slug: 'match' },
  { href: '/generate', label: '生成简历', icon: FileText, slug: 'generate' },
];

function SidebarContent({
  pathname,
  onNavigate,
  mobile = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const { isDemoMode } = useDemoMode();

  return (
    <div
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-[30px] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)/0.82),hsl(var(--surface-soft)/0.56))] p-4 shadow-[0_28px_90px_hsl(var(--shadow-color)/0.28)] backdrop-blur-2xl',
        mobile && 'rounded-none border-0 bg-transparent p-0 shadow-none backdrop-blur-none'
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-28 rounded-full bg-[radial-gradient(circle,hsl(var(--signal-ink)/0.24)_0%,transparent_68%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-8 top-20 h-32 w-32 rounded-full bg-[radial-gradient(circle,hsl(var(--signal-solar)/0.14)_0%,transparent_72%)] blur-3xl" />

      <div className="relative flex items-start gap-3 border-b border-border/60 pb-5">
        <DarkforestLogo className="shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
            Darkforest
          </p>
          <h2 className="mt-1 text-lg font-semibold leading-none tracking-tight">
            <span className="text-gradient-cyber">resume os</span>
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            一个用于匹配、优化与生成简历的自适应档案系统。
          </p>
        </div>
      </div>

      <div className="relative mt-5 rounded-2xl border border-border/60 bg-[linear-gradient(180deg,hsl(var(--background)/0.42),hsl(var(--background-alt)/0.28))] p-3 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.06)]">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--signal-ink))]" />
          模式切换
        </div>
        <div className="mt-3">
          <ThemeToggle className="w-full justify-between" />
        </div>
      </div>

      <nav className="relative mt-5 flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 text-sm transition-all',
                isActive
                  ? 'border-primary/26 bg-[linear-gradient(180deg,hsl(var(--primary)/0.14),hsl(var(--signal-ink)/0.08))] text-foreground shadow-[0_18px_40px_hsl(var(--primary)/0.14)]'
                  : 'border-transparent text-muted-foreground hover:border-border/70 hover:bg-[linear-gradient(180deg,hsl(var(--background)/0.34),hsl(var(--background-alt)/0.2))] hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-3 left-0 w-1 rounded-r-full bg-transparent transition-colors',
                  isActive && 'bg-primary'
                )}
              />
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl border transition-all',
                  isActive
                    ? 'border-primary/24 bg-primary/12 text-primary'
                    : 'border-border/60 bg-background/46 text-muted-foreground group-hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 font-medium">{item.label}</span>
              <span
                className={cn(
                  'text-[10px] uppercase tracking-[0.24em] text-muted-foreground transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}
              >
                {item.slug}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-5 rounded-2xl border border-border/60 bg-[linear-gradient(180deg,hsl(var(--background)/0.44),hsl(var(--background-alt)/0.26))] p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.06)]">
        <p className="text-[10px] uppercase tracking-[0.38em] text-muted-foreground">数据隐私安全性</p>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              'cyber-dot inline-block h-2.5 w-2.5 rounded-full',
              isDemoMode ? 'bg-[hsl(var(--signal-solar))]' : 'bg-[hsl(var(--signal-jade))]'
            )}
          />
          <span className="text-sm font-medium">
            {isDemoMode ? '示例环境已开启' : '浏览器本地存储'}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          数据全部保存在当前浏览器，LLM 请求由前端直接发往你配置的模型服务，服务器不收集你的档案或 API Key。
        </p>

        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors',
            pathname === '/settings'
              ? 'border-primary/28 bg-[linear-gradient(180deg,hsl(var(--primary)/0.14),hsl(var(--signal-ink)/0.08))] text-foreground'
              : 'border-border/60 bg-background/40 text-muted-foreground hover:border-primary/25 hover:bg-background/56 hover:text-foreground'
          )}
        >
          <Settings2 className="h-4 w-4" />
          AI 设置
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-[linear-gradient(180deg,hsl(var(--background)/0.86),hsl(var(--background-alt)/0.64))] px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">打开导航</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[86vw] max-w-[360px] border-r border-border/60 bg-[linear-gradient(180deg,hsl(var(--background)/0.92),hsl(var(--background-alt)/0.8))] p-4"
            >
              <SheetTitle className="sr-only">主导航</SheetTitle>
              <SidebarContent
                pathname={pathname}
                mobile
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3">
            <DarkforestLogo compact className="shadow-[0_12px_28px_hsl(var(--primary)/0.12)]" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
                Darkforest
              </p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-gradient-cyber">
                resume os
              </p>
            </div>
          </div>
        </div>
        <ThemeToggle compact />
      </div>

      <aside className="hidden h-screen w-[252px] flex-shrink-0 overflow-hidden p-3 lg:sticky lg:top-0 lg:flex xl:w-[272px] 2xl:w-[288px]">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
}
