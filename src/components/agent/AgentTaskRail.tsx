'use client';

import { format } from 'date-fns';
import {
  Bot,
  CheckCircle2,
  CircleDashed,
  OctagonX,
  PlayCircle,
  TimerReset,
  X,
  XCircle,
} from 'lucide-react';
import { useAgentTasks, type AgentTask, type AgentTaskStatus } from '@/components/agent/AgentTaskProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_META: Record<
  AgentTaskStatus,
  {
    label: string;
    icon: typeof CircleDashed;
    className: string;
  }
> = {
  planned: {
    label: '已计划',
    icon: CircleDashed,
    className: 'border-[hsl(var(--signal-ink)/0.28)] bg-[hsl(var(--signal-ink)/0.12)] text-[hsl(var(--signal-ink))]',
  },
  in_progress: {
    label: '进行中',
    icon: PlayCircle,
    className: 'border-[hsl(var(--signal-solar)/0.28)] bg-[hsl(var(--signal-solar)/0.12)] text-[hsl(var(--signal-solar))]',
  },
  completed: {
    label: '已完成',
    icon: CheckCircle2,
    className: 'border-[hsl(var(--signal-jade)/0.28)] bg-[hsl(var(--signal-jade)/0.12)] text-[hsl(var(--signal-jade))]',
  },
  failed: {
    label: '失败',
    icon: XCircle,
    className: 'border-[hsl(var(--signal-rose)/0.28)] bg-[hsl(var(--signal-rose)/0.12)] text-[hsl(var(--signal-rose))]',
  },
  terminated: {
    label: '已终止',
    icon: OctagonX,
    className: 'border-border/70 bg-background/40 text-muted-foreground',
  },
};

function TaskRow({ task }: { task: AgentTask }) {
  const { terminateTask, dismissTask } = useAgentTasks();
  const statusMeta = STATUS_META[task.status];
  const StatusIcon = statusMeta.icon;
  const canTerminate = task.status === 'planned' || task.status === 'in_progress';

  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-border/70 bg-background/30 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
          <Bot className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-col items-start gap-2.5">
            <div className="min-w-0 w-full">
              <div className="break-words text-sm font-medium leading-6">{task.title}</div>
              {task.description ? (
                <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                  {task.description}
                </p>
              ) : null}
            </div>

            <Badge
              variant="outline"
              className={cn('max-w-full gap-1 self-start whitespace-nowrap', statusMeta.className)}
            >
              <StatusIcon className="h-3 w-3" />
              {statusMeta.label}
            </Badge>
          </div>

          <div className="mt-3 space-y-1">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              更新时间
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(task.updatedAt), 'MM-dd HH:mm:ss')}
            </div>
          </div>

          {task.successMessage ? (
            <p className="mt-3 break-words text-xs leading-5 text-[hsl(var(--signal-jade))]">
              {task.successMessage}
            </p>
          ) : null}

          {task.errorMessage ? (
            <p
              className={cn(
                'mt-3 break-words text-xs leading-5',
                task.status === 'failed' ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {task.errorMessage}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {canTerminate ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => terminateTask(task.id)}
              >
                终止任务
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissTask(task.id)}
              >
                <X className="h-3.5 w-3.5" />
                移除
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgentTaskRail() {
  const { tasks, clearFinishedTasks } = useAgentTasks();
  const activeCount = tasks.filter((task) => task.status === 'planned' || task.status === 'in_progress').length;

  return (
    <aside className="hidden h-screen w-[320px] flex-shrink-0 overflow-hidden p-3 2xl:sticky 2xl:top-0 2xl:flex">
      <Card className="flex h-full w-full flex-col overflow-hidden">
        <CardHeader className="min-w-0 border-b border-border/60 pb-4">
          <div className="space-y-3">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <CardTitle className="min-w-0 text-lg">Agent 任务</CardTitle>
              <div className="flex flex-shrink-0 items-center gap-2 rounded-full border border-[hsl(var(--signal-solar)/0.28)] bg-[hsl(var(--signal-solar)/0.12)] px-3 py-1.5 text-[hsl(var(--signal-solar))]">
                <TimerReset className="h-3.5 w-3.5" />
                <span className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--signal-solar))]">
                  进行中
                </span>
                <span className="min-w-6 text-right text-sm font-semibold tabular-nums">
                  {activeCount}
                </span>
              </div>
            </div>
            <div className="rounded-[20px] border border-border/60 bg-background/35 px-4 py-3">
              <p className="text-sm leading-6 text-muted-foreground">
                跨页面追踪 AI 任务状态。切页后仍可查看执行进度与最终结果。
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="border-[hsl(var(--signal-rose)/0.28)] bg-[hsl(var(--signal-rose)/0.10)] text-[hsl(var(--signal-rose))] shadow-[0_12px_28px_hsl(var(--signal-rose)/0.10)] hover:border-[hsl(var(--signal-rose)/0.4)] hover:bg-[hsl(var(--signal-rose)/0.16)] hover:text-[hsl(var(--signal-rose))]"
              onClick={clearFinishedTasks}
              disabled={tasks.length === 0}
            >
              清理已结束任务
            </Button>
          </div>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="min-h-full px-4 py-4 pr-6">
              {tasks.length === 0 ? (
                <div className="flex h-full min-h-[220px] items-center justify-center text-center">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">暂无任务</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      当你发起 JD 解析、匹配分析、简历生成或简历导入解析时，
                      任务会显示在这里。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  );
}
