'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Profile } from '@/lib/types/profile';
import {
  getProfile as getStoredProfile,
  resetWorkspace,
  updateProfile as updateStoredProfile,
} from '@/lib/client/workspace-storage';

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

type UpdateProfileVariables = Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>;

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => getStoredProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: UpdateProfileVariables) => updateStoredProfile(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useResetProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => resetWorkspace(),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
