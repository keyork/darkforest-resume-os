'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ItemForm } from './ItemForm';
import {
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Item, ItemType, SkillItem, ExperienceItem, ProjectItem, EducationItem, CertificationItem } from '@/lib/types/item';
import { SKILL_LEVEL_LABELS, SKILL_CATEGORY_LABELS } from '@/lib/types/item';
import { useToggleVisibility, useDeleteItem } from '@/lib/hooks/useItems';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ItemCardProps {
  item: Item;
}

function SourceBadge({ source }: { source: Item['source'] }) {
  if (source === 'manual') return null;
  if (source === 'ai_parsed') {
    return (
      <Badge variant="outline" className="text-xs gap-1 border-blue-300 text-blue-600 bg-blue-50">
        <Sparkles className="h-3 w-3" /> AI 解析
      </Badge>
    );
  }
  if (source === 'ai_confirmed') {
    return (
      <Badge variant="outline" className="text-xs gap-1 border-zinc-300 text-zinc-500">
        <CheckCircle2 className="h-3 w-3" /> 已确认
      </Badge>
    );
  }
  return null;
}

function ItemSummary({ item }: { item: Item }) {
  switch (item.type) {
    case 'skill': {
      const s = item as SkillItem;
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{s.name}</span>
          <span className="text-xs text-muted-foreground">{SKILL_CATEGORY_LABELS[s.category]}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full',
                  i < s.level ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{SKILL_LEVEL_LABELS[s.level]}</span>
          {s.yearsOfExperience && (
            <span className="text-xs text-muted-foreground">{s.yearsOfExperience}年</span>
          )}
        </div>
      );
    }
    case 'experience': {
      const e = item as ExperienceItem;
      return (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{e.title}</span>
            <span className="text-sm text-muted-foreground">@ {e.company}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{e.startDate} — {e.isCurrent ? '至今' : (e.endDate ?? '')}</span>
            {e.location && <span>· {e.location}</span>}
            {e.achievements.length > 0 && (
              <span>· {e.achievements.length} 条成果</span>
            )}
          </div>
          {e.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{e.description}</p>
          )}
        </div>
      );
    }
    case 'project': {
      const p = item as ProjectItem;
      return (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{p.name}</span>
            {p.role && <span className="text-xs text-muted-foreground">{p.role}</span>}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {p.techStack.slice(0, 5).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs px-1.5 py-0">{t}</Badge>
            ))}
            {p.techStack.length > 5 && (
              <span className="text-xs text-muted-foreground">+{p.techStack.length - 5}</span>
            )}
          </div>
        </div>
      );
    }
    case 'education': {
      const e = item as EducationItem;
      return (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{e.school}</span>
            {e.degree && <span className="text-xs text-muted-foreground">{e.degree} · {e.major}</span>}
          </div>
          <div className="text-xs text-muted-foreground">
            {e.startDate} — {e.endDate ?? ''}
            {e.gpa && ` · GPA ${e.gpa}`}
          </div>
        </div>
      );
    }
    case 'certification': {
      const c = item as CertificationItem;
      return (
        <div className="space-y-0.5">
          <span className="font-medium text-sm">{c.name}</span>
          <div className="text-xs text-muted-foreground">
            {c.issuer} · {c.issueDate}
            {c.expiryDate && ` — ${c.expiryDate}`}
          </div>
        </div>
      );
    }
  }
}

export function ItemCard({ item }: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const toggleVisibility = useToggleVisibility();
  const deleteItem = useDeleteItem();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function handleToggleVisibility() {
    try {
      await toggleVisibility.mutateAsync(item.id);
    } catch {
      toast.error('操作失败');
    }
  }

  async function handleDelete() {
    try {
      await deleteItem.mutateAsync(item.id);
      toast.success('已删除');
    } catch {
      toast.error('删除失败');
    }
  }

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <ItemForm
          type={item.type}
          item={item}
          onClose={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-start gap-2 p-3 border rounded-lg bg-card transition-all',
        item.visible ? '' : 'opacity-60 bg-muted/30',
        isDragging && 'opacity-50 shadow-lg z-50'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-1 p-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground flex-shrink-0"
        tabIndex={-1}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <SourceBadge source={item.source} />
          {!item.visible && (
            <Badge variant="outline" className="text-xs border-zinc-300 text-zinc-400">
              已隐藏
            </Badge>
          )}
        </div>
        <div className={cn('mt-1', !item.visible && 'line-through decoration-zinc-400')}>
          <ItemSummary item={item} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleToggleVisibility}
          disabled={toggleVisibility.isPending}
          title={item.visible ? '隐藏' : '显示'}
        >
          {item.visible ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsEditing(true)}
          title="编辑"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:text-destructive"
              title="删除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                此操作不可撤销，确定要删除这条记录吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
