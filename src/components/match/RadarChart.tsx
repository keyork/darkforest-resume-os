'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { MatchScores } from '@/lib/types/match';

interface RadarChartProps {
  scores: MatchScores;
}

export function RadarChart({ scores }: RadarChartProps) {
  const data = [
    { subject: '技术匹配', value: scores.technicalFit, fullMark: 100 },
    { subject: '经验匹配', value: scores.experienceFit, fullMark: 100 },
    { subject: '学历匹配', value: scores.educationFit, fullMark: 100 },
    { subject: '文化适配', value: scores.culturalFit, fullMark: 100 },
    { subject: '成长潜力', value: scores.growthPotential, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RechartsRadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
        />
        <Radar
          name="匹配度"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value: number | undefined) => [`${value ?? ''}`, '得分']}
          contentStyle={{
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
