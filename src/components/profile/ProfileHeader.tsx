'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile, useUpdateProfile } from '@/lib/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Check, X, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);

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
      <div className="p-6 border rounded-lg space-y-3">
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
        className="p-6 border rounded-lg space-y-4 bg-card"
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
            <Button type="submit" size="sm" disabled={updateProfile.isPending}>
              <Check className="h-4 w-4 mr-1" />
              保存
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
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
        'group p-6 border rounded-lg bg-card transition-colors cursor-pointer hover:border-primary/50',
        isEmpty && 'border-dashed'
      )}
      onClick={startEdit}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isEmpty ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">点击填写个人基本信息</p>
              <p className="text-xs text-muted-foreground/60 mt-1">姓名、职位、联系方式...</p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-3">
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
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
          onClick={(e) => { e.stopPropagation(); startEdit(); }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
