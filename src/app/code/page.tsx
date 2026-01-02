'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/contexts/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Editor from '@monaco-editor/react';
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
  Code,
  FileText,
  Lightbulb,
  Wrench,
  Zap,
  Copy,
  ArrowLeft,
  Loader2,
  Menu
} from 'lucide-react';
import { apiClient } from '@/lib/api';

const generateSchema = z.object({
  description: z.string().min(10, 'Description required (10+ chars)'),
  language: z.string().min(1, 'Language required'),
  context: z.string().optional(),
});

const reviewSchema = z.object({
  code: z.string().min(1, 'Code required'),
  language: z.string().min(1, 'Language required'),
  focus: z.string().optional(),
});

const explainSchema = z.object({
  code: z.string().min(1, 'Code required'),
  language: z.string().min(1, 'Language required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
});

const fixSchema = z.object({
  code: z.string().min(1, 'Code required'),
  error: z.string().min(1, 'Error message required'),
  language: z.string().min(1, 'Language required'),
});

type GenerateForm = z.infer<typeof generateSchema>;
type ReviewForm = z.infer<typeof reviewSchema>;
type ExplainForm = z.infer<typeof explainSchema>;
type FixForm = z.infer<typeof fixSchema>;

export default function CodePage() {
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

  const [activeMode, setActiveMode] = useState<'generate' | 'review' | 'explain' | 'fix'>('generate');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const modes = [
    { id: 'generate', label: 'Generate', description: 'Create from description', icon: Zap },
    { id: 'review', label: 'Review', description: 'Analyze code quality', icon: FileText },
    { id: 'explain', label: 'Explain', description: 'Understand logic', icon: Lightbulb },
    { id: 'fix', label: 'Fix', description: 'Debug & correct', icon: Wrench },
  ];

  const { register: registerGenerate, handleSubmit: handleSubmitGenerate, formState: { errors: errorsGenerate } } = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
  });

  const { register: registerReview, handleSubmit: handleSubmitReview, formState: { errors: errorsReview }, setValue: setValueReview } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
  });

  const { register: registerExplain, handleSubmit: handleSubmitExplain, formState: { errors: errorsExplain }, setValue: setValueExplain } = useForm<ExplainForm>({
    resolver: zodResolver(explainSchema),
  });

  const { register: registerFix, handleSubmit: handleSubmitFix, formState: { errors: errorsFix }, setValue: setValueFix } = useForm<FixForm>({
    resolver: zodResolver(fixSchema),
  });

  const handleGenerate = async (data: GenerateForm) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await apiClient.generateCode(data.description, data.language, data.context);
      setResult({ type: 'generate', ...response.data });
    } catch (error) {
      console.error('Generate failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (data: ReviewForm) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await apiClient.reviewCode(data.code, data.language, data.focus);
      setResult({ type: 'review', ...response.data });
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplain = async (data: ExplainForm) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await apiClient.explainCode(data.code, data.language, data.level);
      setResult({ type: 'explain', ...response.data });
    } catch (error) {
      console.error('Explain failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFix = async (data: FixForm) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await apiClient.fixCode(data.code, data.error, data.language);
      setResult({ type: 'fix', ...response.data });
    } catch (error) {
      console.error('Fix failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    const codeValue = value || '';
    setCode(codeValue);
    if (activeMode === 'review') setValueReview('code', codeValue);
    if (activeMode === 'explain') setValueExplain('code', codeValue);
    if (activeMode === 'fix') setValueFix('code', codeValue);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
          <Code className="h-5 w-5 text-blue-400" />
          Code Assistant
        </h2>
        <p className="text-sm text-slate-400 mt-1">Generate, review & debug code</p>
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
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'border-slate-700/50 hover:scale-[1.02]'
              }`}
            >
              <div className="flex items-center gap-2">
                <mode.icon className={`h-4 w-4 ${activeMode === mode.id ? 'text-purple-400' : 'text-slate-400'}`} />
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
          {activeMode === 'generate' && (
            <>
              <div>
                <Label className="text-sm text-slate-300">Description</Label>
                <Textarea
                  {...registerGenerate('description')}
                  className="mt-1.5 min-h-[100px] glass text-white text-sm"
                  placeholder="Describe what you want..."
                />
                {errorsGenerate.description && (
                  <p className="text-xs text-red-400 mt-1">{errorsGenerate.description.message}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-slate-300">Language</Label>
                <Input
                  {...registerGenerate('language')}
                  className="mt-1.5 h-9 glass text-white"
                  placeholder="python"
                />
              </div>
              <div>
                <Label className="text-sm text-slate-300">Context (Optional)</Label>
                <Textarea
                  {...registerGenerate('context')}
                  className="mt-1.5 min-h-[60px] glass text-white text-sm"
                  placeholder="Additional context..."
                />
              </div>
              <Button
                onClick={handleSubmitGenerate(handleGenerate)}
                className="w-full h-9"
                variant="futuristic"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>
            </>
          )}

          {activeMode === 'review' && (
            <>
              <div>
                <Label className="text-sm text-slate-300">Code to Review</Label>
                <div className="mt-1.5 border border-slate-700/50 rounded-lg overflow-hidden">
                  <Editor
                    height="200px"
                    language="python"
                    value={code}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
                {errorsReview.code && (
                  <p className="text-xs text-red-400 mt-1">{errorsReview.code.message}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-slate-300">Language</Label>
                <Input
                  {...registerReview('language')}
                  className="mt-1.5 h-9 glass text-white"
                  placeholder="python"
                />
              </div>
              <div>
                <Label className="text-sm text-slate-300">Focus (Optional)</Label>
                <Input
                  {...registerReview('focus')}
                  className="mt-1.5 h-9 glass text-white"
                  placeholder="security, performance..."
                />
              </div>
              <Button
                onClick={handleSubmitReview(handleReview)}
                className="w-full h-9"
                variant="futuristic"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Review Code
                  </>
                )}
              </Button>
            </>
          )}

          {activeMode === 'explain' && (
            <>
              <div>
                <Label className="text-sm text-slate-300">Code to Explain</Label>
                <div className="mt-1.5 border border-slate-700/50 rounded-lg overflow-hidden">
                  <Editor
                    height="200px"
                    language="python"
                    value={code}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
                {errorsExplain.code && (
                  <p className="text-xs text-red-400 mt-1">{errorsExplain.code.message}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-slate-300">Language</Label>
                <Input
                  {...registerExplain('language')}
                  className="mt-1.5 h-9 glass text-white"
                  placeholder="python"
                />
              </div>
              <div>
                <Label className="text-sm text-slate-300">Level</Label>
                <select
                  {...registerExplain('level')}
                  className="mt-1.5 w-full h-9 rounded-md border border-slate-700 bg-slate-900/50 px-3 text-sm text-white glass"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <Button
                onClick={handleSubmitExplain(handleExplain)}
                className="w-full h-9"
                variant="futuristic"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Explaining...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Explain Code
                  </>
                )}
              </Button>
            </>
          )}

          {activeMode === 'fix' && (
            <>
              <div>
                <Label className="text-sm text-slate-300">Code with Error</Label>
                <div className="mt-1.5 border border-slate-700/50 rounded-lg overflow-hidden">
                  <Editor
                    height="180px"
                    language="python"
                    value={code}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
                {errorsFix.code && (
                  <p className="text-xs text-red-400 mt-1">{errorsFix.code.message}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-slate-300">Error Message</Label>
                <Textarea
                  {...registerFix('error')}
                  className="mt-1.5 min-h-[70px] glass text-white text-sm font-mono"
                  placeholder="Paste error here..."
                />
                {errorsFix.error && (
                  <p className="text-xs text-red-400 mt-1">{errorsFix.error.message}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-slate-300">Language</Label>
                <Input
                  {...registerFix('language')}
                  className="mt-1.5 h-9 glass text-white"
                  placeholder="python"
                />
              </div>
              <Button
                onClick={handleSubmitFix(handleFix)}
                className="w-full h-9"
                variant="futuristic"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4 mr-2" />
                    Fix Code
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
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>Multi-language support</span>
          </div>
          <div className="flex items-center gap-2">
            <Code className="h-3.5 w-3.5 text-purple-400" />
            <span>Syntax highlighting</span>
          </div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
            <span>Context-aware AI</span>
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
                <Code className="h-5 w-5 text-blue-400" />
                AI Response
              </h2>
              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant="glow" className="text-xs px-2 py-0.5">
                    {result.provider} • {result.model}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.content || result.result || result.review || result.explanation || '')}
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
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Code className="h-6 w-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">Ready to Code</h3>
                    <p className="text-sm text-slate-400">Select a language or task to get started</p>
                  </div>

                  {/* Current Mode Indicator */}
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-slate-400">Current Mode:</span>
                    <Badge variant="glow" className="text-purple-300">
                      {activeMode === 'generate' && '⚡ Generate'}
                      {activeMode === 'review' && '📝 Review'}
                      {activeMode === 'explain' && '💡 Explain'}
                      {activeMode === 'fix' && '🔧 Fix'}
                    </Badge>
                  </div>

                  {/* Popular Languages */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Popular Languages</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { emoji: '🐍', name: 'Python', code: 'python' },
                        { emoji: '📜', name: 'TypeScript', code: 'typescript' },
                        { emoji: '⚛️', name: 'React', code: 'javascript' },
                        { emoji: '🗄️', name: 'SQL', code: 'sql' }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            const langInput = document.querySelector('input[placeholder="python"]') as HTMLInputElement;
                            if (langInput) langInput.value = lang.code;
                          }}
                          className="p-4 bg-slate-800/60 hover:scale-[1.02] border border-slate-700/50 hover:border-purple-500/50 rounded-lg transition-all group"
                        >
                          <div className="text-3xl mb-2">{lang.emoji}</div>
                          <div className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
                            {lang.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Common Tasks */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Common Tasks</h4>
                    <div className="space-y-2">
                      {[
                        { task: 'Create a REST API endpoint with error handling', mode: 'generate' },
                        { task: 'Write unit tests for this function', mode: 'generate' },
                        { task: 'Refactor this code for better performance', mode: 'review' },
                        { task: 'Add TypeScript types to this JavaScript code', mode: 'generate' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (activeMode === 'generate') {
                              const descInput = document.querySelector('textarea[placeholder="Describe what you want..."]') as HTMLTextAreaElement;
                            if (descInput) descInput.value = item.task;
                          }
                        }}
                          className="w-full p-3 bg-slate-800/60 hover:scale-[1.02] border border-slate-700/50 hover:border-purple-500/50 rounded-lg text-left transition-all group flex items-start gap-3"
                        >
                          <div className="text-purple-400 mt-0.5">→</div>
                          <div className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors">
                            {item.task}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Features Info */}
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-3">What I Can Help With</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-400" />
                        <span>Generate code from descriptions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-400" />
                        <span>Review code quality & security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-purple-400" />
                        <span>Explain code logic step-by-step</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-purple-400" />
                        <span>Debug and fix errors</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-300">AI is analyzing...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-fade-in">
                {result.type === 'generate' && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Generated Code ({result.language})</h3>
                    <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-800/30">
                        <span className="text-xs text-slate-400">{result.language}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.content)}
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="p-4 text-xs text-slate-200 overflow-x-auto">
                        <code>{result.content}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {result.type === 'review' && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Code Review</h3>
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                      <div className="prose prose-sm prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {result.review}
                      </div>
                    </div>
                  </div>
                )}

                {result.type === 'explain' && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Explanation ({result.level})</h3>
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                      <div className="prose prose-sm prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {result.explanation}
                      </div>
                    </div>
                  </div>
                )}

                {result.type === 'fix' && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Fixed Code ({result.language})</h3>
                    <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-800/30">
                        <span className="text-xs text-slate-400">{result.language}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.result)}
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="p-4 text-xs text-slate-200 overflow-x-auto">
                        <code>{result.result}</code>
                      </pre>
                    </div>
                  </div>
                )}
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