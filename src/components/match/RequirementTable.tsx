'use client';

import type { RequirementMatch } from '@/lib/types/match';
import { cn } from '@/lib/utils';

interface RequirementTableProps {
  matches: RequirementMatch[];
}

const PRIORITY_LABEL: Record<RequirementMatch['priority'], string> = {
  critical: '必须',
  important: '重要',
  nice_to_have: '加分',
};

const PRIORITY_STYLE: Record<RequirementMatch['priority'], string> = {
  critical: 'bg-rose-900/30 text-rose-400 border-rose-700/40',
  important: 'bg-cyan-900/30 text-cyan-400 border-cyan-700/40',
  nice_to_have: 'bg-violet-900/30 text-violet-400 border-violet-700/40',
};

const STATUS_LABEL: Record<RequirementMatch['status'], string> = {
  strong_match: '强匹配',
  partial_match: '部分匹配',
  weak_match: '弱匹配',
  no_match: '不匹配',
};

const STATUS_STYLE: Record<RequirementMatch['status'], string> = {
  strong_match: 'text-emerald-400',
  partial_match: 'text-amber-400',
  weak_match: 'text-orange-400',
  no_match: 'text-rose-400',
};

const STATUS_DOT: Record<RequirementMatch['status'], string> = {
  strong_match: 'bg-emerald-400',
  partial_match: 'bg-amber-400',
  weak_match: 'bg-orange-400',
  no_match: 'bg-rose-400',
};

export function RequirementTable({ matches }: RequirementTableProps) {
  if (matches.length === 0) return null;

  return (
    <div className="space-y-2">
      {matches.map((m, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-1.5">
          <div className="flex items-start gap-2">
            <span
              className={cn(
                'mt-0.5 inline-block px-1.5 py-0.5 text-xs rounded border font-medium flex-shrink-0',
                PRIORITY_STYLE[m.priority]
              )}
            >
              {PRIORITY_LABEL[m.priority]}
            </span>
            <span className="text-sm font-medium leading-snug flex-1">{m.requirement}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[m.status])} />
              <span className={cn('text-xs font-medium', STATUS_STYLE[m.status])}>
                {STATUS_LABEL[m.status]}
              </span>
            </div>
          </div>
          {m.evidence && (
            <p className="text-xs text-muted-foreground pl-1 leading-relaxed">{m.evidence}</p>
          )}
        </div>
      ))}
    </div>
  );
}
