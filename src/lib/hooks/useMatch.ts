'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { runMatchAnalysis } from '@/lib/ai/agents/match-agent';
import { useAgentTasks } from '@/components/agent/AgentTaskProvider';
import { getStoredAIClientConfig } from '@/lib/client/ai-settings';
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
import type { Item } from '@/lib/types/item';

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
    queryFn: async () => getStoredMatchResult(id) ?? null,
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

          const analysis = await runMatchAnalysis(
            {
              name: profile.name,
              title: profile.title,
              summary: profile.summary,
              contact: profile.contact,
              items: visibleItems.map(toSemanticItem),
            },
            jd.parsed,
            getStoredAIClientConfig(),
            signal,
          );

          return createStoredMatchResult(analysis, jdId);
        }
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(result.id) });
    },
  });
}

function toSemanticItem(item: Item) {
  const {
    id,
    profileId,
    visible,
    sortOrder,
    source,
    createdAt,
    updatedAt,
    ...semanticItem
  } = item;

  void id;
  void profileId;
  void visible;
  void sortOrder;
  void source;
  void createdAt;
  void updatedAt;

  return semanticItem;
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
