'use client';

import { useFieldArray, Control, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AchievementListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  fieldName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>;
}

export function AchievementList({ control, fieldName }: AchievementListProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });
  const [expandedMetrics, setExpandedMetrics] = useState<Set<number>>(new Set());

  function toggleMetrics(index: number) {
    setExpandedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <Label>核心成果</Label>
      {fields.map((field, index) => (
        <div key={field.id} className="border rounded-md p-3 space-y-2 bg-muted/30">
          <div className="flex gap-2">
            <Textarea
              {...(control.register ? control.register(`${fieldName}.${index}.description`) : {})}
              placeholder="描述成果，建议量化（如：优化性能 40%，团队规模从 5 人扩展到 15 人）"
              rows={2}
              className="flex-1 text-sm"
            />
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7 shrink-0', expandedMetrics.has(index) && 'text-primary')}
                onClick={() => toggleMetrics(index)}
                title="量化指标"
              >
                {expandedMetrics.has(index) ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {expandedMetrics.has(index) && (
            <div className="grid grid-cols-4 gap-2 pt-1 border-t">
              <div className="space-y-1">
                <Label className="text-xs">指标类型</Label>
                <Input
                  {...(control.register ? control.register(`${fieldName}.${index}.metrics.type`) : {})}
                  placeholder="如：提升率"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">数值</Label>
                <Input
                  type="number"
                  {...(control.register ? control.register(`${fieldName}.${index}.metrics.value`, { valueAsNumber: true }) : {})}
                  placeholder="40"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">单位</Label>
                <Input
                  {...(control.register ? control.register(`${fieldName}.${index}.metrics.unit`) : {})}
                  placeholder="%"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">背景说明</Label>
                <Input
                  {...(control.register ? control.register(`${fieldName}.${index}.metrics.context`) : {})}
                  placeholder="对比基准"
                  className="h-7 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-dashed"
        onClick={() => append({ id: `ach_${Date.now()}`, description: '', metrics: undefined })}
      >
        <Plus className="h-3 w-3 mr-1" />
        添加成果
      </Button>
    </div>
  );
}
