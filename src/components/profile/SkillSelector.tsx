'use client';

import { useState } from 'react';
import { useItems } from '@/lib/hooks/useItems';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SkillItem } from '@/lib/types/item';

interface SkillSelectorProps {
  value: string[]; // selected skill item ids
  onChange: (ids: string[]) => void;
  label?: string;
}

export function SkillSelector({ value, onChange, label = '关联技能' }: SkillSelectorProps) {
  const { data: skills } = useItems('skill');
  const [open, setOpen] = useState(false);

  const skillItems = (skills ?? []) as SkillItem[];

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  const selectedSkills = skillItems.filter((s) => value.includes(s.id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm font-normal"
          >
            <span className="text-muted-foreground">{label}</span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="搜索技能..." />
            <CommandList>
              <CommandEmpty>没有找到匹配的技能</CommandEmpty>
              <CommandGroup>
                {skillItems.map((skill) => (
                  <CommandItem
                    key={skill.id}
                    value={skill.name}
                    onSelect={() => toggle(skill.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value.includes(skill.id) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {skill.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedSkills.map((skill) => (
            <Badge key={skill.id} variant="secondary" className="gap-1 pr-1">
              {skill.name}
              <button
                type="button"
                onClick={() => remove(skill.id)}
                className="ml-1 rounded-full hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
