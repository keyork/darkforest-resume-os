'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { MatchScores } from '@/lib/types/match';
import { cn } from '@/lib/utils';

interface MatchScoreCardProps {
  scores: MatchScores;
  summary: string;
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-500';
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-green-50 border-green-200';
  if (score >= 60) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

const SCORE_LABELS: Record<keyof Omit<MatchScores, 'overall'>, string> = {
  technicalFit: '技术匹配',
  experienceFit: '经验匹配',
  educationFit: '学历匹配',
  culturalFit: '文化适配',
  growthPotential: '成长潜力',
};

const SCORE_WEIGHTS: Record<keyof Omit<MatchScores, 'overall'>, string> = {
  technicalFit: '35%',
  experienceFit: '30%',
  educationFit: '10%',
  culturalFit: '10%',
  growthPotential: '15%',
};

export function MatchScoreCard({ scores, summary }: MatchScoreCardProps) {
  return (
    <div className="space-y-4">
      {/* Overall score hero */}
      <Card className={cn('border-2', scoreBg(scores.overall))}>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="text-center flex-shrink-0">
            <div className={cn('text-6xl font-bold tabular-nums', scoreColor(scores.overall))}>
              {Math.round(scores.overall)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">综合匹配度</div>
          </div>
          <div className="flex-1">
            <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dimension scores */}
      <div className="grid grid-cols-5 gap-2">
        {(Object.keys(SCORE_LABELS) as (keyof typeof SCORE_LABELS)[]).map((key) => {
          const score = scores[key];
          return (
            <div key={key} className="text-center space-y-1">
              <div className={cn('text-xl font-semibold', scoreColor(score))}>
                {Math.round(score)}
              </div>
              <div className="text-xs text-muted-foreground">{SCORE_LABELS[key]}</div>
              <div className="text-xs text-muted-foreground/50">{SCORE_WEIGHTS[key]}</div>
              {/* Progress bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-400'
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
