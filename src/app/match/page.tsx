'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { isAgentTaskTerminatedError } from '@/components/agent/AgentTaskProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Trash2, ChevronRight, Orbit, Sparkles } from 'lucide-react';
import { JDInput } from '@/components/match/JDInput';
import { JDDetail } from '@/components/match/JDDetail';
import { MatchScoreCard } from '@/components/match/MatchScoreCard';
import { RadarChart } from '@/components/match/RadarChart';
import { RequirementTable } from '@/components/match/RequirementTable';
import { GapAnalysis } from '@/components/match/GapAnalysis';
import { StrategyAdvice } from '@/components/match/StrategyAdvice';
import { useRunMatch, useMatchResults, useDeleteMatch, useMatchResult } from '@/lib/hooks/useMatch';
import { useJDs } from '@/lib/hooks/useJD';
import type { JobDescription } from '@/lib/types/jd';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
export default function MatchPage() {
  const [selectedJd, setSelectedJd] = useState<JobDescription | null>(null);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  // 'jd' shows the JD detail panel; 'result' shows match results
  const [rightTab, setRightTab] = useState<'jd' | 'result'>('jd');

  const { data: results = [], isLoading: loadingResults } = useMatchResults();
  const { data: jds = [] } = useJDs();
  const runMatch = useRunMatch();
  const deleteMatch = useDeleteMatch();
  const { data: activeResult, isLoading: loadingDetail } = useMatchResult(activeResultId ?? '');

  async function handleRunMatch() {
    if (!selectedJd) return;
    try {
      const result = await runMatch.mutateAsync(selectedJd.id);
      setActiveResultId(result.id);
      setRightTab('result');
    } catch (error) {
      if (isAgentTaskTerminatedError(error)) {
        return;
      }
    }
  }

  function handleSelectJd(jd: JobDescription) {
    setSelectedJd(jd);
    setRightTab('jd');
  }

  return (
    <div className="page-shell page-stack">
      <section className="surface-panel page-hero">
        <div className="absolute -right-8 top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,hsl(var(--glow-rose)/0.18)_0%,transparent_72%)] blur-2xl" />
        <div className="page-hero-body">
          <div className="page-hero-copy">
            <div className="page-hero-kicker">
              <Orbit className="h-3.5 w-3.5 text-[hsl(var(--signal-rose))]" />
              岗位锁定
            </div>
            <h1 className="page-hero-title mt-4 text-3xl font-semibold sm:text-4xl">
              <span className="inline-block text-gradient-cyber">JD 匹配分析</span>
            </h1>
            <p className="page-hero-summary">
              选择或解析一份职位描述，AI 会把你的档案映射到岗位要求、差距项和简历策略。
            </p>
          </div>

          <div className="page-hero-side">
            <div className="inline-flex items-center gap-2 page-hero-pill">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--signal-solar))]" />
              五维语义评分
            </div>
            <div className="page-hero-pill">
              差距分析
            </div>
            <div className="page-hero-pill">
              简历策略建议
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left panel */}
        <div className="flex flex-col gap-3">
          <Card className="flex-shrink-0">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">职位描述</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <JDInput
                selectedJdId={selectedJd?.id ?? null}
                onSelect={handleSelectJd}
                onDeselect={() => setSelectedJd(null)}
              />
            </CardContent>
          </Card>

          <Button
            className="w-full flex-shrink-0"
            disabled={!selectedJd || runMatch.isPending}
            onClick={handleRunMatch}
          >
            {runMatch.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {runMatch.isPending ? '分析中…' : '开始匹配分析'}
          </Button>

          {runMatch.isError && (
            <p className="text-xs text-destructive px-1">{(runMatch.error as Error).message}</p>
          )}

          {/* Match history */}
          <Card className="flex min-h-[18rem] flex-col overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4 flex-shrink-0">
              <CardTitle className="text-sm">历史匹配</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="min-h-[14rem] max-h-[26rem] px-4 pb-4">
                {loadingResults ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    加载中…
                  </div>
                ) : results.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">暂无分析记录</p>
                ) : (
                  <div className="space-y-1.5">
                    {results.map((r) => {
                      const isActive = activeResultId === r.id && rightTab === 'result';
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            setActiveResultId(r.id);
                            setRightTab('result');
                            const jd = jds.find((j) => j.id === r.jdId);
                            if (jd) setSelectedJd(jd);
                          }}
                          className={cn(
                            'flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-colors hover:bg-muted/50',
                            isActive ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="line-clamp-2 break-words text-sm font-medium leading-5">
                              {r.position ?? '未命名岗位'}
                              {r.company ? ` · ${r.company}` : ''}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                              <span className={cn(
                                'font-semibold tabular-nums',
                                r.overallScore >= 80 ? 'text-[hsl(var(--signal-jade))]'
                                  : r.overallScore >= 60 ? 'text-[hsl(var(--signal-gold))]'
                                  : 'text-[hsl(var(--signal-rose))]'
                              )}>
                                {Math.round(r.overallScore)}分
                              </span>
                              <span>·</span>
                              <span>{format(new Date(r.createdAt), 'MM-dd HH:mm')}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMatch.mutate(r.id);
                              if (activeResultId === r.id) setActiveResultId(null);
                            }}
                            className="mt-0.5 flex-shrink-0 p-1 rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="删除匹配记录"
                            title="删除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
        <Card className="flex min-h-[34rem] flex-col overflow-hidden">
          {!selectedJd && !activeResult ? (
            <div className="flex items-center justify-center flex-1 text-center">
              <div className="space-y-2">
                <div className="text-4xl">🎯</div>
                <div className="font-medium">选择一份职位开始</div>
                <div className="text-sm text-muted-foreground">
                  从左侧列表选择或粘贴新的 JD
                </div>
              </div>
            </div>
          ) : (
            <Tabs
              value={rightTab}
              onValueChange={(v) => setRightTab(v as 'jd' | 'result')}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              <div className="flex-shrink-0 border-b px-4 pt-3">
                <TabsList className="h-8">
                  <TabsTrigger value="jd" disabled={!selectedJd} className="text-xs h-7">
                    JD 详情
                  </TabsTrigger>
                  <TabsTrigger value="result" disabled={!activeResult && !loadingDetail} className="text-xs h-7">
                    匹配结果
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* JD detail tab */}
              <TabsContent value="jd" className="flex-1 min-h-0 overflow-hidden mt-0">
                {selectedJd ? (
                  <JDDetail jd={selectedJd} />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    请先选择一份 JD
                  </div>
                )}
              </TabsContent>

              {/* Match result tab */}
              <TabsContent value="result" className="flex-1 min-h-0 overflow-auto mt-0 p-5">
                {loadingDetail ? (
                  <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    加载分析结果…
                  </div>
                ) : !activeResult ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    点击左侧历史记录查看，或运行新的匹配分析
                  </div>
                ) : (
                  <div className="space-y-4">
                    <MatchScoreCard scores={activeResult.scores} summary={activeResult.summary} />

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">能力雷达图</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RadarChart scores={activeResult.scores} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">简历策略建议</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <StrategyAdvice strategy={activeResult.resumeStrategy} />
                        </CardContent>
                      </Card>
                    </div>

                    <Tabs defaultValue="requirements">
                      <TabsList>
                        <TabsTrigger value="requirements">
                          需求匹配 ({activeResult.requirementMatches.length})
                        </TabsTrigger>
                        <TabsTrigger value="gaps">
                          差距分析 ({activeResult.gaps.length})
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="requirements" className="mt-4">
                        <RequirementTable matches={activeResult.requirementMatches} />
                      </TabsContent>
                      <TabsContent value="gaps" className="mt-4">
                        <GapAnalysis gaps={activeResult.gaps} />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </Card>
      </div>
    </div>
  );
}
