'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ItemForm } from './ItemForm';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SkillItem } from '@/lib/types/item';
import { SKILL_CATEGORY_LABELS } from '@/lib/types/item';
import { useToggleVisibility, useDeleteItem } from '@/lib/hooks/useItems';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SkillTagViewProps {
  skills: SkillItem[];
}

export function SkillTagView({ skills }: SkillTagViewProps) {
  // Group by category
  const grouped = skills.reduce<Record<string, SkillItem[]>>((acc, skill) => {
    const cat = skill.category ?? 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const order = ['programming_language', 'framework', 'tool', 'devops', 'data', 'methodology', 'design', 'management', 'soft_skill', 'domain_knowledge', 'other'];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <div className="space-y-3">
      {sortedCategories.map((cat) => (
        <SkillCategoryGroup
          key={cat}
          category={cat}
          skills={grouped[cat]}
        />
      ))}
    </div>
  );
}

function SkillCategoryGroup({
  category,
  skills,
}: {
  category: string;
  skills: SkillItem[];
}) {
  const [open, setOpen] = useState(true);
  const label = SKILL_CATEGORY_LABELS[category as keyof typeof SKILL_CATEGORY_LABELS] ?? category;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="text-xs text-muted-foreground/60">({skills.length})</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-wrap gap-2 pt-2 pl-5">
          {skills.map((skill) => (
            <SkillTag key={skill.id} skill={skill} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SkillTag({ skill }: { skill: SkillItem }) {
  const [open, setOpen] = useState(false);
  const toggleVisibility = useToggleVisibility();
  const deleteItem = useDeleteItem();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-colors hover:border-primary/50',
            skill.visible
              ? 'bg-secondary text-secondary-foreground border-border'
              : 'bg-muted/30 text-muted-foreground border-dashed opacity-60'
          )}
        >
          <span>{skill.name}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: skill.level }).map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary/70" />
            ))}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b flex items-center justify-between">
          <span className="text-sm font-medium">{skill.name}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={async () => {
                try {
                  await toggleVisibility.mutateAsync(skill.id);
                } catch {
                  toast.error('操作失败');
                }
              }}
            >
              {skill.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:text-destructive"
              onClick={async () => {
                try {
                  await deleteItem.mutateAsync(skill.id);
                  toast.success('已删除');
                  setOpen(false);
                } catch {
                  toast.error('删除失败');
                }
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="p-2">
          <ItemForm
            type="skill"
            item={skill}
            onClose={() => setOpen(false)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
