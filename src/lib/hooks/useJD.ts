'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAgentTasks } from '@/components/agent/AgentTaskProvider';
import { fetchJson } from '@/lib/client/fetch-json';
import {
  createJD as createStoredJD,
  deleteJD as deleteStoredJD,
  getJD as getStoredJD,
  listJDs as listStoredJDs,
} from '@/lib/client/workspace-storage';
import type { ParsedJD } from '@/lib/types/jd';

export const jdKeys = {
  all: ['jd'] as const,
  lists: () => [...jdKeys.all, 'list'] as const,
  detail: (id: string) => [...jdKeys.all, 'detail', id] as const,
};

export function useJDs() {
  return useQuery({
    queryKey: jdKeys.lists(),
    queryFn: async () => listStoredJDs(),
  });
}

export function useJD(id: string) {
  return useQuery({
    queryKey: jdKeys.detail(id),
    queryFn: async () => getStoredJD(id),
    enabled: Boolean(id),
  });
}

export function useParseJD() {
  const queryClient = useQueryClient();
  const { runTask } = useAgentTasks();

  return useMutation({
    mutationFn: async (text: string) =>
      runTask(
        {
          kind: 'jd_parse',
          title: 'JD 解析',
          description: text.slice(0, 80),
          successMessage: '职位描述已解析并保存到当前浏览器工作区',
        },
        async (signal) => {
          const { rawText, parsed } = await fetchJson<{ rawText: string; parsed: ParsedJD | null }>(
            '/api/jd',
            {
              method: 'POST',
              body: JSON.stringify({ text }),
              signal,
            }
          );

          return createStoredJD(rawText, parsed);
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jdKeys.all });
    },
  });
}

export function useDeleteJD() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteStoredJD(id),
    onError: () => {
      toast.error('删除失败，请重试');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jdKeys.all });
      queryClient.invalidateQueries({ queryKey: ['match'] });
      queryClient.invalidateQueries({ queryKey: ['generate'] });
    },
  });
}
