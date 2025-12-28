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
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  BarChart3,
  Bot,
  ChevronRight,
  Users
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { conversations } = useChatStore();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else {
      const timer = setTimeout(() => setIsPageLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

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
      stats: 'Real-time AI responses'
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
    },
    {
      title: 'Batch Processing',
      description: 'Process multiple files',
      icon: Zap,
      href: '/batch',
      gradient: 'from-yellow-500 to-orange-500',
      stats: 'Up to 10 files at once'
    }
  ];

  const recentActivities = [
    {
      type: 'chat',
      title: 'AI Conversation',
      description: 'Discussed Python optimization techniques and best practices',
      time: '2 hours ago',
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      type: 'code',
      title: 'Code Generation',
      description: 'Generated React component with TypeScript and Tailwind CSS',
      time: '5 hours ago',
      icon: Code,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      type: 'research',
      title: 'Research Query',
      description: 'Analyzed AI trends in healthcare and medical diagnostics',
      time: '1 day ago',
      icon: Search,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      type: 'extraction',
      title: 'Data Extraction',
      description: 'Extracted financial data from PDF reports and invoices',
      time: '2 days ago',
      icon: Brain,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    {
      type: 'batch',
      title: 'Batch Processing',
      description: 'Processed 50 customer support tickets with AI responses',
      time: '3 days ago',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      type: 'chat',
      title: 'Technical Discussion',
      description: 'Explored machine learning algorithms for image recognition',
      time: '4 days ago',
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      type: 'code',
      title: 'API Development',
      description: 'Built REST API endpoints with FastAPI and SQLAlchemy',
      time: '5 days ago',
      icon: Code,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      type: 'research',
      title: 'Market Analysis',
      description: 'Researched competitive landscape in AI-powered tools',
      time: '1 week ago',
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
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative transition-all duration-500 overflow-y-auto ${isPageLoading ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-liquid-morph"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 opacity-15">
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full animate-liquid-morph" style={{ animationDelay: '3s' }}></div>
        </div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto min-h-full">
        {/* Header Section */}
        <div className="mb-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="animate-fade-in">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-float-3d">
                  <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    Command Center
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300">Welcome back, {user.name || 'Operator'}</p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-slate-200 max-w-3xl">
                Your AI productivity ecosystem is online. Ready to amplify your capabilities?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="liquid-glass px-4 py-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-glow"></div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">System Status</p>
                    <p className="text-green-400 text-xs sm:text-sm">All Systems Operational</p>
                  </div>
                </div>
              </div>
              <div className="liquid-glass px-4 py-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Current Time</p>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-slate-900/30 border border-slate-700/50 backdrop-blur-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="liquid-glass hover-3d group cursor-pointer transition-all duration-500 border-0 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-500`}></div>
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-xl`}></div>

                <CardHeader className="relative z-10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center group-hover:animate-float-3d group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:animate-pulse" />
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-white text-lg sm:text-xl">
                    {action.title}
                  </CardTitle>
                  <p className="text-slate-300 text-sm">{action.description}</p>
                </CardHeader>

                <CardContent className="relative z-10 p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-400 bg-slate-800/70 px-3 py-1.5 rounded-full font-medium">
                      {action.stats}
                    </span>
                    <Button
                      asChild
                      size="sm"
                      className={`bg-gradient-to-r ${action.gradient} hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-md text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4`}
                    >
                      <Link href={action.href} className="flex items-center">
                        Launch
                        <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Metrics & Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 p-4 sm:p-6 rounded-2xl bg-slate-900/20 border border-slate-700/30 backdrop-blur-sm min-h-[500px]">
          {/* System Metrics */}
          <div className="xl:col-span-2">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              System Metrics
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {systemMetrics.map((metric, index) => (
                <Card key={index} className="liquid-glass hover-3d transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                        <span className="text-xs sm:text-sm text-green-400 font-medium">{metric.change}</span>
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">{metric.value}</div>
                    <p className="text-slate-300 text-xs sm:text-sm">{metric.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
              <Activity className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
              Recent Activity
            </h2>
            <Card className="liquid-glass">
              <CardContent className="p-4">
                <div className="space-y-2 h-[400px] overflow-y-auto">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors duration-300 border border-slate-700/30">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm sm:text-base font-medium truncate">{activity.title}</p>
                        <p className="text-slate-300 text-xs sm:text-sm">{activity.description}</p>
                        <p className="text-slate-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-slate-900/20 border border-slate-700/30 backdrop-blur-sm">
          <Card className="liquid-glass hover-3d transition-all duration-300">
            <CardHeader className="p-4">
              <CardTitle className="text-white flex items-center text-base sm:text-lg">
                <Zap className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <h4 className="text-white font-medium mb-2 flex items-center text-sm sm:text-base">
                  <Target className="mr-2 h-4 w-4 text-blue-400" />
                  Productivity Tip
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Your chat sessions increased 12% this month. Try using research to gather context before complex coding.
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <h4 className="text-white font-medium mb-2 flex items-center text-sm sm:text-base">
                  <Code className="mr-2 h-4 w-4 text-purple-400" />
                  Code Optimization
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm">
                  The code assistant can now handle multi-file refactoring. Try optimizing your entire project.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass hover-3d transition-all duration-300">
            <CardHeader className="p-4">
              <CardTitle className="text-white flex items-center text-base sm:text-lg">
                <Users className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                Community & Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Usage Stats</h4>
                <p className="text-slate-300 text-xs sm:text-sm">
                  You've completed 432 research queries this month. Top 10% of active users!
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Next Goals</h4>
                <p className="text-slate-300 text-xs sm:text-sm">
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