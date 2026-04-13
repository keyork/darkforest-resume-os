'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { isAgentTaskTerminatedError } from '@/components/agent/AgentTaskProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Trash2, Orbit, Sparkles } from 'lucide-react';
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
import { PageHero } from '@/components/shared/PageHero';
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

  // Only show match results that belong to the selected JD (if one is chosen)
  const filteredMatchResults =
    selectedJdId !== 'none'
      ? matchResults.filter((r) => r.jdId === selectedJdId)
      : matchResults;

  function handleJdChange(value: string) {
    setSelectedJdId(value);
    // Clear match selection if it doesn't belong to the newly chosen JD
    if (selectedMatchId !== 'none') {
      const currentMatch = matchResults.find((r) => r.id === selectedMatchId);
      if (!currentMatch || currentMatch.jdId !== value) {
        setSelectedMatchId('none');
      }
    }
  }

  function handleMatchChange(value: string) {
    setSelectedMatchId(value);
    // Auto-sync JD to whichever JD this match result belongs to
    if (value !== 'none') {
      const match = matchResults.find((r) => r.id === value);
      if (match?.jdId) setSelectedJdId(match.jdId);
    }
  }

  async function handleGenerate() {
    try {
      const result = await generateResume.mutateAsync({
        ...strategy,
        jdId: selectedJdId !== 'none' ? selectedJdId : undefined,
        matchResultId: selectedMatchId !== 'none' ? selectedMatchId : undefined,
      });
      setActiveResumeId(result.id);
    } catch (error) {
      if (isAgentTaskTerminatedError(error)) {
        return;
      }
    }
  }

  return (
    <div className="page-shell page-stack">
      <PageHero
        kicker="简历工坊"
        title="简历生成"
        summary="选择叙事策略、语言和上下文，让 AI 输出一份能直接复制、下载、继续微调的 Markdown 简历。"
        icon={Orbit}
        iconClassName="text-[hsl(var(--signal-solar))]"
        glowClassName="bg-[radial-gradient(circle,hsl(var(--glow-solar)/0.18)_0%,transparent_72%)]"
        side={
          <>
            <div className="page-hero-pill">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--signal-jade))]" />
              多策略生成
            </div>
            <div className="page-hero-pill">Markdown 直接导出</div>
            <div className="page-hero-pill">可叠加 JD 与匹配上下文</div>
          </>
        }
      />

      <div className="page-grid-main" data-layout="sidebar">
        {/* Left panel */}
        <div className="flex flex-col gap-4">
          <StrategyPanel value={strategy} onChange={setStrategy} />

          {/* Optional JD / Match context */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">关联上下文（可选）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">关联 JD</Label>
                <Select value={selectedJdId} onValueChange={handleJdChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="不关联" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不关联</SelectItem>
                    {jds.map((jd) => (
                      <SelectItem key={jd.id} value={jd.id}>
                        {jd.parsed?.position ?? '未命名岗位'}
                        {jd.parsed?.company ? ` · ${jd.parsed.company}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  关联匹配结果
                  {selectedJdId !== 'none' && filteredMatchResults.length === 0 && (
                    <span className="ml-1.5 text-muted-foreground/60">（该 JD 暂无匹配记录）</span>
                  )}
                </Label>
                <Select value={selectedMatchId} onValueChange={handleMatchChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="不关联" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不关联</SelectItem>
                    {filteredMatchResults.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.position ?? '未命名岗位'}
                        {r.company ? ` · ${r.company}` : ''}
                        {' · '}{Math.round(r.overallScore)}分
                        {' · '}{format(new Date(r.createdAt), 'MM-dd')}
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
          <Card className="flex min-h-[18rem] flex-col overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">历史简历</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="min-h-[14rem] max-h-[26rem] px-4 pb-4">
                {loadingList ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    加载中…
                  </div>
                ) : resumes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">暂无生成记录</p>
                ) : (
                  <div className="space-y-2">
                    {resumes.map((r) => {
                      const linkedJd = r.jdId ? jds.find((j) => j.id === r.jdId) : null;
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            setActiveResumeId(r.id);
                            // Restore the JD and match context this resume was generated with
                            setSelectedJdId(r.jdId ?? 'none');
                            setSelectedMatchId(r.matchResultId ?? 'none');
                          }}
                          className={cn(
                            'group flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-colors hover:bg-muted/50',
                            activeResumeId === r.id && 'border-primary bg-primary/5'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="line-clamp-2 break-words text-sm font-medium leading-5">
                              {linkedJd?.parsed?.position
                                ? `${linkedJd.parsed.position}${linkedJd.parsed.company ? ` · ${linkedJd.parsed.company}` : ''}`
                                : (r.strategy as StrategyConfig).narrative + ' · ' + ((r.strategy as StrategyConfig).language === 'zh' ? '中文' : 'EN')}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                              {(r.strategy as StrategyConfig).length} · {format(new Date(r.createdAt), 'MM-dd HH:mm')}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteResume.mutate(r.id);
                              if (activeResumeId === r.id) setActiveResumeId(null);
                            }}
                            className="mt-0.5 flex-shrink-0 p-1 rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="删除简历记录"
                            title="删除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right panel — preview */}
        <Card className="flex min-h-[32rem] flex-col overflow-hidden xl:min-h-[40rem]">
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
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 flex-shrink-0">
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
