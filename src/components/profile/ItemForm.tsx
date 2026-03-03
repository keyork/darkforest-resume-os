'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AchievementList } from './AchievementList';
import { SkillSelector } from './SkillSelector';
import { Check, X } from 'lucide-react';
import type {
  Item,
  ItemType,
  ItemData,
  SkillData,
  ExperienceData,
  ProjectData,
  EducationData,
  CertificationData,
  SkillCategory,
  SkillLevel,
} from '@/lib/types/item';
import { SKILL_CATEGORY_LABELS as SCL, SKILL_LEVEL_LABELS } from '@/lib/types/item';
import { useCreateItem, useUpdateItem } from '@/lib/hooks/useItems';
import { toast } from 'sonner';

// --- Zod schemas per type ---

const achievementSchema = z.object({
  id: z.string(),
  description: z.string(),
  metrics: z.object({
    type: z.string(),
    value: z.number().or(z.nan()),
    unit: z.string(),
    context: z.string().optional(),
  }).optional(),
});

const skillSchema = z.object({
  name: z.string().min(1, '技能名称不能为空'),
  category: z.string() as z.ZodType<SkillCategory>,
  level: z.number().min(1).max(5) as z.ZodType<SkillLevel>,
  yearsOfExperience: z.number().optional().or(z.nan()),
  lastUsed: z.string().optional(),
  keywords: z.array(z.string()),
  notes: z.string().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1, '公司名称不能为空'),
  title: z.string().min(1, '职位不能为空'),
  startDate: z.string().min(1, '开始时间不能为空'),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  location: z.string().optional(),
  description: z.string(),
  achievements: z.array(achievementSchema),
  relatedSkills: z.array(z.string()),
  industryTags: z.array(z.string()),
});

const projectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空'),
  role: z.string(),
  description: z.string(),
  techStack: z.array(z.string()),
  achievements: z.array(achievementSchema),
  relatedSkills: z.array(z.string()),
  url: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const educationSchema = z.object({
  school: z.string().min(1, '学校不能为空'),
  degree: z.string(),
  major: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  highlights: z.array(z.string()),
});

const certificationSchema = z.object({
  name: z.string().min(1, '证书名称不能为空'),
  issuer: z.string(),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  relatedSkills: z.array(z.string()),
});

type SkillFormValues = z.infer<typeof skillSchema>;
type ExperienceFormValues = z.infer<typeof experienceSchema>;
type ProjectFormValues = z.infer<typeof projectSchema>;
type EducationFormValues = z.infer<typeof educationSchema>;
type CertificationFormValues = z.infer<typeof certificationSchema>;

type FormValues =
  | SkillFormValues
  | ExperienceFormValues
  | ProjectFormValues
  | EducationFormValues
  | CertificationFormValues;

interface ItemFormProps {
  type: ItemType;
  item?: Item;
  onClose: () => void;
}

function getDefaultValues(type: ItemType, item?: Item): FormValues {
  const data = item as (Item & { type: ItemType }) | undefined;
  switch (type) {
    case 'skill': {
      const d = data as (typeof data & SkillData) | undefined;
      return {
        name: d?.name ?? '',
        category: d?.category ?? 'other',
        level: d?.level ?? 3,
        yearsOfExperience: d?.yearsOfExperience,
        lastUsed: d?.lastUsed ?? '',
        keywords: d?.keywords ?? [],
        notes: d?.notes ?? '',
      } satisfies SkillFormValues;
    }
    case 'experience': {
      const d = data as (typeof data & ExperienceData) | undefined;
      return {
        company: d?.company ?? '',
        title: d?.title ?? '',
        startDate: d?.startDate ?? '',
        endDate: d?.endDate ?? '',
        isCurrent: d?.isCurrent ?? false,
        location: d?.location ?? '',
        description: d?.description ?? '',
        achievements: d?.achievements ?? [],
        relatedSkills: d?.relatedSkills ?? [],
        industryTags: d?.industryTags ?? [],
      } satisfies ExperienceFormValues;
    }
    case 'project': {
      const d = data as (typeof data & ProjectData) | undefined;
      return {
        name: d?.name ?? '',
        role: d?.role ?? '',
        description: d?.description ?? '',
        techStack: d?.techStack ?? [],
        achievements: d?.achievements ?? [],
        relatedSkills: d?.relatedSkills ?? [],
        url: d?.url ?? '',
        startDate: d?.startDate ?? '',
        endDate: d?.endDate ?? '',
      } satisfies ProjectFormValues;
    }
    case 'education': {
      const d = data as (typeof data & EducationData) | undefined;
      return {
        school: d?.school ?? '',
        degree: d?.degree ?? '',
        major: d?.major ?? '',
        startDate: d?.startDate ?? '',
        endDate: d?.endDate ?? '',
        gpa: d?.gpa ?? '',
        highlights: d?.highlights ?? [],
      } satisfies EducationFormValues;
    }
    case 'certification': {
      const d = data as (typeof data & CertificationData) | undefined;
      return {
        name: d?.name ?? '',
        issuer: d?.issuer ?? '',
        issueDate: d?.issueDate ?? '',
        expiryDate: d?.expiryDate ?? '',
        credentialId: d?.credentialId ?? '',
        relatedSkills: d?.relatedSkills ?? [],
      } satisfies CertificationFormValues;
    }
  }
}

