'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ItemData, ItemSource, ItemType } from '@/lib/types/item';
import {
  createItem as createStoredItem,
  deleteItem as deleteStoredItem,
  getItem as getStoredItem,
  listItems as listStoredItems,
  reorderItems as reorderStoredItems,
  toggleItemVisibility,
  updateItem as updateStoredItem,
} from '@/lib/client/workspace-storage';

export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters: { type?: ItemType; visible?: boolean }) =>
    [...itemKeys.lists(), filters] as const,
  detail: (id: string) => [...itemKeys.all, 'detail', id] as const,
};

export function useItems(type?: ItemType, visible?: boolean) {
  const filters = { type, visible };

  return useQuery({
    queryKey: itemKeys.list(filters),
    queryFn: async () => listStoredItems(filters),
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: async () => getStoredItem(id),
    enabled: Boolean(id),
  });
}

interface CreateItemVariables {
  type: ItemType;
  data: ItemData;
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateItemVariables) =>
      createStoredItem(variables.type, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}

interface UpdateItemVariables {
  id: string;
  data?: ItemData | Record<string, unknown>;
  visible?: boolean;
  sortOrder?: number;
  source?: ItemSource;
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: UpdateItemVariables) => updateStoredItem(variables),
    onSuccess: (_item, variables) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(variables.id) });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteStoredItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}

export function useToggleVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => toggleItemVisibility(id),
    onSuccess: (_item, id) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(id) });
    },
  });
}

interface ReorderItemsVariables {
  items: Array<{ id: string; sortOrder: number }>;
}

export function useReorderItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: ReorderItemsVariables) => reorderStoredItems(variables.items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}
