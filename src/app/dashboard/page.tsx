'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/contexts/auth-context';
import { useChatStore } from '@/contexts/chat-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  Code,
  Search,
  Brain,
  Plus,
  TrendingUp,
  Activity,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  BarChart3,
  Bot,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { conversations } = useChatStore();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  const quickActions = [
    {
      title: 'AI Chat',
      description: 'Intelligent conversations',
      icon: MessageSquare,
      href: '/chat',
      gradient: 'from-blue-500 to-cyan-500',
      stats: `${conversations.length} conversations`
    },
    {
      title: 'Code Assistant',
      description: 'Generate & debug code',
      icon: Code,
      href: '/code',
      gradient: 'from-purple-500 to-pink-500',
      stats: 'Multi-language support'
    },
    {
      title: 'Deep Research',
      description: 'AI-powered research',
      icon: Search,
      href: '/research',
      gradient: 'from-green-500 to-emerald-500',
      stats: 'Web scraping & analysis'
    },
    {
      title: 'Data Extraction',
      description: 'OCR & document processing',
      icon: Brain,
      href: '/extraction',
      gradient: 'from-orange-500 to-red-500',
      stats: 'Intelligent parsing'
    }
  ];

  const recentActivities = [
    {
      type: 'chat',
      title: 'AI Conversation',
      description: 'Discussed Python optimization techniques',
      time: '2 hours ago',
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      type: 'code',
      title: 'Code Generation',
      description: 'Generated React component with TypeScript',
      time: '5 hours ago',
      icon: Code,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      type: 'research',
      title: 'Research Query',
      description: 'Analyzed AI trends in healthcare',
      time: '1 day ago',
      icon: Search,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    }
  ];

  const systemMetrics = [
    { label: 'Active Sessions', value: '89', change: '+5%', icon: Activity },
    { label: 'Response Time', value: '<200ms', change: '-12%', icon: Zap },
    { label: 'Success Rate', value: '99.8%', change: '+0.2%', icon: Target },
    { label: 'AI Models', value: '4', change: '+1', icon: Bot }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Liquid Glass Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-liquid-morph"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 opacity-15">
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full animate-liquid-morph" style={{ animationDelay: '3s' }}></div>
        </div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="animate-fade-in">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-float-3d">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    Command Center
                  </h1>
                  <p className="text-slate-300 text-lg">Welcome back, {user.name || 'Operator'}</p>
                </div>
              </div>
              <p className="text-slate-200 text-lg max-w-2xl">
                Your AI productivity ecosystem is online. Ready to amplify your capabilities?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="liquid-glass px-6 py-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-glow"></div>
                  <div>
                    <p className="text-white font-medium">System Status</p>
                    <p className="text-green-400 text-sm">All Systems Operational</p>
                  </div>
                </div>
              </div>
              <div className="liquid-glass px-6 py-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Current Time</p>
                    <p className="text-slate-400 text-sm">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Hero Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Sparkles className="mr-3 h-6 w-6 text-purple-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="liquid-glass hover-3d group cursor-pointer transition-all duration-500 border-0 relative overflow-hidden">
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center group-hover:animate-float-3d transition-all duration-300`}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-white text-xl">
                    {action.title}
                  </CardTitle>
                  <p className="text-slate-300 text-sm">{action.description}</p>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 bg-slate-800/70 px-3 py-1.5 rounded-full font-medium">
                      {action.stats}
                    </span>
                    <Button
                      asChild
                      size="sm"
                      className={`bg-gradient-to-r ${action.gradient} hover:opacity-90 transition-all duration-300 hover:scale-105`}
                    >
                      <Link href={action.href} className="flex items-center">
                        Launch
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Metrics & Activity Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* System Metrics */}
          <div className="xl:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <BarChart3 className="mr-3 h-6 w-6 text-green-400" />
              System Metrics
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {systemMetrics.map((metric, index) => (
                <Card key={index} className="liquid-glass hover-3d transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <metric.icon className="h-6 w-6 text-blue-400" />
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">{metric.change}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                    <p className="text-slate-300 text-sm">{metric.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Activity className="mr-3 h-6 w-6 text-orange-400" />
              Recent Activity
            </h2>
            <Card className="liquid-glass">
              <CardContent className="p-6 space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors duration-300 border border-slate-700/30">
                    <div className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-slate-300 text-xs mb-1">{activity.description}</p>
                      <p className="text-slate-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Insights & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="liquid-glass hover-3d transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="mr-3 h-6 w-6 text-yellow-400" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <Target className="mr-2 h-4 w-4 text-blue-400" />
                  Productivity Tip
                </h4>
                <p className="text-slate-300 text-sm">
                  Your chat sessions have increased 12% this month. Try using the research feature to gather context before starting complex coding tasks.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <Code className="mr-2 h-4 w-4 text-purple-400" />
                  Code Optimization
                </h4>
                <p className="text-slate-300 text-sm">
                  The code assistant can now handle multi-file refactoring. Try asking it to optimize your entire project structure.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass hover-3d transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="mr-3 h-6 w-6 text-cyan-400" />
                Community & Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <h4 className="text-white font-medium mb-2">🚀 New Features</h4>
                <p className="text-slate-300 text-sm">
                  Voice-to-text transcription and advanced code review features are now available in beta.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <h4 className="text-white font-medium mb-2">📊 Usage Stats</h4>
                <p className="text-slate-300 text-sm">
                  You've completed 432 research queries this month. You're in the top 10% of active users!
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <h4 className="text-white font-medium mb-2">🎯 Next Goals</h4>
                <p className="text-slate-300 text-sm">
                  Try the new collaborative features to work with your team on complex AI projects.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}