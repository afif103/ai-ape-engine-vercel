'use client';

import React, { ReactNode } from 'react';
import { useAuthStore } from '@/contexts/auth-context';

interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  // Initialize auth check on mount
  const checkAuth = useAuthStore((state) => state.checkAuth);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}

export default Providers;