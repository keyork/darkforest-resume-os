'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useJDs, useParseJD, useDeleteJD } from '@/lib/hooks/useJD';
import type { JobDescription } from '@/lib/types/jd';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface JDInputProps {
  selectedJdId: string | null;
  onSelect: (jd: JobDescription) => void;
  onDeselect: () => void;
}

export function JDInput({ selectedJdId, onSelect, onDeselect }: JDInputProps) {
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

  function handleDelete(e: React.MouseEvent, jd: JobDescription) {
    e.stopPropagation();
    deleteJD.mutate(jd.id);
    if (jd.id === selectedJdId) onDeselect();
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
        <div className="max-h-56 overflow-y-auto">
          <div className="space-y-1.5 pr-1">
            {jds.map((jd) => (
              <div
                key={jd.id}
                onClick={() => onSelect(jd)}
                className={cn(
                  'flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50',
                  selectedJdId === jd.id
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted/30'
                )}
              >
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug break-words">
                    {jd.parsed?.position ?? '未命名岗位'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 break-words">
                    {[jd.parsed?.company, format(new Date(jd.createdAt), 'MM-dd HH:mm')]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>

                {/* Delete button — always visible */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, jd)}
                  className="flex-shrink-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="删除"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : !showNew ? (
        <p className="text-sm text-muted-foreground py-1">暂无历史 JD，请粘贴新的 JD。</p>
      ) : null}

      {/* Add new */}
      {!showNew ? (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" />
          粘贴新 JD
        </Button>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-3 space-y-2">
            <Textarea
              placeholder="粘贴职位描述（JD）全文…"
              className="min-h-[140px] text-sm resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleParse}
                disabled={!text.trim() || parseJD.isPending}
              >
                {parseJD.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : null}
                {parseJD.isPending ? 'AI 解析中…' : 'AI 解析'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setShowNew(false); setText(''); }}
                disabled={parseJD.isPending}
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
