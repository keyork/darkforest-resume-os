'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { JobDescription } from '@/lib/types/jd';

export const jdKeys = {
  all: ['jd'] as const,
  lists: () => [...jdKeys.all, 'list'] as const,
  detail: (id: string) => [...jdKeys.all, 'detail', id] as const,
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

export function useJDs() {
  return useQuery({
    queryKey: jdKeys.lists(),
    queryFn: async () => {
      const { jds } = await fetchJson<{ jds: JobDescription[] }>('/api/jd');
      return jds;
    },
  });
}

export function useJD(id: string) {
  return useQuery({
    queryKey: jdKeys.detail(id),
    queryFn: async () => {
      const { jd } = await fetchJson<{ jd: JobDescription }>(`/api/jd/${id}`);
      return jd;
    },
    enabled: Boolean(id),
  });
}

export function useParseJD() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const { jd } = await fetchJson<{ jd: JobDescription }>('/api/jd', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      return jd;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jdKeys.lists() });
    },
  });
}

export function useDeleteJD() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchJson(`/api/jd/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jdKeys.lists() });
    },
  });
}
