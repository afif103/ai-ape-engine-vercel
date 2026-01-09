'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { MobileHeader } from '@/components/ui/mobile-header';
import { useAuthStore } from '@/contexts/auth-context';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuthStore();
  const isMobile = useIsMobile();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hide global sidebar on mobile - pages have their own mobile UI */}
      {!isMobile && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header with user controls */}
        {isMobile && <MobileHeader />}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}