function getSchema(type: ItemType) {
  switch (type) {
    case 'skill': return skillSchema;
    case 'experience': return experienceSchema;
    case 'project': return projectSchema;
    case 'education': return educationSchema;
    case 'certification': return certificationSchema;
  }
}

// Helper to parse comma-separated tags
function parseTagsInput(value: string): string[] {
  return value.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean);
}

export function ItemForm({ type, item, onClose }: ItemFormProps) {
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const isEdit = Boolean(item);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(getSchema(type)),
    defaultValues: getDefaultValues(type, item),
  });

  useEffect(() => {
    form.reset(getDefaultValues(type, item));
  }, [item?.id, type]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: FormValues) {
    try {
      const data = { type, ...values } as ItemData;
      if (isEdit && item) {
        await updateItem.mutateAsync({ id: item.id, data });
        toast.success('已更新');
      } else {
        await createItem.mutateAsync({ type, data });
        toast.success('已添加');
      }
      onClose();
    } catch {
      toast.error('操作失败，请重试');
    }
  }

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-card">
      {/* Form fields per type */}
      {type === 'skill' && <SkillFields form={form} />}
      {type === 'experience' && <ExperienceFields form={form} />}
      {type === 'project' && <ProjectFields form={form} />}
      {type === 'education' && <EducationFields form={form} />}
      {type === 'certification' && <CertificationFields form={form} />}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4 mr-1" /> 取消
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          <Check className="h-4 w-4 mr-1" />
          {isEdit ? '保存修改' : '添加'}
        </Button>
      </div>
    </form>
  );
}

