'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateResumeMarkdown } from '@/lib/ai/agents/resume-gen-agent';
import { useAgentTasks } from '@/components/agent/AgentTaskProvider';
import { getStoredAIClientConfig } from '@/lib/client/ai-settings';
import {
  createGeneratedResume as createStoredGeneratedResume,
  deleteGeneratedResume as deleteStoredGeneratedResume,
  getGeneratedResume as getStoredGeneratedResume,
  getJD,
  getMatchResult,
  getProfile,
  listGeneratedResumes as listStoredGeneratedResumes,
  listItems,
} from '@/lib/client/workspace-storage';
import type { GenerationStrategy } from '@/lib/types/resume';

export const generateKeys = {
  all: ['generate'] as const,
  lists: () => [...generateKeys.all, 'list'] as const,
  detail: (id: string) => [...generateKeys.all, 'detail', id] as const,
};

export function useGeneratedResumes() {
  return useQuery({
    queryKey: generateKeys.lists(),
    queryFn: async () =>
      listStoredGeneratedResumes().map((resume) => ({
        id: resume.id,
        profileId: resume.profileId,
        jdId: resume.jdId,
        matchResultId: resume.matchResultId,
        strategy: resume.strategy,
        createdAt: resume.createdAt,
      })),
  });
}

export function useGeneratedResume(id: string) {
  return useQuery({
    queryKey: generateKeys.detail(id),
    queryFn: async () => getStoredGeneratedResume(id) ?? null,
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
          successMessage: '简历已生成并保存到当前浏览器工作区',
        },
        async (signal) => {
          const profile = getProfile();
          const visibleItems = listItems({ visible: true });
          const jd = input.jdId ? getJD(input.jdId) : undefined;
          const matchResult = input.matchResultId ? getMatchResult(input.matchResultId) : undefined;

          const content = await generateResumeMarkdown(
            {
              profileName: profile.name,
              profileTitle: profile.title,
              profileSummary: profile.summary,
              profileContact: {
                email: profile.contact?.email,
                phone: profile.contact?.phone,
                location: profile.contact?.location,
                website: profile.contact?.website,
                linkedin: profile.contact?.linkedin,
                github: profile.contact?.github,
              },
              visibleItems,
              strategy: input,
              parsedJD: jd?.parsed ?? null,
              matchResult: matchResult
                ? {
                    resumeStrategy: matchResult.resumeStrategy,
                  }
                : null,
            },
            getStoredAIClientConfig(),
            signal,
          );

          return createStoredGeneratedResume({
            strategy: input,
            content,
            jdId: input.jdId,
            matchResultId: input.matchResultId,
          });
        }
      ),
    onSuccess: (resume) => {
      queryClient.invalidateQueries({ queryKey: generateKeys.all });
      queryClient.invalidateQueries({ queryKey: generateKeys.detail(resume.id) });
    },
  });
}

export function useDeleteGeneratedResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteStoredGeneratedResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generateKeys.all });
    },
  });
}
