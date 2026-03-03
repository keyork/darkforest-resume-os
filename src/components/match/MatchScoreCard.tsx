'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { MatchScores } from '@/lib/types/match';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';

interface MatchScoreCardProps {
  scores: MatchScores;
  summary: string;
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-900/20 border-emerald-700/30';
  if (score >= 60) return 'bg-amber-900/20 border-amber-700/30';
  return 'bg-rose-900/20 border-rose-700/30';
}

function scoreGlowStyle(score: number): CSSProperties {
  if (score >= 80) return { textShadow: '0 0 20px hsl(160 84% 55% / 0.85), 0 0 45px hsl(160 84% 55% / 0.35)' };
  if (score >= 60) return { textShadow: '0 0 20px hsl(43 96% 56% / 0.85), 0 0 45px hsl(43 96% 56% / 0.35)' };
  return { textShadow: '0 0 20px hsl(351 95% 71% / 0.85), 0 0 45px hsl(351 95% 71% / 0.35)' };
}

function shimmerBarStyle(score: number): CSSProperties {
  const stops =
    score >= 80
      ? '#34d399 0%, #67e8f9 50%, #34d399 100%'
      : score >= 60
      ? '#fbbf24 0%, #fde68a 50%, #fbbf24 100%'
      : '#fb7185 0%, #fda4af 50%, #fb7185 100%';
  return {
    width: `${score}%`,
    background: `linear-gradient(90deg, ${stops})`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 2.5s ease-in-out infinite',
  };
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
      <Card className={cn('border-2 corner-bracket', scoreBg(scores.overall))}>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="text-center flex-shrink-0">
            <div
              className={cn('text-6xl font-bold tabular-nums', scoreColor(scores.overall))}
              style={scoreGlowStyle(scores.overall)}
            >
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
              {/* Shimmer progress bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={shimmerBarStyle(score)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
