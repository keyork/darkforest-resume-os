'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Item, ItemType, ItemData, ItemSource } from '@/lib/types/item';

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters: { type?: ItemType; visible?: boolean }) =>
    [...itemKeys.lists(), filters] as const,
  detail: (id: string) => [...itemKeys.all, 'detail', id] as const,
};

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`API ${init?.method ?? 'GET'} ${url} failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// useItems – GET /api/items
// ---------------------------------------------------------------------------

export function useItems(type?: ItemType, visible?: boolean) {
  const filters = { type, visible };

  return useQuery({
    queryKey: itemKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type !== undefined) params.set('type', type);
      if (visible !== undefined) params.set('visible', String(visible));

      const qs = params.toString();
      const url = `/api/items${qs ? `?${qs}` : ''}`;

      const { items } = await fetchJson<{ items: Item[] }>(url);
      return items;
    },
  });
}

// ---------------------------------------------------------------------------
// useItem – GET /api/items/:id
// ---------------------------------------------------------------------------

export function useItem(id: string) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: async () => {
      const { item } = await fetchJson<{ item: Item }>(`/api/items/${id}`);
      return item;
    },
    enabled: Boolean(id),
  });
}

// ---------------------------------------------------------------------------
// useCreateItem – POST /api/items
// ---------------------------------------------------------------------------

interface CreateItemVariables {
  type: ItemType;
  data: ItemData;
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateItemVariables) => {
      const { item } = await fetchJson<{ item: Item }>('/api/items', {
        method: 'POST',
        body: JSON.stringify(variables),
      });
      return item;
    },

    onMutate: async (variables) => {
      // Cancel any outgoing list refetches so they don't overwrite the optimistic entry.
      await queryClient.cancelQueries({ queryKey: itemKeys.lists() });

      // Snapshot all existing list caches.
      const previousLists = queryClient.getQueriesData<Item[]>({
        queryKey: itemKeys.lists(),
      });

      // Build a temporary optimistic item.
      const tempId = `__temp__${Date.now()}`;
      const optimisticItem: Item = {
        id: tempId,
        profileId: '',
        visible: true,
        sortOrder: 0,
        source: 'manual' as ItemSource,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...variables.data,
      };

      // Insert the optimistic item at the end of every matching list cache.
      queryClient.setQueriesData<Item[]>({ queryKey: itemKeys.lists() }, (old) =>
        old ? [...old, optimisticItem] : [optimisticItem],
      );

      return { previousLists, tempId };
    },

    onError: (_err, _vars, context) => {
      if (!context) return;
      // Roll back each list cache to its previous snapshot.
      for (const [queryKey, data] of context.previousLists) {
        queryClient.setQueryData(queryKey, data);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateItem – PUT /api/items/:id
// ---------------------------------------------------------------------------

interface UpdateItemVariables {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: ItemData | Record<string, any>;
  visible?: boolean;
  sortOrder?: number;
  source?: ItemSource;
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateItemVariables) => {
      const { item } = await fetchJson<{ item: Item }>(`/api/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return item;
    },

    onMutate: async (variables) => {
      const detailKey = itemKeys.detail(variables.id);

      // Cancel outgoing queries for both lists and this detail.
      await queryClient.cancelQueries({ queryKey: itemKeys.lists() });
      await queryClient.cancelQueries({ queryKey: detailKey });

      // Snapshot existing data.
      const previousDetail = queryClient.getQueryData<Item>(detailKey);
      const previousLists = queryClient.getQueriesData<Item[]>({
        queryKey: itemKeys.lists(),
      });

      // Apply optimistic patch to the detail cache.
      queryClient.setQueryData<Item>(detailKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          ...(variables.data ?? {}),
          ...(variables.visible !== undefined ? { visible: variables.visible } : {}),
          ...(variables.sortOrder !== undefined ? { sortOrder: variables.sortOrder } : {}),
          ...(variables.source !== undefined ? { source: variables.source } : {}),
          updatedAt: new Date().toISOString(),
        };
      });

      // Apply optimistic patch to all list caches.
      queryClient.setQueriesData<Item[]>({ queryKey: itemKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((item) => {
          if (item.id !== variables.id) return item;
          return {
            ...item,
            ...(variables.data ?? {}),
            ...(variables.visible !== undefined ? { visible: variables.visible } : {}),
            ...(variables.sortOrder !== undefined ? { sortOrder: variables.sortOrder } : {}),
            ...(variables.source !== undefined ? { source: variables.source } : {}),
            updatedAt: new Date().toISOString(),
          };
        });
      });

      return { previousDetail, previousLists };
    },

    onError: (_err, variables, context) => {
      if (!context) return;
      if (context.previousDetail !== undefined) {
        queryClient.setQueryData(itemKeys.detail(variables.id), context.previousDetail);
      }
      for (const [queryKey, data] of context.previousLists) {
        queryClient.setQueryData(queryKey, data);
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteItem – DELETE /api/items/:id
// ---------------------------------------------------------------------------

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchJson<unknown>(`/api/items/${id}`, { method: 'DELETE' });
      return id;
    },

    onMutate: async (id) => {
      const detailKey = itemKeys.detail(id);

      await queryClient.cancelQueries({ queryKey: itemKeys.lists() });
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousDetail = queryClient.getQueryData<Item>(detailKey);
      const previousLists = queryClient.getQueriesData<Item[]>({
        queryKey: itemKeys.lists(),
      });

      // Optimistically remove the item from all list caches.
      queryClient.setQueriesData<Item[]>({ queryKey: itemKeys.lists() }, (old) =>
        old ? old.filter((item) => item.id !== id) : old,
      );

      // Remove the detail cache entry.
      queryClient.removeQueries({ queryKey: detailKey });

      return { previousDetail, previousLists };
    },

    onError: (_err, id, context) => {
      if (!context) return;
      if (context.previousDetail !== undefined) {
        queryClient.setQueryData(itemKeys.detail(id), context.previousDetail);
      }
      for (const [queryKey, data] of context.previousLists) {
        queryClient.setQueryData(queryKey, data);
      }
    },

    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// useToggleVisibility – PUT /api/items/:id/visibility
// ---------------------------------------------------------------------------

export function useToggleVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { item } = await fetchJson<{ item: Item }>(`/api/items/${id}/visibility`, {
        method: 'PUT',
      });
      return item;
    },

    onMutate: async (id) => {
      const detailKey = itemKeys.detail(id);

      await queryClient.cancelQueries({ queryKey: itemKeys.lists() });
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousDetail = queryClient.getQueryData<Item>(detailKey);
      const previousLists = queryClient.getQueriesData<Item[]>({
        queryKey: itemKeys.lists(),
      });

      // Optimistically toggle `visible` in the detail cache.
      queryClient.setQueryData<Item>(detailKey, (old) => {
        if (!old) return old;
        return { ...old, visible: !old.visible, updatedAt: new Date().toISOString() };
      });

      // Optimistically toggle `visible` in all list caches.
      queryClient.setQueriesData<Item[]>({ queryKey: itemKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((item) =>
          item.id !== id
            ? item
            : { ...item, visible: !item.visible, updatedAt: new Date().toISOString() },
        );
      });

      return { previousDetail, previousLists };
    },

    onError: (_err, id, context) => {
      if (!context) return;
      if (context.previousDetail !== undefined) {
        queryClient.setQueryData(itemKeys.detail(id), context.previousDetail);
      }
      for (const [queryKey, data] of context.previousLists) {
        queryClient.setQueryData(queryKey, data);
      }
    },

    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// useReorderItems – PUT /api/items/reorder
