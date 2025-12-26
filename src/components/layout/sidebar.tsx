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
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/contexts/auth-context';
import { useChatStore } from '@/contexts/chat-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/metric-card';

const navigation = [
  {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    description: 'AI conversations',
    badge: 'conversations'
  },
  {
    name: 'Code',
    href: '/code',
    icon: Code,
    description: 'Code assistance',
    badge: null
  },
  {
    name: 'Research',
    href: '/research',
    icon: Search,
    description: 'Web research',
    badge: null
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { conversations } = useChatStore();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-full w-72 flex-col liquid-glass border-r border-glass-border">
      {/* Logo & Status - M.O.N.K.Y Style */}
      <div className="flex h-16 items-center justify-between border-b border-glass-border px-6">
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
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-glow" title="System Online"></div>
          <span className="text-xs text-green-400 font-medium">Online</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-border/50">
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            title="Conversations"
            value={conversations.length}
            className="p-3"
            glow={false}
          />

        </div>
      </div>

      {/* Navigation - Enhanced M.O.N.K.Y Style */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const badgeValue = item.badge === 'conversations' ? conversations.length : null;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 liquid-glass'
              )}
            >
              {/* Liquid flow effect for active items */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-liquid-flow"></div>
              )}

              <div className="flex items-center relative z-10">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                    : "bg-slate-700/50 text-slate-400 group-hover:bg-slate-600 group-hover:text-blue-300"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
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

      {/* User section - Liquid Glass Enhanced */}
      <div className="border-t border-glass-border p-4">
        <div className="liquid-glass rounded-lg p-3 mb-4">
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
          </div>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full justify-start liquid-glass hover-3d transition-all duration-300"
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
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 liquid-glass transition-all duration-300"
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