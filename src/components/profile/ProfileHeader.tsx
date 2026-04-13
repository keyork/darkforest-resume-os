'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile, useUpdateProfile, useResetProfile } from '@/lib/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Pencil, Check, X, Mail, Phone, MapPin, Globe, Linkedin, Github, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Contact } from '@/lib/types/profile';

const profileSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  title: z.string(),
  summary: z.string(),
  email: z.string().email('邮箱格式不正确').or(z.literal('')),
  phone: z.string(),
  location: z.string(),
  website: z.string(),
  linkedin: z.string(),
  github: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileHeader() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const resetProfile = useResetProfile();
  const [isEditing, setIsEditing] = useState(false);

  async function handleReset() {
    await resetProfile.mutateAsync();
    toast.success('简历数据已清空');
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      title: '',
      summary: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
    },
  });

  function startEdit() {
    if (!profile) return;
    form.reset({
      name: profile.name,
      title: profile.title,
      summary: profile.summary,
      email: profile.contact.email ?? '',
      phone: profile.contact.phone ?? '',
      location: profile.contact.location ?? '',
      website: profile.contact.website ?? '',
      linkedin: profile.contact.linkedin ?? '',
      github: profile.contact.github ?? '',
    });
    setIsEditing(true);
  }

  async function onSubmit(values: ProfileFormValues) {
    const contact: Contact = {
      email: values.email || undefined,
      phone: values.phone || undefined,
      location: values.location || undefined,
      website: values.website || undefined,
      linkedin: values.linkedin || undefined,
      github: values.github || undefined,
    };
    await updateProfile.mutateAsync({
      name: values.name,
      title: values.title,
      summary: values.summary,
      contact,
    });
    setIsEditing(false);
  }

  if (isLoading) {
    return (
      <div className="surface-panel space-y-3 rounded-[30px] p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  if (isEditing) {
    return (
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="surface-panel panel-tint-jade space-y-4 rounded-[30px] p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground">编辑基本信息</h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button type="submit" size="sm" className="gap-1.5" disabled={updateProfile.isPending}>
              <Check className="h-4 w-4" />
              保存
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="name">姓名 *</Label>
            <Input id="name" {...form.register('name')} placeholder="你的姓名" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="title">职位头衔</Label>
            <Input id="title" {...form.register('title')} placeholder="如：Senior Frontend Engineer" />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="summary">职业摘要</Label>
          <Textarea
            id="summary"
            {...form.register('summary')}
            placeholder="简短描述你的职业背景和核心优势..."
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" {...form.register('email')} placeholder="email@example.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">电话</Label>
            <Input id="phone" {...form.register('phone')} placeholder="138xxxx8888" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="location">城市</Label>
            <Input id="location" {...form.register('location')} placeholder="北京" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="website">个人网站</Label>
            <Input id="website" {...form.register('website')} placeholder="https://..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" {...form.register('linkedin')} placeholder="linkedin.com/in/..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="github">GitHub</Label>
            <Input id="github" {...form.register('github')} placeholder="github.com/..." />
          </div>
        </div>
      </form>
    );
  }

  const contactItems: Array<{ icon: typeof Mail; value?: string; label: string }> = [
    { icon: Mail, value: profile.contact.email, label: '邮箱' },
    { icon: Phone, value: profile.contact.phone, label: '电话' },
    { icon: MapPin, value: profile.contact.location, label: '城市' },
    { icon: Globe, value: profile.contact.website, label: '网站' },
    { icon: Linkedin, value: profile.contact.linkedin, label: 'LinkedIn' },
    { icon: Github, value: profile.contact.github, label: 'GitHub' },
  ].filter((c) => c.value);

  const isEmpty = !profile.name && !profile.title && !profile.summary;

  return (
    <div
      className={cn(
        'surface-panel panel-tint-jade group cursor-pointer rounded-[30px] p-6 transition-colors hover:border-transparent',
        isEmpty && 'border-dashed'
      )}
      onClick={startEdit}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          {isEmpty ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">点击填写个人基本信息</p>
              <p className="text-xs text-muted-foreground/60 mt-1">姓名、职位、联系方式...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                <h1 className="text-xl font-semibold">{profile.name || '未填写姓名'}</h1>
                {profile.title && (
                  <span className="text-sm text-muted-foreground">{profile.title}</span>
                )}
              </div>
              {profile.summary && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {profile.summary}
                </p>
              )}
              {contactItems.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {contactItems.map(({ icon: Icon, value, label }) => (
                    <span
                      key={label}
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                    >
                      <Icon className="h-3 w-3" />
                      {value}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="ml-auto flex flex-shrink-0 gap-1 self-end opacity-100 transition-opacity sm:ml-2 sm:self-start sm:opacity-0 sm:group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); startEdit(); }}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>清空所有简历数据？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将删除所有技能、工作经历、项目、教育背景和证书，并清空个人信息。
                  不可撤销，建议先导出后再操作。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleReset}
                >
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
