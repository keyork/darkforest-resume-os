'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAgentTasks } from '@/components/agent/AgentTaskProvider';
import { fetchJson } from '@/lib/client/fetch-json';
import type { MatchResult } from '@/lib/types/match';

export const matchKeys = {
  all: ['match'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
};

export interface MatchSummary {
  id: string;
  profileId: string;
  jdId: string;
  overallScore: number;
  summary: string;
  company?: string;
  position?: string;
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
  const { runTask } = useAgentTasks();

  return useMutation({
    mutationFn: async (jdId: string) =>
      runTask(
        {
          kind: 'match_run',
          title: 'JD 匹配分析',
          description: `基于职位 ${jdId} 生成匹配分析`,
          successMessage: '匹配分析已完成',
        },
        async (signal) => {
          const { result } = await fetchJson<{ result: MatchResult }>('/api/match', {
            method: 'POST',
            body: JSON.stringify({ jdId }),
            signal,
          });
          return result;
        }
      ),
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
