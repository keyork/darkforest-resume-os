'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NarrativeStrategy } from '@/lib/types/resume';

const NARRATIVE_OPTIONS: { value: NarrativeStrategy; label: string; description: string }[] = [
  { value: 'achievement', label: '成果导向', description: '以量化成果为核心，突出业绩数据' },
  { value: 'skill', label: '技能导向', description: '技能矩阵开头，围绕核心能力组织' },
  { value: 'growth', label: '成长轨迹', description: '时间线展示晋升与职责扩展' },
  { value: 'leadership', label: '领导力', description: '突出管理经验、团队规模与跨部门影响' },
  { value: 'technical', label: '技术深度', description: '强调架构决策、系统规模与技术深度' },
];

export interface StrategyConfig {
  narrative: NarrativeStrategy;
  language: 'zh' | 'en';
  length: '1page' | '2page';
}

interface StrategyPanelProps {
  value: StrategyConfig;
  onChange: (v: StrategyConfig) => void;
}

export function StrategyPanel({ value, onChange }: StrategyPanelProps) {
  const selected = NARRATIVE_OPTIONS.find((o) => o.value === value.narrative);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">生成策略</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>叙事策略</Label>
          <Select
            value={value.narrative}
            onValueChange={(v) => onChange({ ...value, narrative: v as NarrativeStrategy })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NARRATIVE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && (
            <p className="text-xs text-muted-foreground">{selected.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>语言</Label>
            <Select
              value={value.language}
              onValueChange={(v) => onChange({ ...value, language: v as 'zh' | 'en' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>页数</Label>
            <Select
              value={value.length}
              onValueChange={(v) => onChange({ ...value, length: v as '1page' | '2page' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1page">单页</SelectItem>
                <SelectItem value="2page">双页</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
