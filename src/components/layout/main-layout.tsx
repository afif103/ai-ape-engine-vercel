'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { StatsBar } from '@/components/ui/metric-card';
import { useAuthStore } from '@/contexts/auth-context';
import { useChatStore } from '@/contexts/chat-context';
import { MessageSquare, Zap, Activity } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuthStore();
  const { conversations, currentConversation } = useChatStore();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Calculate stats
  const totalConversations = conversations.length;
  const activeConversation = currentConversation ? 1 : 0;

  const stats = [
    {
      label: 'Conversations',
      value: totalConversations,
      icon: MessageSquare
    },
    {
      label: 'Active',
      value: activeConversation,
      icon: Activity
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        <StatsBar stats={stats} className="border-t border-border/50" />
      </div>
    </div>
  );
}