'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bot,
  MessageSquare,
  Code,
  Search,
  Zap,
  Brain,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    cta: false
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = entry.target.getAttribute('data-section');
          if (section) {
            setIsVisible(prev => ({ ...prev, [section]: true }));
          }
        }
      });
    }, observerOptions);

    // Observe sections
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    // Trigger hero animation immediately
    setTimeout(() => setIsVisible(prev => ({ ...prev, hero: true })), 100);

    return () => observer.disconnect();
  }, []);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Liquid Glass Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(102, 126, 234, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(102, 126, 234, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Liquid Morphing Shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-liquid-morph"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 opacity-15">
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full animate-liquid-morph" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full animate-liquid-morph" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Professional Header */}
      <header className="relative border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-float-3d">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">APE</h1>
              <p className="text-sm text-slate-400">AI Productivity Engine</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="liquid-glass" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Liquid Glass Hero Section */}
        <section data-section="hero" className="min-h-screen flex items-center justify-center px-6 py-20">
          <div className="container mx-auto text-center">
            <div className={`liquid-glass max-w-4xl mx-auto p-12 mb-12 transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="animate-float-3d">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-full mb-8 border border-blue-500/30">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-300 font-medium">Powered by Advanced AI</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  AI Productivity
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Engine
                  </span>
                </h1>

                <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Transform your workflow with intelligent automation. Chat with AI, generate code,
                  research topics, and extract data—all in one unified platform.
                </p>

                 <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                   <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold hover-3d btn-ripple shimmer glow-pulse" asChild>
                     <Link href="/register">
                       <Zap className="mr-2 h-5 w-5" />
                       Start Free Trial
                     </Link>
                   </Button>
                   <Button size="lg" variant="outline" className="liquid-glass px-8 py-4 text-lg hover-3d btn-ripple" asChild>
                     <Link href="#features">
                       <Play className="mr-2 h-5 w-5" />
                       Watch Demo
                     </Link>
                   </Button>
                 </div>

                 {/* Trust Indicators */}
                 <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-300 stagger-fade-in">
                   <div className="flex items-center space-x-2">
                     <CheckCircle className="h-4 w-4 text-green-400" />
                     <span>No Credit Card Required</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <CheckCircle className="h-4 w-4 text-green-400" />
                     <span>Free Tier Available</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <CheckCircle className="h-4 w-4 text-green-400" />
                     <span>Enterprise Security</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section data-section="features" id="features" className="py-20 px-6">
          <div className="container mx-auto">
            <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className="text-4xl font-bold text-white mb-4">Powerful AI Features</h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Everything you need to supercharge your productivity with cutting-edge AI technology.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className={`liquid-glass hover-3d group cursor-pointer transition-all duration-1000 delay-500 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:animate-float-3d transition-transform duration-300">
                    <MessageSquare className="h-8 w-8 text-blue-400" />
                  </div>
                  <CardTitle className="text-white text-xl">AI Chat</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-300">
                    Intelligent conversations with context-aware AI for problem-solving and assistance.
                  </p>
                </CardContent>
              </Card>

              <Card className={`liquid-glass hover-3d group cursor-pointer transition-all duration-1000 delay-700 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:animate-float-3d transition-transform duration-300">
                    <Code className="h-8 w-8 text-purple-400" />
                  </div>
                  <CardTitle className="text-white text-xl">Code Assistant</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-300">
                    Generate, debug, and optimize code across all programming languages.
                  </p>
                </CardContent>
              </Card>

              <Card className={`liquid-glass hover-3d group cursor-pointer transition-all duration-1000 delay-900 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:animate-float-3d transition-transform duration-300">
                    <Search className="h-8 w-8 text-green-400" />
                  </div>
                  <CardTitle className="text-white text-xl">Deep Research</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-300">
                    Comprehensive research synthesis with automatic citations and source verification.
                  </p>
                </CardContent>
              </Card>

              <Card className={`liquid-glass hover-3d group cursor-pointer transition-all duration-1000 delay-1100 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:animate-float-3d transition-transform duration-300">
                    <Brain className="h-8 w-8 text-cyan-400" />
                  </div>
                  <CardTitle className="text-white text-xl">Data Extraction</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-300">
                    Intelligent data extraction from documents and images with OCR capabilities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section data-section="cta" className="py-20 px-6">
          <div className="container mx-auto text-center">
            <div className={`liquid-glass max-w-2xl mx-auto p-12 transition-all duration-1000 delay-300 ${isVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Workflow?</h3>
              <p className="text-slate-300 mb-8 text-lg">
                Join thousands of professionals who have revolutionized their productivity with APE.
              </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold hover-3d btn-ripple shimmer glow-pulse" asChild>
                   <Link href="/register">
                     <Zap className="mr-2 h-5 w-5" />
                     Start Building Today
                   </Link>
                 </Button>
                 <Button size="lg" variant="outline" className="liquid-glass px-8 py-4 text-lg hover-3d btn-ripple" asChild>
                   <Link href="/login">Sign In to Dashboard</Link>
                 </Button>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
