'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/ui/bottom-nav';
import {
  MessageSquare,
  Code,
  Search,
  Brain,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  Clock,
  Target,
  BarChart3,
  Bot,
  Users,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Quick Launch Tools
  const tools = [
    {
      name: 'AI Chat',
      description: 'Conversations & assistance',
      icon: MessageSquare,
      href: '/chat',
      gradient: 'from-blue-500 to-cyan-500',
      stats: 'Real-time streaming'
    },
    {
      name: 'Code Assistant',
      description: 'Generate & debug code',
      icon: Code,
      href: '/code',
      gradient: 'from-purple-500 to-pink-500',
      stats: 'Multi-language'
    },
    {
      name: 'Research',
      description: 'Web scraping & analysis',
      icon: Search,
      href: '/research',
      gradient: 'from-green-500 to-emerald-500',
      stats: 'AI synthesis'
    },
    {
      name: 'Data Extraction',
      description: 'OCR & document parsing',
      icon: Brain,
      href: '/extraction',
      gradient: 'from-orange-500 to-red-500',
      stats: 'Intelligent parsing'
    },
    {
      name: 'Batch Processing',
      description: 'Multi-file operations',
      icon: Zap,
      href: '/batch',
      gradient: 'from-yellow-500 to-orange-500',
      stats: 'Up to 10 files'
    }
  ];

  // Recent Activity (read-only)
  const recentActivities = [
    {
      tool: 'Chat',
      action: 'Python optimization discussion',
      time: '2h ago',
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      tool: 'Code',
      action: 'React component generation',
      time: '5h ago',
      icon: Code,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      tool: 'Research',
      action: 'AI healthcare trends analysis',
      time: '1d ago',
      icon: Search,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      tool: 'Extraction',
      action: 'Financial PDF data extraction',
      time: '2d ago',
      icon: Brain,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
    {
      tool: 'Batch',
      action: '50 support tickets processed',
      time: '3d ago',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  // System Metrics (read-only)
  const metrics = [
    { label: 'Active Sessions', value: '89', change: '+5%', icon: Activity, color: 'text-blue-400' },
    { label: 'Response Time', value: '<200ms', change: '-12%', icon: Zap, color: 'text-green-400' },
    { label: 'Success Rate', value: '99.8%', change: '+0.2%', icon: Target, color: 'text-purple-400' },
    { label: 'AI Models', value: '4', change: '+1', icon: Bot, color: 'text-cyan-400' }
  ];

  return (
    <>
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden with-bottom-nav">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-liquid-morph"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 opacity-15">
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full animate-liquid-morph" style={{ animationDelay: '3s' }}></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Command Center</h1>
                  <p className="text-sm text-slate-400">Welcome back, {user.name || 'Operator'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Card className="liquid-glass p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <p className="text-sm font-medium text-white">Online</p>
                  </div>
                </div>
              </Card>
              <Card className="liquid-glass p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-slate-400">Time</p>
                    <p className="text-sm font-medium text-white">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Quick Launch */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Quick Launch</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {tools.map((tool) => (
                <Link key={tool.name} href={tool.href}>
                  <Card className="liquid-glass p-4 cursor-pointer hover-3d group transition-all duration-300 border-0 relative overflow-hidden h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    
                    <div className="relative z-10">
                      <div className={`w-10 h-10 bg-gradient-to-br ${tool.gradient} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      
                      <h3 className="text-sm font-semibold text-white mb-1">{tool.name}</h3>
                      <p className="text-xs text-slate-400 mb-3">{tool.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {tool.stats}
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* System Metrics */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">System Metrics</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.map((metric) => (
                <Card key={metric.label} className="liquid-glass p-4 hover-3d transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">{metric.change}</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                  <p className="text-xs text-slate-400">{metric.label}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-orange-400" />
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              </div>
              <Card className="liquid-glass p-4">
                <div className="space-y-2">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-700/30"
                    >
                      <div className={`w-9 h-9 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{activity.action}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{activity.tool}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* AI Insights */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Insights</h2>
              </div>
              <div className="space-y-3">
                <Card className="liquid-glass p-4 hover-3d transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-1">Productivity Tip</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Chat sessions up 12% this month. Try Research for context before coding.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="liquid-glass p-4 hover-3d transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-1">New Feature</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Code assistant now supports multi-file refactoring.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="liquid-glass p-4 hover-3d transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-1">Usage Stats</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        432 research queries. Top 10% of active users!
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <BottomNav />
    </>
  );
}