'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Code,
  Search,
  Settings,
  User,
  LogOut,
  Bot,
  Zap,
  MessageCircle,
  FileText,
  Home,
  Database,
  History
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/contexts/auth-context';
import { useChatStore } from '@/contexts/chat-context';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/metric-card';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Command center',
    badge: null
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    description: 'AI conversations',
    badge: 'conversations'
  },
  {
    name: 'Data Extraction',
    href: '/extraction',
    icon: Database,
    description: 'Document processing',
    badge: null
  },
  {
    name: 'Research',
    href: '/research',
    icon: Search,
    description: 'Web research',
    badge: null
  },
  {
    name: 'Code Assistant',
    href: '/code',
    icon: Code,
    description: 'Code generation',
    badge: null
  },
  {
    name: 'Batch Processing',
    href: '/batch',
    icon: Zap,
    description: 'Bulk operations',
    badge: null
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { conversations, currentConversation } = useChatStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            router.push('/dashboard');
            break;
          case '2':
            e.preventDefault();
            router.push('/chat');
            break;
          case '3':
            e.preventDefault();
            router.push('/extraction');
            break;
          case '4':
            e.preventDefault();
            router.push('/research');
            break;
          case '5':
            e.preventDefault();
            router.push('/code');
            break;
          case '6':
            e.preventDefault();
            router.push('/batch');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex h-full flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/50 backdrop-blur-sm transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Logo & Status - Dark Theme */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/50 px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-float-3d">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse-glow"></div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                APE
              </span>
              <div className="text-xs text-slate-400">AI Productivity Engine</div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center w-full">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-float-3d">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800/50"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation - Dark Theme with Animations */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          const badgeValue = item.badge === 'conversations' ? conversations.length : null;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 group relative overflow-hidden animate-fade-in',
                `delay-${index * 100}`,
                isCollapsed ? 'justify-center px-2' : 'justify-between px-4',
                isActive
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10 glow'
                  : 'text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 bg-slate-900/30 backdrop-blur-sm border border-slate-800/30 hover:glow'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
              title={isCollapsed ? item.name : undefined}
            >
              {/* Liquid flow effect for active items */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-liquid-flow"></div>
              )}

              <div className="flex items-center relative z-10">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                  !isCollapsed && "mr-3",
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                    : "bg-slate-700/50 text-slate-400 group-hover:bg-slate-600 group-hover:text-blue-300"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                {!isCollapsed && (
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                )}
              </div>
              {badgeValue !== null && badgeValue > 0 && (
                <div className="relative z-10">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold animate-pulse-glow">
                    {badgeValue}
                  </Badge>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section - Dark Theme */}
      <div className="border-t border-slate-800/50 p-4">
        {!isCollapsed && (
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 mb-4 border border-slate-800/30">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-float-3d">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse-glow"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'Operator'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800/50"
                asChild
              >
                <Link href="/settings" title="Settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800/50"
              asChild
            >
              <Link href="/settings" title="Settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Button
            className="w-full justify-start bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/30 hover:border-slate-700/50 transition-all duration-300 hover-3d"
            size="sm"
            asChild
          >
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-slate-900/50 border border-slate-800/30 transition-all duration-300"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}