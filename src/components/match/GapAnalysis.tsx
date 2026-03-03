'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { GapItem } from '@/lib/types/match';
import { cn } from '@/lib/utils';

interface GapAnalysisProps {
  gaps: GapItem[];
}

const SEVERITY_LABEL: Record<GapItem['severity'], string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const SEVERITY_STYLE: Record<GapItem['severity'], string> = {
  high: 'border-[hsl(var(--signal-rose)/0.28)] bg-[hsl(var(--signal-rose)/0.12)] text-[hsl(var(--signal-rose))]',
  medium: 'border-[hsl(var(--signal-gold)/0.28)] bg-[hsl(var(--signal-gold)/0.12)] text-[hsl(var(--signal-gold))]',
  low: 'border-[hsl(var(--signal-jade)/0.28)] bg-[hsl(var(--signal-jade)/0.12)] text-[hsl(var(--signal-jade))]',
};

export function GapAnalysis({ gaps }: GapAnalysisProps) {
  if (gaps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        未发现明显差距，候选人与岗位匹配良好。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {gaps.map((gap, i) => (
        <Card key={i} className={cn('border', SEVERITY_STYLE[gap.severity])}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{gap.missing}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0',
                  SEVERITY_STYLE[gap.severity]
                )}
              >
                {SEVERITY_LABEL[gap.severity]}优先级
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground mb-0.5">现状</div>
                <div>{gap.currentState}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">目标</div>
                <div>{gap.targetState}</div>
              </div>
            </div>
            {gap.suggestion && (
              <div className="pt-1 border-t border-current/10">
                <div className="text-xs text-muted-foreground mb-0.5">建议</div>
                <div className="text-xs leading-relaxed">{gap.suggestion}</div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
