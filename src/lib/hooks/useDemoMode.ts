'use client';

import { useEffect, useState } from 'react';
import { WORKSPACE_UPDATED_EVENT } from '@/lib/client/workspace-storage';
import { hasDemoWorkspaceBackup, isDemoModeEnabled } from '@/lib/client/demo-mode';

interface DemoModeState {
  isDemoMode: boolean;
  hasBackup: boolean;
  mounted: boolean;
}

export function useDemoMode(): DemoModeState {
  const [state, setState] = useState<DemoModeState>({
    isDemoMode: false,
    hasBackup: false,
    mounted: false,
  });

  useEffect(() => {
    const sync = () => {
      setState({
        isDemoMode: isDemoModeEnabled(),
        hasBackup: hasDemoWorkspaceBackup(),
        mounted: true,
      });
    };

    sync();

    window.addEventListener(WORKSPACE_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(WORKSPACE_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return state;
}
