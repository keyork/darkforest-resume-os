'use client';

import { useState } from 'react';
import { useQueryState } from 'nuqs';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ItemCard } from './ItemCard';
import { ItemForm } from './ItemForm';
import { SkillTagView } from './SkillTagView';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, LayoutGrid, List } from 'lucide-react';
import type { ItemType, SkillItem } from '@/lib/types/item';
import { ITEM_TYPE_LABELS } from '@/lib/types/item';
import { useItems, useReorderItems } from '@/lib/hooks/useItems';
import { cn } from '@/lib/utils';

const ALL_TYPES: ItemType[] = ['skill', 'experience', 'project', 'education', 'certification'];

type VisibilityFilter = 'all' | 'visible' | 'hidden';

export function ItemTabs() {
  const [activeTab, setActiveTab] = useQueryState('tab', { defaultValue: 'skill' });
  const [visibilityFilter, setVisibilityFilter] = useQueryState('filter', {
    defaultValue: 'all',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [skillView, setSkillView] = useState<'tag' | 'list'>('tag');
  const reorderItems = useReorderItems();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
        setActiveTab(v);
        setIsAdding(false);
      }}
    >
      <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[24px] border-none bg-transparent p-0 shadow-none">
        {ALL_TYPES.map((type) => (
          <TabItem key={type} type={type} />
        ))}
      </TabsList>

      {ALL_TYPES.map((type) => (
        <TabsContent key={type} value={type} className="mt-0 pt-4">
          <TabContent
            type={type as ItemType}
            visibilityFilter={visibilityFilter as VisibilityFilter}
            setVisibilityFilter={setVisibilityFilter}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            skillView={skillView}
            setSkillView={setSkillView}
            sensors={sensors}
            reorderItems={reorderItems}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function TabItem({ type }: { type: ItemType }) {
  const { data: items } = useItems(type);
  const count = items?.length ?? 0;

  return (
    <TabsTrigger
      value={type}
      className={cn(
        'relative rounded-full border border-border/70 bg-background/35 px-4 py-2.5 text-sm data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:shadow-[0_10px_22px_hsl(var(--primary)/0.12)]',
      )}
    >
      {ITEM_TYPE_LABELS[type]}
      {count > 0 && (
        <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 text-xs px-1">
          {count}
        </Badge>
      )}
    </TabsTrigger>
  );
}

interface TabContentProps {
  type: ItemType;
  visibilityFilter: VisibilityFilter;
  setVisibilityFilter: (v: string) => void;
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  skillView: 'tag' | 'list';
  setSkillView: (v: 'tag' | 'list') => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reorderItems: any;
}

function TabContent({
  type,
  visibilityFilter,
  setVisibilityFilter,
  isAdding,
  setIsAdding,
  skillView,
  setSkillView,
  sensors,
  reorderItems,
}: TabContentProps) {
  const visible = visibilityFilter === 'visible' ? true : visibilityFilter === 'hidden' ? false : undefined;
  const { data: items, isLoading } = useItems(type, visible);

  const filteredItems = items ?? [];

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredItems.findIndex((i) => i.id === active.id);
    const newIndex = filteredItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Recompute sort orders
    const reordered = [...filteredItems];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    const updates = reordered.map((item, idx) => ({ id: item.id, sortOrder: idx }));
    await reorderItems.mutateAsync({ items: updates });
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-[24px] border border-border/70 bg-background/35 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'visible', 'hidden'] as VisibilityFilter[]).map((f) => (
            <Button
              key={f}
              variant={visibilityFilter === f ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setVisibilityFilter(f)}
            >
              {f === 'all' ? '全部' : f === 'visible' ? '可见' : '已隐藏'}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {type === 'skill' && (
            <div className="flex gap-1 rounded-full border border-border/70 bg-background/40 p-1">
              <Button
                variant={skillView === 'tag' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => setSkillView('tag')}
                title="标签视图"
              >
                <LayoutGrid className="h-3 w-3" />
              </Button>
              <Button
                variant={skillView === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => setSkillView('list')}
                title="列表视图"
              >
                <List className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            添加
          </Button>
        </div>
      </div>

      {/* Add form */}
      {isAdding && (
        <ItemForm
          type={type}
          onClose={() => setIsAdding(false)}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredItems.length === 0 && !isAdding && (
        <EmptyState
          title={`还没有${ITEM_TYPE_LABELS[type]}`}
          description={`点击「添加」手动创建，或上传简历让 AI 自动解析`}
          action={
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              添加{ITEM_TYPE_LABELS[type]}
            </Button>
          }
        />
      )}

      {/* Items */}
      {!isLoading && filteredItems.length > 0 && (
        <>
          {type === 'skill' && skillView === 'tag' ? (
            <SkillTagView skills={filteredItems as SkillItem[]} />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}
    </div>
  );
}
