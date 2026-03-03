'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Trash2 } from 'lucide-react';
import { StrategyPanel, type StrategyConfig } from '@/components/generate/StrategyPanel';
import { ResumePreview } from '@/components/generate/ResumePreview';
import { ExportButtons } from '@/components/generate/ExportButtons';
import {
  useGenerateResume,
  useGeneratedResumes,
  useGeneratedResume,
  useDeleteGeneratedResume,
} from '@/lib/hooks/useGenerate';
import { useJDs } from '@/lib/hooks/useJD';
import { useMatchResults } from '@/lib/hooks/useMatch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function GeneratePage() {
  const [strategy, setStrategy] = useState<StrategyConfig>({
    narrative: 'achievement',
    language: 'zh',
    length: '1page',
  });
  const [selectedJdId, setSelectedJdId] = useState<string>('none');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('none');
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);

  const { data: jds = [] } = useJDs();
  const { data: matchResults = [] } = useMatchResults();
  const { data: resumes = [], isLoading: loadingList } = useGeneratedResumes();
  const { data: activeResume, isLoading: loadingContent } = useGeneratedResume(activeResumeId ?? '');
  const generateResume = useGenerateResume();
  const deleteResume = useDeleteGeneratedResume();

  async function handleGenerate() {
    const result = await generateResume.mutateAsync({
      ...strategy,
      jdId: selectedJdId !== 'none' ? selectedJdId : undefined,
      matchResultId: selectedMatchId !== 'none' ? selectedMatchId : undefined,
    });
    setActiveResumeId(result.id);
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold">简历生成</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          选择叙事策略，AI 将基于你的简历数据生成一份 Markdown 简历
        </p>
      </div>

      <div className="flex-1 grid grid-cols-[320px_1fr] gap-4 min-h-0">
        {/* Left panel */}
        <div className="flex flex-col gap-4 min-h-0">
          <StrategyPanel value={strategy} onChange={setStrategy} />

          {/* Optional JD / Match context */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">关联上下文（可选）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">关联 JD</Label>
                <Select value={selectedJdId} onValueChange={setSelectedJdId}>
                  <SelectTrigger>
                    <SelectValue placeholder="不关联" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不关联</SelectItem>
                    {jds.map((jd) => (
                      <SelectItem key={jd.id} value={jd.id}>
                        {jd.parsed?.position ?? jd.id}
                        {jd.parsed?.company ? ` · ${jd.parsed.company}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">关联匹配结果</Label>
                <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="不关联" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不关联</SelectItem>
                    {matchResults.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        得分 {Math.round(r.overallScore)} · {format(new Date(r.createdAt), 'MM-dd HH:mm')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={generateResume.isPending}
          >
            {generateResume.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            AI 生成简历
          </Button>

          {generateResume.isError && (
            <p className="text-xs text-destructive">{(generateResume.error as Error).message}</p>
          )}

          {/* History */}
          <Card className="flex-1 min-h-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">历史简历</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-40 px-4 pb-4">
                {loadingList ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    加载中…
                  </div>
                ) : resumes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">暂无生成记录</p>
                ) : (
                  <div className="space-y-2">
                    {resumes.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => setActiveResumeId(r.id)}
                        className={cn(
                          'group flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50',
                          activeResumeId === r.id && 'border-primary bg-primary/5'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {(r.strategy as StrategyConfig).narrative} ·{' '}
                            {(r.strategy as StrategyConfig).language === 'zh' ? '中文' : 'EN'} ·{' '}
                            {(r.strategy as StrategyConfig).length}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(r.createdAt), 'MM-dd HH:mm')}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteResume.mutate(r.id);
                            if (activeResumeId === r.id) setActiveResumeId(null);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right panel — preview */}
        <Card className="flex flex-col min-h-0 overflow-hidden">
          {loadingContent ? (
            <div className="flex items-center justify-center flex-1 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              生成中，请稍候…
            </div>
          ) : !activeResume ? (
            <div className="flex items-center justify-center flex-1 text-center">
              <div className="space-y-2">
                <div className="text-4xl">📄</div>
                <div className="font-medium">简历预览</div>
                <div className="text-sm text-muted-foreground">
                  配置策略后点击「AI 生成简历」
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
                <span className="text-sm font-medium text-muted-foreground">Markdown 预览</span>
                <ExportButtons content={activeResume.content} filename="resume" />
              </div>
              <div className="flex-1 min-h-0">
                <ResumePreview content={activeResume.content} />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