// --- Sub-forms ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SkillFields({ form }: { form: any }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">技能名称 *</Label>
          <Input id="name" {...form.register('name')} placeholder="如：React, TypeScript" />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>分类 *</Label>
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SCL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1">
          <Label>熟练度 *</Label>
          <Controller
            control={form.control}
            name="level"
            render={({ field }) => (
              <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择熟练度" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SKILL_LEVEL_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{k}星 — {v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="yearsOfExperience">使用年限</Label>
          <Input
            id="yearsOfExperience"
            type="number"
            step="0.5"
            {...form.register('yearsOfExperience', { valueAsNumber: true })}
            placeholder="3"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastUsed">最近使用 (YYYY-MM)</Label>
          <Input id="lastUsed" {...form.register('lastUsed')} placeholder="2024-01" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="keywords">关联关键词（逗号分隔）</Label>
        <Input
          id="keywords"
          placeholder="JS, JavaScript, ECMAScript"
          defaultValue={form.getValues('keywords')?.join(', ') ?? ''}
          onBlur={(e) => form.setValue('keywords', parseTagsInput(e.target.value))}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">备注</Label>
        <Textarea id="notes" {...form.register('notes')} rows={2} placeholder="可选备注..." />
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ExperienceFields({ form }: { form: any }) {
  const isCurrent = form.watch('isCurrent');
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="company">公司名称 *</Label>
          <Input id="company" {...form.register('company')} placeholder="字节跳动" />
          {form.formState.errors.company && (
            <p className="text-xs text-destructive">{form.formState.errors.company.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="title">职位头衔 *</Label>
          <Input id="title" {...form.register('title')} placeholder="Senior Frontend Engineer" />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="startDate">开始时间 *</Label>
          <Input id="startDate" {...form.register('startDate')} placeholder="2022-01" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="endDate">结束时间</Label>
            <div className="flex items-center gap-1.5">
              <Controller
                control={form.control}
                name="isCurrent"
                render={({ field }) => (
                  <Checkbox
                    id="isCurrent"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label htmlFor="isCurrent" className="text-xs text-muted-foreground cursor-pointer">至今</label>
            </div>
          </div>
          <Input
            id="endDate"
            {...form.register('endDate')}
            placeholder="2024-01"
            disabled={isCurrent}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="location">工作地点</Label>
          <Input id="location" {...form.register('location')} placeholder="北京" />
        </div>
        <div className="space-y-1 col-span-2">
          <Label htmlFor="description">职责描述</Label>
          <Textarea id="description" {...form.register('description')} rows={3} placeholder="简要描述主要职责..." />
        </div>
      </div>
      <AchievementList control={form.control} fieldName="achievements" />
      <SkillSelector
        value={form.watch('relatedSkills') ?? []}
        onChange={(ids) => form.setValue('relatedSkills', ids)}
      />
      <div className="space-y-1">
        <Label htmlFor="industryTags">行业标签（逗号分隔）</Label>
        <Input
          id="industryTags"
          placeholder="互联网, 电商, SaaS"
          defaultValue={form.getValues('industryTags')?.join(', ') ?? ''}
          onBlur={(e) => form.setValue('industryTags', parseTagsInput(e.target.value))}
        />
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectFields({ form }: { form: any }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">项目名称 *</Label>
          <Input id="name" {...form.register('name')} placeholder="darkforest-resume-os" />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="role">担任角色</Label>
          <Input id="role" {...form.register('role')} placeholder="Tech Lead / 独立开发" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="startDate">开始时间</Label>
          <Input id="startDate" {...form.register('startDate')} placeholder="2024-01" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endDate">结束时间</Label>
          <Input id="endDate" {...form.register('endDate')} placeholder="2024-06" />
        </div>
        <div className="space-y-1 col-span-2">
          <Label htmlFor="description">项目描述</Label>
          <Textarea id="description" {...form.register('description')} rows={3} placeholder="项目背景、目标、技术方案..." />
        </div>
        <div className="space-y-1 col-span-2">
          <Label htmlFor="techStack">技术栈（逗号分隔）</Label>
          <Input
            id="techStack"
            placeholder="Next.js, TypeScript, SQLite"
            defaultValue={form.getValues('techStack')?.join(', ') ?? ''}
            onBlur={(e) => form.setValue('techStack', parseTagsInput(e.target.value))}
          />
        </div>
        <div className="space-y-1 col-span-2">
          <Label htmlFor="url">项目链接</Label>
          <Input id="url" {...form.register('url')} placeholder="https://github.com/..." />
        </div>
      </div>
      <AchievementList control={form.control} fieldName="achievements" />
      <SkillSelector
        value={form.watch('relatedSkills') ?? []}
        onChange={(ids) => form.setValue('relatedSkills', ids)}
      />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EducationFields({ form }: { form: any }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="school">学校名称 *</Label>
          <Input id="school" {...form.register('school')} placeholder="北京大学" />
          {form.formState.errors.school && (
            <p className="text-xs text-destructive">{form.formState.errors.school.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="degree">学位</Label>
          <Input id="degree" {...form.register('degree')} placeholder="本科 / 硕士 / 博士" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="major">专业</Label>
          <Input id="major" {...form.register('major')} placeholder="计算机科学与技术" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="gpa">GPA</Label>
          <Input id="gpa" {...form.register('gpa')} placeholder="3.8/4.0" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="startDate">开始时间</Label>
          <Input id="startDate" {...form.register('startDate')} placeholder="2018-09" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endDate">结束时间</Label>
          <Input id="endDate" {...form.register('endDate')} placeholder="2022-06" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="highlights">亮点（每行一条）</Label>
        <Textarea
          id="highlights"
          rows={3}
          placeholder="国家奖学金&#10;ACM 算法竞赛银牌&#10;毕业设计优秀"
          defaultValue={form.getValues('highlights')?.join('\n') ?? ''}
          onBlur={(e) => form.setValue('highlights', e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean))}
        />
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CertificationFields({ form }: { form: any }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">证书名称 *</Label>
          <Input id="name" {...form.register('name')} placeholder="AWS Solutions Architect" />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="issuer">颁发机构</Label>
          <Input id="issuer" {...form.register('issuer')} placeholder="Amazon Web Services" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="issueDate">获得日期</Label>
          <Input id="issueDate" {...form.register('issueDate')} placeholder="2023-06" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="expiryDate">过期日期</Label>
          <Input id="expiryDate" {...form.register('expiryDate')} placeholder="2026-06（可选）" />
        </div>
        <div className="space-y-1 col-span-2">
          <Label htmlFor="credentialId">证书编号</Label>
          <Input id="credentialId" {...form.register('credentialId')} placeholder="可选" />
        </div>
      </div>
      <SkillSelector
        value={form.watch('relatedSkills') ?? []}
        onChange={(ids) => form.setValue('relatedSkills', ids)}
      />
    </>
  );
}
