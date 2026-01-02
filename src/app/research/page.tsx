'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/contexts/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet } from '@/components/ui/sheet';
import { BottomNav } from '@/components/ui/bottom-nav';
import {
  Search,
  Globe,
  BookOpen,
  ExternalLink,
  Copy,
  Plus,
  X,
  ArrowLeft,
  Loader2,
  FileText,
  Menu
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

const scrapeSchema = z.object({
  url: z.string().url('Valid URL required'),
});

const researchSchema = z.object({
  query: z.string().min(10, 'Query must be at least 10 characters'),
  maxSources: z.number().min(1).max(10),
});

type ScrapeForm = z.infer<typeof scrapeSchema>;
type ResearchForm = z.infer<typeof researchSchema>;

export default function ResearchPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const [activeMode, setActiveMode] = useState<'scrape' | 'research'>('research');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [urls, setUrls] = useState<string[]>(['']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const { register: registerScrape, handleSubmit: handleSubmitScrape, formState: { errors: errorsScrape } } = useForm<ScrapeForm>({
    resolver: zodResolver(scrapeSchema),
  });

  const { register: registerResearch, handleSubmit: handleSubmitResearch, formState: { errors: errorsResearch } } = useForm<ResearchForm>({
    resolver: zodResolver(researchSchema),
    defaultValues: { maxSources: 3 }
  });

  const handleScrape = async (data: ScrapeForm) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await apiClient.scrapeUrl(data.url);
      setResult({ type: 'scrape', ...response.data });
    } catch (error) {
      console.error('Scrape failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResearch = async (data: ResearchForm) => {
    setIsLoading(true);
    setResult(null);
    try {
      const validUrls = urls.filter(url => url.trim());
      const response = await apiClient.researchTopic(data.query, validUrls, data.maxSources);
      setResult({ type: 'research', ...response.data });
    } catch (error: any) {
      console.error('Research failed:', error);
      setResult({
        type: 'research',
        error: error.response?.data?.detail || 'Research failed',
        success: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addUrl = () => setUrls([...urls, '']);
  const removeUrl = (index: number) => setUrls(urls.filter((_, i) => i !== index));
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const modes = [
    { id: 'scrape', label: 'Scrape URL', description: 'Extract content from website', icon: Globe },
    { id: 'research', label: 'Deep Research', description: 'Multi-source AI analysis', icon: BookOpen },
  ];

  // Sidebar content component (reusable for desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Tool Header */}
      <Card className="liquid-glass bg-slate-900/80 p-4">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back
          </Link>
          <h2 className="text-lg font-semibold text-white mt-2 flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-400" />
            Research
          </h2>
          <p className="text-sm text-slate-400 mt-1">Web scraping & AI research</p>
        </Card>

        {/* Mode Switcher */}
        <Card className="liquid-glass bg-slate-900/80 p-3">
          <div className="space-y-2">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode.id as any);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full p-2 rounded-lg border text-left transition-all ${
                  activeMode === mode.id
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'border-slate-700/50 hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <mode.icon className={`h-4 w-4 ${activeMode === mode.id ? 'text-blue-400' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{mode.label}</div>
                    <div className="text-xs text-slate-400">{mode.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Input Form */}
        <Card className="liquid-glass bg-slate-900/80 p-4">
          <div className="space-y-3">
            {activeMode === 'scrape' ? (
              <>
                <div>
                  <Label className="text-sm text-slate-300">Website URL</Label>
                  <Input
                    {...registerScrape('url')}
                    className="mt-1.5 h-9 glass text-white"
                    placeholder="https://example.com"
                  />
                  {errorsScrape.url && (
                    <p className="text-xs text-red-400 mt-1">{errorsScrape.url.message}</p>
                  )}
                </div>
                <Button
                  onClick={handleSubmitScrape(handleScrape)}
                  className="w-full h-9"
                  variant="futuristic"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Scrape Website
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-sm text-slate-300">Research Query</Label>
                  <Textarea
                    {...registerResearch('query')}
                    className="mt-1.5 min-h-[80px] glass text-white text-sm"
                    placeholder="What do you want to research?"
                  />
                  {errorsResearch.query && (
                    <p className="text-xs text-red-400 mt-1">{errorsResearch.query.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm text-slate-300">Source URLs (Optional)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addUrl}
                      disabled={urls.length >= 5}
                      className="h-6 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {urls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => updateUrl(index, e.target.value)}
                          className="flex-1 h-8 text-sm glass"
                          placeholder="https://example.com"
                        />
                        {urls.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUrl(index)}
                            className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-slate-300">Max Sources</Label>
                  <select
                    {...registerResearch('maxSources', { valueAsNumber: true })}
                    className="mt-1.5 w-full h-9 rounded-md border border-slate-700 bg-slate-900/50 px-3 text-sm text-white glass"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} source{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleSubmitResearch(handleResearch)}
                  className="w-full h-9"
                  variant="futuristic"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start Research
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Context */}
        <Card className="liquid-glass bg-slate-900/80 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Features</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              <span>Scrape any public website</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-green-400" />
              <span>Multi-source AI synthesis</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-purple-400" />
              <span>Automatic citations</span>
            </div>
          </div>
        </Card>
    </>
  );

  return (
    <>
    <div className="flex flex-col md:flex-row h-full gap-2 md:gap-4 p-2 md:p-4 with-bottom-nav">
      {/* Hamburger Button - Mobile Only */}
      {isMobile && (
        <button 
          className="hamburger-button hamburger-safe"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden md:block md:w-80 space-y-4 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="w-80 space-y-4 h-full overflow-y-auto p-4">
          <SidebarContent />
        </div>
      </Sheet>

      {/* WORK AREA */}
      <div className="flex-1 w-full md:w-auto min-w-0">
        <Card className="h-full liquid-glass bg-slate-900/70 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-400" />
                {activeMode === 'scrape' ? 'Scraped Content' : 'Research Results'}
              </h2>
              {result && !result.error && (
                <div className="flex items-center gap-2">
                  <Badge variant="glow" className="text-xs px-2 py-0.5">
                    {result.provider} • {result.model}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.content || result.synthesis || '')}
                    className="h-7 px-2"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {!result && !isLoading && (
              <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Search className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">Ready to Research</h3>
                    <p className="text-sm text-slate-400">
                      {activeMode === 'scrape'
                        ? 'Extract and analyze website content with AI'
                        : 'Enter a query for AI-powered research synthesis'}
                    </p>
                  </div>

                  {activeMode === 'research' && (
                    <>
                      {/* Example Topics */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Try These Topics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { icon: '🤖', query: 'Latest AI developments and breakthroughs in 2024' },
                            { icon: '💼', query: 'Best practices for remote team management and productivity' },
                            { icon: '⚛️', query: 'Compare React vs Vue for enterprise applications' },
                            { icon: '💰', query: 'Startup funding strategies and investor trends' }
                          ].map((topic, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                const queryInput = document.querySelector('textarea[name="query"]') as HTMLTextAreaElement;
                                if (queryInput) queryInput.value = topic.query;
                              }}
                              className="p-4 bg-slate-800/60 hover:scale-[1.02] border border-slate-700/50 hover:border-emerald-500/50 rounded-lg text-left transition-all group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="text-2xl flex-shrink-0">{topic.icon}</div>
                                <div className="flex-1">
                                  <div className="text-sm text-white group-hover:text-emerald-400 transition-colors">
                                    {topic.query}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* How It Works */}
                      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-white mb-3">How It Works</h4>
                        <div className="space-y-2 text-sm text-slate-300">
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400">1.</span>
                            <span>Enter your research query</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400">2.</span>
                            <span>Optionally add specific URLs to analyze</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400">3.</span>
                            <span>AI synthesizes information from multiple sources</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400">4.</span>
                            <span>Get cited results with source links</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeMode === 'scrape' && (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
                      <h4 className="text-sm font-medium text-white mb-3">Web Scraping Features</h4>
                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-emerald-400" />
                          <span>Extract clean, structured content from any public website</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-400" />
                          <span>Automatic conversion to markdown format</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-emerald-400" />
                          <span>Extract metadata, images, and key information</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-300">
                    {activeMode === 'scrape' ? 'Scraping website...' : 'Researching sources...'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">This may take a moment</p>
                </div>
              </div>
            )}

            {result && result.error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <X className="h-7 w-7 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Research Failed</h3>
                  <p className="text-sm text-slate-400">{result.error}</p>
                </div>
              </div>
            )}

            {result && !result.error && activeMode === 'scrape' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Content</h3>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Original
                  </a>
                </div>

                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: result.content.replace(/\n/g, '<br>') }} />
                  </div>
                </div>

                {result.metadata && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Metadata</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.metadata).map(([key, value]) => (
                        <div key={key} className="bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/50">
                          <div className="text-xs text-slate-400 mb-0.5">{key}</div>
                          <div className="text-sm text-white font-medium truncate">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {result && !result.error && activeMode === 'research' && (
              <div className="space-y-4 animate-fade-in">
                {/* Query */}
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Research Query</div>
                  <p className="text-sm text-slate-200">{result.query}</p>
                </div>

                {/* 2-Column Layout: Synthesis + Sources */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left: AI Synthesis */}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-400" />
                      AI Synthesis
                    </h3>
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{result.synthesis}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Right: Sources + Metadata */}
                  <div className="lg:w-80 space-y-4">
                    {/* Sources */}
                    {result.sources && result.sources.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-emerald-400" />
                          Sources ({result.sources.length})
                        </h3>
                        <div className="space-y-2">
                          {result.sources.map((source: any, index: number) => (
                            <div key={index} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
                              <div className="flex items-start gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs flex-shrink-0">
                                  {index + 1}
                                </Badge>
                                <h4 className="text-sm font-medium text-white flex-1 line-clamp-1">
                                  {source.title || 'Untitled'}
                                </h4>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 flex-shrink-0"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                              {source.excerpt && (
                                <p className="text-xs text-slate-400 line-clamp-2 ml-6">{source.excerpt}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {result.provider && (
                      <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                        <h4 className="text-xs font-medium text-slate-400 mb-2">Processing Info</h4>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Provider</span>
                            <span className="text-white font-medium">{result.provider}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Model</span>
                            <span className="text-white font-medium">{result.model}</span>
                          </div>
                          {result.sources && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Sources</span>
                              <span className="text-white font-medium">{result.sources.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
    <BottomNav />
    </>
  );
}