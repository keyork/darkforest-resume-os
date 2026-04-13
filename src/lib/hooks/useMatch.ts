'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAgentTasks } from '@/components/agent/AgentTaskProvider';
import { fetchJson } from '@/lib/client/fetch-json';
import {
  createMatchResult as createStoredMatchResult,
  deleteMatchResult as deleteStoredMatchResult,
  getJD,
  getMatchResult as getStoredMatchResult,
  getProfile,
  listJDs,
  listItems,
  listMatchResults,
} from '@/lib/client/workspace-storage';
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
      const jds = new Map(listJDs().map((jd) => [jd.id, jd] as const));

      return listMatchResults().map((result) => {
        const jd = jds.get(result.jdId);
        return {
          id: result.id,
          profileId: result.profileId,
          jdId: result.jdId,
          overallScore: result.scores.overall,
          summary: result.summary,
          company: jd?.parsed?.company ?? undefined,
          position: jd?.parsed?.position ?? undefined,
          createdAt: result.createdAt,
        } satisfies MatchSummary;
      });
    },
  });
}

export function useMatchResult(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: async () => getStoredMatchResult(id),
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
          successMessage: '匹配分析已完成并保存到当前浏览器工作区',
        },
        async (signal) => {
          const jd = getJD(jdId);
          const profile = getProfile();
          const visibleItems = listItems({ visible: true });

          if (!jd?.parsed) {
            throw new Error('请先选择一份已解析的 JD');
          }

          const { analysis } = await fetchJson<{
            analysis: Omit<MatchResult, 'id' | 'profileId' | 'jdId' | 'createdAt'>;
          }>('/api/match', {
            method: 'POST',
            body: JSON.stringify({
              jd,
              profile,
              items: visibleItems,
            }),
            signal,
          });

          return createStoredMatchResult(analysis, jdId);
        }
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(result.id) });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteStoredMatchResult(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: ['generate'] });
    },
  });
}
