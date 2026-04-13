'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { parseProfileFromText } from '@/lib/ai/agents/profile-agent';
import {
  isAgentTaskTerminatedError,
  useAgentTasks,
} from '@/components/agent/AgentTaskProvider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingAgent } from '@/components/shared/LoadingAgent';
import { FileUpload } from '@/components/shared/FileUpload';
import { getStoredAIClientConfig } from '@/lib/client/ai-settings';
import {
  getItemDeduplicationKey,
  importParsedProfile,
  listItems,
} from '@/lib/client/workspace-storage';
import { itemKeys } from '@/lib/hooks/useItems';
import { profileKeys } from '@/lib/hooks/useProfile';
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Check,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ItemType, ItemData } from '@/lib/types/item';
import { ITEM_TYPE_LABELS } from '@/lib/types/item';
import type { ParsedProfile } from '@/lib/ai/agents/profile-agent';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'upload' | 'parsing' | 'preview' | 'done';

interface PreviewItem {
  id: string; // temp id for selection
  type: ItemType;
  data: ItemData;
  selected: boolean;
  isDuplicate: boolean;
}

function buildPreviewItems(parsed: ParsedProfile): PreviewItem[] {
  const existingItems = listItems();
  const existingKeys = new Set(
    existingItems
      .map((item) => getItemDeduplicationKey(item.type, item))
      .filter((key): key is string => Boolean(key))
  );
  const currentImportKeys = new Set<string>();
  const items: PreviewItem[] = [];
  let idx = 0;

  function pushItem(type: ItemType, data: ItemData) {
    const dedupKey = getItemDeduplicationKey(type, data);
    const isDuplicate = Boolean(
      dedupKey && (existingKeys.has(dedupKey) || currentImportKeys.has(dedupKey))
    );

    if (dedupKey) {
      currentImportKeys.add(dedupKey);
    }

    items.push({
      id: `p_${idx++}`,
      type,
      data,
      selected: !isDuplicate,
      isDuplicate,
    });
  }

  for (const skill of parsed.skills ?? []) {
    pushItem('skill', { type: 'skill', ...skill });
  }
  for (const exp of parsed.experiences ?? []) {
    pushItem('experience', { type: 'experience', ...exp });
  }
  for (const prj of parsed.projects ?? []) {
    pushItem('project', { type: 'project', ...prj });
  }
  for (const edu of parsed.educations ?? []) {
    pushItem('education', { type: 'education', ...edu });
  }
  for (const cert of parsed.certifications ?? []) {
    pushItem('certification', { type: 'certification', ...cert });
  }

  return items;
}

