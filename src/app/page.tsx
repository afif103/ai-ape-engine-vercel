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

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    setTimeout(() => setIsVisible(prev => ({ ...prev, hero: true })), 100);

    return () => observer.disconnect();
  }, []);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large Moving Grid with Strong Perspective */}
        <div className="absolute inset-0" style={{ perspective: '800px' }}>
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(59, 130, 246, 0.4) 2px, transparent 2px),
                linear-gradient(to bottom, rgba(59, 130, 246, 0.4) 2px, transparent 2px)
              `,
              backgroundSize: '80px 80px',
              transform: 'rotateX(60deg) translateZ(-300px) scale(2)',
              transformOrigin: 'center bottom',
              animation: 'gridFlow 15s linear infinite'
            }}
          />
        </div>

        {/* Secondary Grid Layer */}
        <div className="absolute inset-0" style={{ perspective: '800px' }}>
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(168, 85, 247, 0.5) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(168, 85, 247, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              transform: 'rotateX(60deg) translateZ(-150px) scale(1.5)',
              transformOrigin: 'center bottom',
              animation: 'gridFlow 10s linear infinite reverse'
            }}
          />
        </div>

        {/* Massive Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] opacity-40">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/50 to-purple-500/50 rounded-full blur-[120px] animate-float-massive"></div>
        </div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] opacity-35">
          <div className="w-full h-full bg-gradient-to-br from-purple-500/50 to-pink-500/50 rounded-full blur-[100px] animate-float-massive-2"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/50 to-blue-500/50 rounded-full blur-[90px] animate-float-massive-3"></div>
        </div>

        {/* Bright Scanning Lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute h-1 w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-vertical-fast blur-sm"></div>
          <div className="absolute h-full w-1 bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-scan-horizontal-fast blur-sm"></div>
        </div>

        {/* Additional Scanning Lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-vertical-slow"></div>
          <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-pink-400 to-transparent animate-scan-horizontal-slow"></div>
        </div>

        {/* Abundant Moving Particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: `rgba(${59 + Math.random() * 150}, ${130 + Math.random() * 100}, 246, ${0.3 + Math.random() * 0.5})`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(59, 130, 246, 0.8)`,
                animation: `floatParticle ${8 + Math.random() * 15}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Radial Pulse Waves */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="absolute w-96 h-96 border-2 border-blue-500/30 rounded-full animate-pulse-wave"></div>
          <div className="absolute w-96 h-96 border-2 border-purple-500/30 rounded-full animate-pulse-wave-delayed"></div>
          <div className="absolute w-96 h-96 border-2 border-cyan-500/30 rounded-full animate-pulse-wave-delayed-2"></div>
        </div>

        {/* Strong Corner Glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/30 via-transparent to-transparent blur-[100px] animate-glow-pulse"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/30 via-transparent to-transparent blur-[100px] animate-glow-pulse-delayed"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/30 via-transparent to-transparent blur-[100px] animate-glow-pulse-delayed-2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-pink-500/30 via-transparent to-transparent blur-[100px] animate-glow-pulse"></div>

        {/* Diagonal Light Beams */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 via-transparent to-transparent transform rotate-45 origin-top-left animate-beam-1"></div>
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-purple-400 via-transparent to-transparent transform -rotate-45 origin-top-right animate-beam-2"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-float-3d">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">APE</h1>
              <p className="text-xs sm:text-sm text-slate-400">AI Productivity Engine</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="outline" size="sm" className="liquid-glass text-sm sm:text-base" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section data-section="hero" className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="container mx-auto text-center">
            <div className={`liquid-glass max-w-5xl mx-auto p-6 sm:p-10 mb-8 transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="animate-float-3d">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-full mb-6 border border-blue-500/30">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-sm sm:text-base text-blue-300 font-medium">Powered by Advanced AI</span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
                  AI Productivity
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Engine
                  </span>
                </h1>

                <p className="text-lg sm:text-xl lg:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Transform your workflow with intelligent automation. Chat with AI, generate code,
                  research topics, and extract data—all in one unified platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold hover-3d btn-ripple shimmer glow-pulse" asChild>
                    <Link href="/register">
                      <Zap className="mr-2 h-5 w-5" />
                      Start Free Trial
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="liquid-glass px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg hover-3d btn-ripple" asChild>
                    <Link href="#features">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm sm:text-base text-slate-300 stagger-fade-in">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    <span>No Credit Card Required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    <span>Free Tier Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    <span>Enterprise Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section data-section="features" id="features" className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="container mx-auto max-w-7xl">
            <div className={`text-center mb-10 sm:mb-12 transition-all duration-1000 delay-300 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Powerful AI Features</h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto">
                Everything you need to supercharge your productivity with cutting-edge AI technology.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className={`liquid-glass hover-3d group cursor-pointer transition-all duration-1000 delay-500 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:animate-float-3d transition-transform duration-300">
                    <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-blue-400" />
                  </div>
                  <CardTitle className="text-white text-lg sm:text-xl lg:text-2xl">AI Chat</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-4 sm:p-6 pt-0">
                  <p className="text-base sm:text-lg text-slate-200">
                    Intelligent conversations with context-aware AI for problem-solving and assistance.
                  </p>
                </CardContent>
              </Card>

              <Card className={`liquid-glass hover-3d group cursor-pointer transition-all duration-1000 delay-700 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:animate-float-3d transition-transform duration-300">
                    <Code className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400" />
                  </div>
                  <CardTitle className="text-white text-lg sm:text-xl lg:text-2xl">Code Assistant</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-4 sm:p-6 pt-0">
                  <p className="text-base sm:text-lg text-slate-200">
                    Generate, debug, and optimize code across all programming languages.
                  </p>
                </CardContent>
              </Card>

              <Card className={`liquid-glass hover-3d group cursor-pointer transition-all duration-1000 delay-900 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:animate-float-3d transition-transform duration-300">
                    <Search className="h-7 w-7 sm:h-8 sm:w-8 text-green-400" />
                  </div>
                  <CardTitle className="text-white text-lg sm:text-xl lg:text-2xl">Deep Research</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-4 sm:p-6 pt-0">
                  <p className="text-base sm:text-lg text-slate-200">
                    Comprehensive research synthesis with automatic citations and source verification.
                  </p>
                </CardContent>
              </Card>

              <Card className={`liquid-glass hover-3d group cursor-pointer transition-all duration-1000 delay-1100 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:animate-float-3d transition-transform duration-300">
                    <Brain className="h-7 w-7 sm:h-8 sm:w-8 text-cyan-400" />
                  </div>
                  <CardTitle className="text-white text-lg sm:text-xl lg:text-2xl">Data Extraction</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-4 sm:p-6 pt-0">
                  <p className="text-base sm:text-lg text-slate-200">
                    Intelligent data extraction from documents and images with OCR capabilities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section data-section="cta" className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="container mx-auto text-center max-w-5xl">
            <div className={`liquid-glass p-6 sm:p-10 transition-all duration-1000 delay-300 ${isVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Transform Your Workflow?</h3>
              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8">
                Join thousands of professionals who have revolutionized their productivity with APE.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold hover-3d btn-ripple shimmer glow-pulse" asChild>
                  <Link href="/register">
                    <Zap className="mr-2 h-5 w-5" />
                    Start Building Today
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="liquid-glass px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg hover-3d btn-ripple" asChild>
                  <Link href="/login">Sign In to Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes gridFlow {
          0% {
            transform: rotateX(60deg) translateZ(-300px) scale(2) translateY(0);
          }
          100% {
            transform: rotateX(60deg) translateZ(-300px) scale(2) translateY(80px);
          }
        }

        @keyframes scan-vertical-fast {
          0% { top: -10%; }
          100% { top: 110%; }
        }

        @keyframes scan-horizontal-fast {
          0% { left: -10%; }
          100% { left: 110%; }
        }

        @keyframes scan-vertical-slow {
          0% { top: -10%; }
          100% { top: 110%; }
        }

        @keyframes scan-horizontal-slow {
          0% { left: -10%; }
          100% { left: 110%; }
        }

        @keyframes floatParticle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(100px, -120vh) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes float-massive {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }

        @keyframes float-massive-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, 40px) scale(1.15);
          }
          66% {
            transform: translate(60px, -20px) scale(0.95);
          }
        }

        @keyframes float-massive-3 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        @keyframes pulse-wave {
          0% {
            transform: scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes pulse-wave-delayed {
          0% {
            transform: scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes pulse-wave-delayed-2 {
          0% {
            transform: scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes glow-pulse-delayed {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes glow-pulse-delayed-2 {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes beam-1 {
          0%, 100% {
            opacity: 0;
            transform: translateX(-100%) rotate(45deg);
          }
          50% {
            opacity: 1;
            transform: translateX(200%) rotate(45deg);
          }
        }

        @keyframes beam-2 {
          0%, 100% {
            opacity: 0;
            transform: translateX(100%) rotate(-45deg);
          }
          50% {
            opacity: 1;
            transform: translateX(-200%) rotate(-45deg);
          }
        }

        .animate-scan-vertical-fast {
          animation: scan-vertical-fast 4s linear infinite;
        }

        .animate-scan-horizontal-fast {
          animation: scan-horizontal-fast 5s linear infinite;
        }

        .animate-scan-vertical-slow {
          animation: scan-vertical-slow 8s linear infinite;
        }

        .animate-scan-horizontal-slow {
          animation: scan-horizontal-slow 10s linear infinite;
        }

        .animate-float-massive {
          animation: float-massive 20s ease-in-out infinite;
        }

        .animate-float-massive-2 {
          animation: float-massive-2 25s ease-in-out infinite;
        }

        .animate-float-massive-3 {
          animation: float-massive-3 15s ease-in-out infinite;
        }

        .animate-pulse-wave {
          animation: pulse-wave 4s ease-out infinite;
        }

        .animate-pulse-wave-delayed {
          animation: pulse-wave-delayed 4s ease-out infinite 1.3s;
        }

        .animate-pulse-wave-delayed-2 {
          animation: pulse-wave-delayed-2 4s ease-out infinite 2.6s;
        }

        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .animate-glow-pulse-delayed {
          animation: glow-pulse-delayed 3s ease-in-out infinite 1s;
        }

        .animate-glow-pulse-delayed-2 {
          animation: glow-pulse-delayed-2 3s ease-in-out infinite 2s;
        }

        .animate-beam-1 {
          animation: beam-1 6s linear infinite;
        }

        .animate-beam-2 {
          animation: beam-2 8s linear infinite;
        }
      `}</style>
    </div>
  );
}