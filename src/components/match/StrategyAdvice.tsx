'use client';

import type { MatchResult } from '@/lib/types/match';

interface StrategyAdviceProps {
  strategy: MatchResult['resumeStrategy'];
}

export function StrategyAdvice({ strategy }: StrategyAdviceProps) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="font-medium mb-1.5">叙事主线</div>
        <p className="text-muted-foreground leading-relaxed bg-muted/50 rounded-md p-3">
          {strategy.narrative}
        </p>
      </div>

      {strategy.emphasize.length > 0 && (
        <div>
          <div className="font-medium mb-1.5 text-green-700">重点突出</div>
          <ul className="space-y-1">
            {strategy.emphasize.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {strategy.deemphasize.length > 0 && (
        <div>
          <div className="font-medium mb-1.5 text-muted-foreground">建议弱化</div>
          <ul className="space-y-1">
            {strategy.deemphasize.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground/60">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
