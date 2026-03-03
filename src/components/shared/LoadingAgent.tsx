'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingAgentProps {
  stages?: string[];
  className?: string;
}

const DEFAULT_STAGES = [
  'AI 正在分析...',
  '解构内容结构...',
  '提取关键信息...',
  '构建数据模型...',
  '完成处理...',
];

export function LoadingAgent({
  stages = DEFAULT_STAGES,
  className,
}: LoadingAgentProps) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (currentStage >= stages.length - 1) return;
    const timer = setInterval(() => {
      setCurrentStage((s) => Math.min(s + 1, stages.length - 1));
    }, 1500);
    return () => clearInterval(timer);
  }, [currentStage, stages.length]);

  return (
    <div className={cn('flex flex-col items-center gap-4 py-8', className)}>
      {/* Spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border border-primary/30 animate-pulse" />
      </div>
      {/* Stage text */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{stages[currentStage]}</p>
        <div className="flex gap-1 justify-center">
          {stages.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i <= currentStage
                  ? 'w-4 bg-primary'
                  : 'w-1 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
