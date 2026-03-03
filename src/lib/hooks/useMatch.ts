'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MatchResult } from '@/lib/types/match';

export const matchKeys = {
  all: ['match'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
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

export interface MatchSummary {
  id: string;
  profileId: string;
  jdId: string;
  overallScore: number;
  summary: string;
  createdAt: string;
}

export function useMatchResults() {
  return useQuery({
    queryKey: matchKeys.lists(),
    queryFn: async () => {
      const { results } = await fetchJson<{ results: MatchSummary[] }>('/api/match');
      return results;
    },
  });
}

export function useMatchResult(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: async () => {
      const { result } = await fetchJson<{ result: MatchResult }>(`/api/match/${id}`);
      return result;
    },
    enabled: Boolean(id),
  });
}

export function useRunMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jdId: string) => {
      const { result } = await fetchJson<{ result: MatchResult }>('/api/match', {
        method: 'POST',
        body: JSON.stringify({ jdId }),
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchJson(`/api/match/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
}
