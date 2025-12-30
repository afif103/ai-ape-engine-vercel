'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { useAuthStore } from '@/contexts/auth-context';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}