// ---------------------------------------------------------------------------

interface ReorderItemsVariables {
  items: Array<{ id: string; sortOrder: number }>;
}

export function useReorderItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: ReorderItemsVariables) => {
      await fetchJson<unknown>('/api/items/reorder', {
        method: 'PUT',
        body: JSON.stringify(variables),
      });
    },

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.lists() });

      const previousLists = queryClient.getQueriesData<Item[]>({
        queryKey: itemKeys.lists(),
      });

      // Build a lookup map for O(1) access.
      const orderMap = new Map(variables.items.map(({ id, sortOrder }) => [id, sortOrder]));

      // Optimistically update sortOrder across all list caches.
      queryClient.setQueriesData<Item[]>({ queryKey: itemKeys.lists() }, (old) => {
        if (!old) return old;
        return old
          .map((item) => {
            const newOrder = orderMap.get(item.id);
            return newOrder !== undefined
              ? { ...item, sortOrder: newOrder, updatedAt: new Date().toISOString() }
              : item;
          })
          .sort((a, b) => a.sortOrder - b.sortOrder);
      });

      return { previousLists };
    },

    onError: (_err, _vars, context) => {
      if (!context) return;
      for (const [queryKey, data] of context.previousLists) {
        queryClient.setQueryData(queryKey, data);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
