'use client';

import { useRouter } from 'next/navigation';
import { exitDemoMode } from '@/lib/client/demo-mode';

export function useExitDemoModeToOverview() {
  const router = useRouter();

  return function exitDemoModeToOverview() {
    exitDemoMode();
    router.replace('/');
  };
}
