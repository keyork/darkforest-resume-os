'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GeneratedResume, GenerationStrategy } from '@/lib/types/resume';

export const generateKeys = {
  all: ['generate'] as const,
  lists: () => [...generateKeys.all, 'list'] as const,
  detail: (id: string) => [...generateKeys.all, 'detail', id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`${init?.method ?? 'GET'} ${url} failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

export function useGeneratedResumes() {
  return useQuery({
    queryKey: generateKeys.lists(),
    queryFn: async () => {
      const { resumes } = await fetchJson<{ resumes: Omit<GeneratedResume, 'content'>[] }>(
        '/api/generate'
      );
      return resumes;
    },
  });
}

export function useGeneratedResume(id: string) {
  return useQuery({
    queryKey: generateKeys.detail(id),
    queryFn: async () => {
      const { resume } = await fetchJson<{ resume: GeneratedResume }>(`/api/generate/${id}`);
      return resume;
    },
    enabled: Boolean(id),
  });
}

export interface GenerateInput extends GenerationStrategy {
  jdId?: string;
  matchResultId?: string;
}

export function useGenerateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GenerateInput) => {
      const { resume } = await fetchJson<{ resume: GeneratedResume }>('/api/generate', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return resume;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generateKeys.lists() });
    },
  });
}

export function useDeleteGeneratedResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchJson(`/api/generate/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generateKeys.lists() });
    },
  });
}