function getItemSummary(type: ItemType, data: ItemData): string {
  switch (type) {
    case 'skill': return (data as { name: string }).name;
    case 'experience': {
      const d = data as { title: string; company: string };
      return `${d.title} @ ${d.company}`;
    }
    case 'project': return (data as { name: string }).name;
    case 'education': {
      const d = data as { school: string; degree?: string };
      return `${d.school}${d.degree ? ` · ${d.degree}` : ''}`;
    }
    case 'certification': return (data as { name: string }).name;
    default: return '';
  }
}

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { runTask } = useAgentTasks();

  const [step, setStep] = useState<Step>('upload');
  const [inputTab, setInputTab] = useState<'file' | 'text'>('file');
  const [textInput, setTextInput] = useState('');
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedProfile | null>(null);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isLoading, setIsLoading] = useState(false);

  function reset() {
    setStep('upload');
    setTextInput('');
    setRawText('');
    setParsed(null);
    setPreviewItems([]);
    setImportMode('merge');
    setIsLoading(false);
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  async function startParsing(content: string | File) {
    setStep('parsing');

    try {
      const res = await runTask(
        {
          kind: 'profile_parse',
          title: '简历导入解析',
          description: content instanceof File ? content.name : content.slice(0, 80),
          successMessage: '简历内容已完成结构化解析',
        },
        async (signal) => {
          const nextRawText =
            content instanceof File
              ? await extractFileText(content, signal)
              : content;

          const nextParsed = await parseProfileFromText(
            nextRawText,
            getStoredAIClientConfig(),
            signal,
          );

          return {
            rawText: nextRawText,
            parsed: nextParsed,
          };
        }
      );

      const { rawText: rt, parsed: p } = res;
      setRawText(rt);
      setParsed(p);
      setPreviewItems(buildPreviewItems(p));
      setStep('preview');
    } catch (err) {
      if (isAgentTaskTerminatedError(err)) {
        toast.error('解析任务已终止');
        setStep('upload');
        return;
      }
      toast.error(`解析失败: ${String(err)}`);
      setStep('upload');
    }
  }

  async function confirmImport() {
    if (!parsed) return;
    setIsLoading(true);

    try {
      const { imported, skippedDuplicates } = importParsedProfile({
        mode: importMode,
        profileData: parsed.profile,
        items: previewItems.map((item) => ({
          type: item.type,
          data: item.data,
          selected: item.selected,
        })),
      });

      if (skippedDuplicates > 0) {
        toast.success(
          `成功导入 ${imported} 条记录，跳过 ${skippedDuplicates} 条重复记录`
        );
      } else {
        toast.success(`成功导入 ${imported} 条记录，数据已保存在当前浏览器`);
      }

      // Invalidate all queries
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({ queryKey: ['match'] });
      queryClient.invalidateQueries({ queryKey: ['generate'] });

      handleClose();
      router.push('/profile');
    } catch (err) {
      toast.error(`导入失败: ${String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }

  const isPreviewExpanded = step === 'preview';
  const selectedCount = previewItems.filter((i) => i.selected).length;
  const duplicateCount = previewItems.filter((i) => i.isDuplicate).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className={cn(
          'transition-all duration-300',
          isPreviewExpanded
            ? 'max-w-5xl w-[95vw] h-[90vh] flex flex-col'
            : 'max-w-lg'
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {step === 'upload' && '从简历导入'}
            {step === 'parsing' && 'AI 正在解析'}
            {step === 'preview' && '预览解析结果'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <Tabs value={inputTab} onValueChange={(v) => setInputTab(v as 'file' | 'text')}>
              <TabsList className="w-full">
                <TabsTrigger value="file" className="flex-1">上传文件</TabsTrigger>
                <TabsTrigger value="text" className="flex-1">粘贴文本</TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="mt-4">
                <FileUpload
                  onFile={(file) => startParsing(file)}
                />
              </TabsContent>
              <TabsContent value="text" className="mt-4 space-y-3">
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="将简历文本粘贴到这里..."
                  rows={10}
                  className="resize-none"
                />
                <Button
                  className="w-full"
                  disabled={!textInput.trim()}
                  onClick={() => startParsing(textInput)}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  开始解析
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Step 2: Parsing */}
        {step === 'parsing' && (
          <LoadingAgent
            stages={[
              '正在读取简历内容...',
              'AI 正在提取技能信息...',
              '正在解析工作经历...',
              '正在分析项目经历...',
              '正在构建结构化档案...',
            ]}
            className="py-8"
          />
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && parsed && (
          <div className="flex-1 flex flex-col min-h-0 gap-4">
            {/* Mode selector */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm text-muted-foreground">导入方式：</span>
              <div className="flex gap-2">
                {(['merge', 'replace'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setImportMode(mode)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs border transition-colors',
                      importMode === mode
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {mode === 'merge' ? '合并导入（保留现有数据）' : '替换导入（清空现有数据）'}
                  </button>
                ))}
              </div>
            </div>

            {importMode === 'replace' && (
              <Alert className="flex-shrink-0">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  替换模式将清空当前浏览器中的档案条目、匹配分析和简历生成历史，此操作不可撤销。
                </AlertDescription>
              </Alert>
            )}

            {duplicateCount > 0 && (
                <Alert className="flex-shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    检测到 {duplicateCount} 条疑似重复记录，已默认取消勾选；导入时也会自动跳过重复项。
                  </AlertDescription>
                </Alert>
              )}

            {/* Main preview area */}
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
              {/* Left: raw text */}
              <div className="flex flex-col min-h-0">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex-shrink-0">
                  原始简历文本
                </p>
                <ScrollArea className="flex-1 border rounded-md p-3 bg-muted/20">
                  <pre className="text-xs whitespace-pre-wrap text-muted-foreground font-mono">
                    {rawText}
                  </pre>
                </ScrollArea>
              </div>

              {/* Right: parsed items */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    解析出 {previewItems.length} 条记录
                      {duplicateCount > 0 ? ` · 其中 ${duplicateCount} 条疑似重复` : ''}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() =>
                        setPreviewItems((items) => items.map((i) => ({ ...i, selected: true })))
                      }
                    >
                      全选
                    </button>
                    <button
                      className="text-xs text-muted-foreground hover:underline"
                      onClick={() =>
                        setPreviewItems((items) => items.map((i) => ({ ...i, selected: false })))
                      }
                    >
                      全不选
                    </button>
                  </div>
                </div>
                <ScrollArea className="flex-1 border rounded-md">
                  <div className="p-2 space-y-1">
                    {previewItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-start gap-2 p-2 rounded-md text-sm hover:bg-muted/50 transition-colors',
                          !item.selected && 'opacity-50'
                        )}
                      >
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={(checked) =>
                            setPreviewItems((items) =>
                              items.map((i) =>
                                i.id === item.id ? { ...i, selected: Boolean(checked) } : i
                              )
                            )
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {ITEM_TYPE_LABELS[item.type]}
                            </Badge>
                            <span className="text-xs truncate">
                              {getItemSummary(item.type, item.data)}
                            </span>
                          </div>
                          {item.isDuplicate && (
                            <span className="mt-0.5 flex items-center gap-1 text-xs text-[hsl(var(--signal-gold))]">
                              <AlertTriangle className="h-3 w-3" />
                              疑似重复
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between flex-shrink-0 pt-2 border-t">
              <Button
                variant="ghost"
                onClick={() => setStep('upload')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                重新上传
              </Button>
              <Button
                onClick={confirmImport}
                disabled={selectedCount === 0 || isLoading}
              >
                <Check className="h-4 w-4 mr-2" />
                导入选中的 {selectedCount} 条记录
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

async function extractFileText(file: File, signal: AbortSignal): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/profile/import', {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new Error(body || '文件解析失败');
  }

  const data = (await response.json()) as { rawText?: string; error?: string };

  if (!data.rawText?.trim()) {
    throw new Error(data.error ?? '文件解析失败');
  }

  return data.rawText;
}
