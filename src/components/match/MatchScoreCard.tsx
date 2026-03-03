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
  if (score >= 80) return 'text-[hsl(var(--signal-jade))]';
  if (score >= 60) return 'text-[hsl(var(--signal-gold))]';
  return 'text-[hsl(var(--signal-rose))]';
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-[hsl(var(--signal-jade)/0.10)] border-[hsl(var(--signal-jade)/0.25)]';
  if (score >= 60) return 'bg-[hsl(var(--signal-gold)/0.10)] border-[hsl(var(--signal-gold)/0.25)]';
  return 'bg-[hsl(var(--signal-rose)/0.10)] border-[hsl(var(--signal-rose)/0.25)]';
}

function scoreGlowStyle(score: number): CSSProperties {
  if (score >= 80) return { textShadow: '0 0 18px hsl(var(--signal-jade) / 0.72), 0 0 42px hsl(var(--signal-jade) / 0.26)' };
  if (score >= 60) return { textShadow: '0 0 18px hsl(var(--signal-gold) / 0.72), 0 0 42px hsl(var(--signal-gold) / 0.26)' };
  return { textShadow: '0 0 18px hsl(var(--signal-rose) / 0.72), 0 0 42px hsl(var(--signal-rose) / 0.26)' };
}

function shimmerBarStyle(score: number): CSSProperties {
  const stops =
    score >= 80
      ? 'hsl(var(--signal-jade)) 0%, hsl(var(--signal-ink)) 50%, hsl(var(--signal-jade)) 100%'
      : score >= 60
      ? 'hsl(var(--signal-gold)) 0%, hsl(var(--signal-solar)) 50%, hsl(var(--signal-gold)) 100%'
      : 'hsl(var(--signal-rose)) 0%, hsl(var(--signal-solar)) 50%, hsl(var(--signal-rose)) 100%';
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
      <Card className={cn('corner-bracket border-2', scoreBg(scores.overall))}>
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
