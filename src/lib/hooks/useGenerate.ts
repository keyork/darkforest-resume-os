'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAgentTasks } from '@/components/agent/AgentTaskProvider';
import { fetchJson } from '@/lib/client/fetch-json';
import type { GeneratedResume, GenerationStrategy } from '@/lib/types/resume';

export const generateKeys = {
  all: ['generate'] as const,
  lists: () => [...generateKeys.all, 'list'] as const,
  detail: (id: string) => [...generateKeys.all, 'detail', id] as const,
};

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
  const { runTask } = useAgentTasks();

  return useMutation({
    mutationFn: async (input: GenerateInput) =>
      runTask(
        {
          kind: 'resume_generate',
          title: '简历生成',
          description: `策略 ${input.narrative} · ${input.language} · ${input.length}`,
          successMessage: '简历已生成并保存到历史记录',
        },
        async (signal) => {
          const { resume } = await fetchJson<{ resume: GeneratedResume }>('/api/generate', {
            method: 'POST',
            body: JSON.stringify(input),
            signal,
          });
          return resume;
        }
      ),
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
