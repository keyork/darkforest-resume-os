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
  critical: 'bg-red-100 text-red-700 border-red-200',
  important: 'bg-blue-100 text-blue-700 border-blue-200',
  nice_to_have: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABEL: Record<RequirementMatch['status'], string> = {
  strong_match: '强匹配',
  partial_match: '部分匹配',
  weak_match: '弱匹配',
  no_match: '不匹配',
};

const STATUS_STYLE: Record<RequirementMatch['status'], string> = {
  strong_match: 'text-green-600',
  partial_match: 'text-yellow-600',
  weak_match: 'text-orange-500',
  no_match: 'text-red-500',
};

const STATUS_DOT: Record<RequirementMatch['status'], string> = {
  strong_match: 'bg-green-500',
  partial_match: 'bg-yellow-500',
  weak_match: 'bg-orange-400',
  no_match: 'bg-red-400',
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
