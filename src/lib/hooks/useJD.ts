'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAgentTasks } from '@/components/agent/AgentTaskProvider';
import type { JobDescription } from '@/lib/types/jd';
import { fetchJson } from '@/lib/client/fetch-json';
import { toast } from 'sonner';

export const jdKeys = {
  all: ['jd'] as const,
  lists: () => [...jdKeys.all, 'list'] as const,
  detail: (id: string) => [...jdKeys.all, 'detail', id] as const,
};

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
  const { runTask } = useAgentTasks();

  return useMutation({
    mutationFn: async (text: string) =>
      runTask(
        {
          kind: 'jd_parse',
          title: 'JD 解析',
          description: text.slice(0, 80),
          successMessage: '职位描述已解析并加入历史列表',
        },
        async (signal) => {
          const { jd } = await fetchJson<{ jd: JobDescription }>('/api/jd', {
            method: 'POST',
            body: JSON.stringify({ text }),
            signal,
          });
          return jd;
        }
      ),
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
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: jdKeys.lists() });
      const prev = queryClient.getQueryData<JobDescription[]>(jdKeys.lists());
      queryClient.setQueryData<JobDescription[]>(jdKeys.lists(), (old) =>
        old ? old.filter((jd) => jd.id !== id) : []
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(jdKeys.lists(), ctx.prev);
      }
      toast.error('删除失败，请重试');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: jdKeys.lists() });
    },
  });
}
