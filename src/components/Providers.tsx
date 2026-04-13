'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { AgentTaskProvider } from '@/components/agent/AgentTaskProvider';
import { WORKSPACE_UPDATED_EVENT } from '@/lib/client/workspace-storage';

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
    const invalidate = () => {
      queryClient.invalidateQueries();
    };

    window.addEventListener(WORKSPACE_UPDATED_EVENT, invalidate);
    window.addEventListener('storage', invalidate);

    return () => {
      window.removeEventListener(WORKSPACE_UPDATED_EVENT, invalidate);
      window.removeEventListener('storage', invalidate);
    };
  }, [queryClient]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AgentTaskProvider>
        <NuqsAdapter>
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </NuqsAdapter>
      </AgentTaskProvider>
    </ThemeProvider>
  );
}
