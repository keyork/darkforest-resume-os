'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useJDs, useParseJD, useDeleteJD } from '@/lib/hooks/useJD';
import type { JobDescription } from '@/lib/types/jd';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface JDInputProps {
  selectedJdId: string | null;
  onSelect: (jd: JobDescription) => void;
}

export function JDInput({ selectedJdId, onSelect }: JDInputProps) {
  const [text, setText] = useState('');
  const [showNew, setShowNew] = useState(false);

  const { data: jds = [], isLoading: loadingList } = useJDs();
  const parseJD = useParseJD();
  const deleteJD = useDeleteJD();

  async function handleParse() {
    if (!text.trim()) return;
    const jd = await parseJD.mutateAsync(text.trim());
    onSelect(jd);
    setText('');
    setShowNew(false);
  }

  return (
    <div className="space-y-3">
      {/* History list */}
      {loadingList ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          加载中…
        </div>
      ) : jds.length > 0 ? (
        <ScrollArea className="max-h-64">
          <div className="space-y-2 pr-2">
            {jds.map((jd) => (
              <div
                key={jd.id}
                onClick={() => onSelect(jd)}
                className={cn(
                  'group flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50',
                  selectedJdId === jd.id && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {jd.parsed?.position ?? '未命名岗位'}
                  </div>
                  {jd.parsed?.company && (
                    <div className="text-xs text-muted-foreground truncate">{jd.parsed.company}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(jd.createdAt), 'MM-dd HH:mm')}
                  </div>
                </div>
                {jd.parsed && (
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    已解析
                  </Badge>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteJD.mutate(jd.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : !showNew ? (
        <p className="text-sm text-muted-foreground py-2">暂无历史 JD，请粘贴新的 JD。</p>
      ) : null}

      {/* Add new */}
      {!showNew ? (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" />
          粘贴新 JD
        </Button>
      ) : (
        <Card>
          <CardContent className="p-3 space-y-2">
            <Textarea
              placeholder="粘贴职位描述（JD）全文…"
              className="min-h-[160px] text-sm resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleParse}
                disabled={!text.trim() || parseJD.isPending}
              >
                {parseJD.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                AI 解析
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowNew(false);
                  setText('');
                }}
              >
                取消
              </Button>
            </div>
            {parseJD.isError && (
              <p className="text-xs text-destructive">{(parseJD.error as Error).message}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
