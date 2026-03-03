'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Profile } from '@/lib/types/profile';
import { itemKeys } from '@/lib/hooks/useItems';
import { fetchJson, fetchWithAISettings } from '@/lib/client/fetch-json';

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// ---------------------------------------------------------------------------
// API helper
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// useProfile – GET /api/profile
// ---------------------------------------------------------------------------

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      const { profile } = await fetchJson<{ profile: Profile }>('/api/profile');
      return profile;
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateProfile – PUT /api/profile
// ---------------------------------------------------------------------------

type UpdateProfileVariables = Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>;

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const detailKey = profileKeys.detail();

  return useMutation({
    mutationFn: async (variables: UpdateProfileVariables) => {
      const { profile } = await fetchJson<{ profile: Profile }>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(variables),
      });
      return profile;
    },

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previous = queryClient.getQueryData<Profile>(detailKey);

      // Apply the optimistic patch.
      queryClient.setQueryData<Profile>(detailKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          ...variables,
          updatedAt: new Date().toISOString(),
        };
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(detailKey, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailKey });
    },
  });
}

// ---------------------------------------------------------------------------
// useResetProfile – DELETE /api/profile (wipes all items + clears profile)
// ---------------------------------------------------------------------------

export function useResetProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAISettings('/api/profile', { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.text().catch(() => res.statusText);
        throw new Error(`Reset failed (${res.status}): ${body}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}
