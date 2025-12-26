'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  MessageSquare,
  Code,
  Search,
  ArrowRight,
  Zap,
  Shield,
  Brain,
  Sparkles,
  Activity,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Futuristic Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
      </div>

      {/* Professional Header */}
      <header className="relative border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Dashboard</h1>
              <p className="text-sm text-slate-400">Intelligent Productivity Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-12">
        {/* Dashboard Overview */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
              <p className="text-slate-400">Welcome to your AI productivity platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                <Activity className="w-3 h-3 mr-1" />
                System Online
              </Badge>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-slate-900/50 border-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">AI Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">1,247</div>
                <p className="text-xs text-slate-500">
                  <span className="text-green-400">+12%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Code Generations</CardTitle>
                <Code className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">856</div>
                <p className="text-xs text-slate-500">
                  <span className="text-green-400">+8%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Research Queries</CardTitle>
                <Search className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">432</div>
                <p className="text-xs text-slate-500">
                  <span className="text-green-400">+24%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Active Users</CardTitle>
                <Users className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">89</div>
                <p className="text-xs text-slate-500">
                  <span className="text-green-400">+5%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-slate-900/50 border-slate-800/50 hover:bg-slate-900/70 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">AI Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm leading-relaxed">
                Intelligent conversations with context-aware AI. Experience natural dialogue and problem-solving assistance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50 hover:bg-slate-900/70 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Code Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate, debug, and optimize code across all languages. From algorithms to full-stack applications.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50 hover:bg-slate-900/70 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-white">Deep Research</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm leading-relaxed">
                Comprehensive research synthesis across web sources with automatic citation and source verification.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-slate-800/50">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              Join thousands of users who have transformed their productivity with AI-powered tools.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Free Trial
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
