'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { AgentTaskProvider } from '@/components/agent/AgentTaskProvider';
import {
  WORKSPACE_STORAGE_KEY,
  WORKSPACE_UPDATED_EVENT,
  type WorkspaceQueryScope,
  type WorkspaceUpdatedDetail,
} from '@/lib/client/workspace-storage';

const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools),
  { ssr: false }
);

const QUERY_ROOTS: Record<Exclude<WorkspaceQueryScope, 'all'>, readonly string[]> = {
  profile: ['profile'],
  items: ['items'],
  jds: ['jd'],
  match: ['match'],
  generate: ['generate'],
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    const invalidateScopes = (scopes: WorkspaceQueryScope[]) => {
      if (scopes.includes('all')) {
        Object.values(QUERY_ROOTS).forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
        return;
      }

      scopes.forEach((scope) => {
        if (scope === 'all') return;
        queryClient.invalidateQueries({ queryKey: QUERY_ROOTS[scope] });
      });
    };

    const handleWorkspaceUpdated = (event: Event) => {
      const detail = (event as CustomEvent<WorkspaceUpdatedDetail>).detail;
      invalidateScopes(detail?.scopes?.length ? detail.scopes : ['all']);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== WORKSPACE_STORAGE_KEY) return;
      invalidateScopes(['all']);
    };

    window.addEventListener(WORKSPACE_UPDATED_EVENT, handleWorkspaceUpdated as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(WORKSPACE_UPDATED_EVENT, handleWorkspaceUpdated as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, [queryClient]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AgentTaskProvider>
        <NuqsAdapter>
          <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' ? (
              <ReactQueryDevtools initialIsOpen={false} />
            ) : null}
          </QueryClientProvider>
        </NuqsAdapter>
      </AgentTaskProvider>
    </ThemeProvider>
  );
}
