'use client';

import Link from 'next/link';
import { Beaker, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { exitDemoMode } from '@/lib/client/demo-mode';
import { useDemoMode } from '@/lib/hooks/useDemoMode';

export function AppModeBanner() {
  const { isDemoMode, hasBackup, mounted } = useDemoMode();

  if (!mounted || !isDemoMode) {
    return null;
  }

  function handleExitDemoMode() {
    exitDemoMode();
    toast.success(hasBackup ? '已退出示例环境，并恢复你原来的本地工作区' : '已退出示例环境，并清空示例数据');
  }

  return (
    <div className="sticky top-0 z-30 page-shell pb-0 pt-4">
      <div className="surface-panel panel-tint-jade flex flex-col gap-4 rounded-[28px] border-primary/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Beaker className="h-4 w-4 text-[hsl(var(--signal-jade))]" />
            当前为示例环境
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            已预置中文示例档案、两条 JD、匹配结果和示例简历，方便你先浏览完整流程。真正发起解析、匹配或生成时，仍需在设置页填入自己的 API Key。
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground/80">
            数据只保存在当前浏览器；LLM 请求由前端直接发往你配置的模型服务，服务器不代收你的简历、JD 或 API Key。
          </p>
        </div>

        <div className="grid w-full gap-2 sm:w-auto sm:min-w-[280px] sm:grid-cols-2">
          <Button variant="outline" onClick={handleExitDemoMode} className="w-full">
            退出示例环境
          </Button>
          <Button asChild className="w-full gap-2">
            <Link href="/settings">
              <ShieldCheck className="h-4 w-4" />
              去填 API Key
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
