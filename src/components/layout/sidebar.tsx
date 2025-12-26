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
    <div className="flex h-full w-72 flex-col glass-card border-r border-border/50">
      {/* Logo & Status */}
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-6">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-primary glow" />
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              APE
            </span>
            <div className="text-xs text-muted-foreground">AI Productivity Engine</div>
          </div>
        </div>
        <div className="status-online" title="System Online">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-glow"></div>
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

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const badgeValue = item.badge === 'conversations' ? conversations.length : null;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 group',
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30 glow'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground glass'
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                )} />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </div>
              {badgeValue !== null && badgeValue > 0 && (
                <Badge variant="glow" className="text-xs">
                  {badgeValue}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border/50 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center glow">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="glass"
            size="sm"
            className="w-full justify-start"
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
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
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