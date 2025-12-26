'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Code,
  Play,
  FileText,
  Lightbulb,
  Wrench,
  Zap,
  Copy,
  Download,
  Settings
} from 'lucide-react';
import { apiClient } from '@/lib/api';

// Form schemas
const generateSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  language: z.string().min(1, 'Language is required'),
  context: z.string().optional(),
});

const reviewSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.string().min(1, 'Language is required'),
  focus: z.string().optional(),
});

const explainSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.string().min(1, 'Language is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
});

const fixSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  error: z.string().min(1, 'Error message is required'),
  language: z.string().min(1, 'Language is required'),
});

type GenerateForm = z.infer<typeof generateSchema>;
type ReviewForm = z.infer<typeof reviewSchema>;
type ExplainForm = z.infer<typeof explainSchema>;
type FixForm = z.infer<typeof fixSchema>;

export default function CodePage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'review' | 'explain' | 'fix'>('generate');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'generate', label: 'Generate', icon: Zap, description: 'Create code from descriptions' },
    { id: 'review', label: 'Review', icon: FileText, description: 'Analyze code quality' },
    { id: 'explain', label: 'Explain', icon: Lightbulb, description: 'Understand code logic' },
    { id: 'fix', label: 'Fix', icon: Wrench, description: 'Debug and correct errors' },
  ];

  const handleGenerate = async (data: GenerateForm) => {
    setIsLoading(true);
    try {
      const response = await apiClient.generateCode(data.description, data.language, data.context);
      setResult({ type: 'generate', ...response.data });
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (data: ReviewForm) => {
    setIsLoading(true);
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
    try {
      const response = await apiClient.explainCode(data.code, data.language, data.level);
      setResult({ type: 'explain', ...response.data });
    } catch (error) {
      console.error('Explanation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFix = async (data: FixForm) => {
    setIsLoading(true);
    try {
      const response = await apiClient.fixCode(data.code, data.error, data.language);
      setResult({ type: 'fix', ...response.data });
    } catch (error) {
      console.error('Fix failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Left Panel - Controls */}
      <div className="w-80 space-y-4">
        {/* Tab Selection */}
        <Card className="liquid-glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Code className="h-5 w-5 mr-2 text-primary" />
              Code Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full p-3 rounded-lg border transition-all duration-300 text-left ${
                  activeTab === tab.id
                    ? 'bg-primary/20 border-primary/50 glow'
                    : 'bg-card/50 border-border/50 glass hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className={`h-5 w-5 mr-3 ${
                    activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-muted-foreground">{tab.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Action Form */}
        <Card className="liquid-glass">
          <CardContent className="p-4">
            {activeTab === 'generate' && <GenerateForm onSubmit={handleGenerate} isLoading={isLoading} />}
            {activeTab === 'review' && <ReviewForm onSubmit={handleReview} isLoading={isLoading} />}
            {activeTab === 'explain' && <ExplainForm onSubmit={handleExplain} isLoading={isLoading} />}
            {activeTab === 'fix' && <FixForm onSubmit={handleFix} isLoading={isLoading} />}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1">
        <Card className="h-full liquid-glass flex flex-col">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2 text-primary" />
                AI Response
              </CardTitle>
              {result && (
                <div className="flex items-center space-x-2">
                  <Badge variant="glow">
                    {result.provider} • {result.model}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.content || result.result || result.review || result.explanation)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full overflow-y-auto p-4">
              {!result && !isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Code className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Ready to Assist</h3>
                    <p className="text-slate-300">
                      Select an action and provide your code or description to get AI assistance.
                    </p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-pulse-glow w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-300">AI is analyzing your code...</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4 animate-fade-in">
                  {result.type === 'generate' && (
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Generated Code ({result.language})</h4>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{result.content}</code>
                      </pre>
                    </div>
                  )}

                  {result.type === 'review' && (
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Code Review Results</h4>
                      <div className="prose prose-sm max-w-none text-slate-200">
                        <div dangerouslySetInnerHTML={{
                          __html: result.review.replace(/\n/g, '<br>')
                        }} />
                      </div>
                    </div>
                  )}

                  {result.type === 'explain' && (
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Code Explanation ({result.level} level)</h4>
                      <div className="prose prose-sm max-w-none text-slate-200">
                        <div dangerouslySetInnerHTML={{
                          __html: result.explanation.replace(/\n/g, '<br>')
                        }} />
                      </div>
                    </div>
                  )}

                  {result.type === 'fix' && (
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Fixed Code ({result.language})</h4>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{result.result}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Form Components
function GenerateForm({ onSubmit, isLoading }: { onSubmit: (data: GenerateForm) => void; isLoading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe what you want the code to do..."
          className="min-h-[100px] glass"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="language">Language</Label>
        <Input
          id="language"
          placeholder="python"
          className="liquid-glass"
          {...register('language')}
        />
      </div>

      <div>
        <Label htmlFor="context">Additional Context (Optional)</Label>
        <Textarea
          id="context"
          placeholder="Any additional requirements or context..."
          className="min-h-[60px] glass"
          {...register('context')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} variant="futuristic">
        {isLoading ? 'Generating...' : 'Generate Code'}
      </Button>
    </form>
  );
}

function ReviewForm({ onSubmit, isLoading }: { onSubmit: (data: ReviewForm) => void; isLoading: boolean }) {
  const [code, setCode] = useState('');
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
  });

  const handleCodeChange = (value: string | undefined) => {
    const codeValue = value || '';
    setCode(codeValue);
    setValue('code', codeValue);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="code">Code to Review</Label>
        <div className="border border-slate-700/50 rounded-lg overflow-hidden">
          <Editor
            height="200px"
            language="python"
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
            }}
          />
        </div>
        {errors.code && (
          <p className="text-sm text-red-400 mt-1">{errors.code.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="language">Language</Label>
        <Input
          id="language"
          placeholder="python"
          className="liquid-glass"
          {...register('language')}
        />
      </div>

      <div>
        <Label htmlFor="focus">Focus Area (Optional)</Label>
        <Input
          id="focus"
          placeholder="e.g., security, performance, readability"
          className="liquid-glass"
          {...register('focus')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} variant="futuristic">
        {isLoading ? 'Reviewing...' : 'Review Code'}
      </Button>
    </form>
  );
}

function ExplainForm({ onSubmit, isLoading }: { onSubmit: (data: ExplainForm) => void; isLoading: boolean }) {
  const [code, setCode] = useState('');
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ExplainForm>({
    resolver: zodResolver(explainSchema),
  });

  const handleCodeChange = (value: string | undefined) => {
    const codeValue = value || '';
    setCode(codeValue);
    setValue('code', codeValue);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="code">Code to Explain</Label>
        <div className="border border-slate-700/50 rounded-lg overflow-hidden">
          <Editor
            height="200px"
            language="python"
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
            }}
          />
        </div>
        {errors.code && (
          <p className="text-sm text-red-400 mt-1">{errors.code.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="language">Language</Label>
        <Input
          id="language"
          placeholder="python"
          className="liquid-glass"
          {...register('language')}
        />
      </div>

      <div>
        <Label htmlFor="level">Explanation Level</Label>
        <select
          className="w-full p-2 rounded-md border border-input bg-background glass"
          {...register('level')}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} variant="futuristic">
        {isLoading ? 'Explaining...' : 'Explain Code'}
      </Button>
    </form>
  );
}

function FixForm({ onSubmit, isLoading }: { onSubmit: (data: FixForm) => void; isLoading: boolean }) {
  const [code, setCode] = useState('');
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FixForm>({
    resolver: zodResolver(fixSchema),
  });

  const handleCodeChange = (value: string | undefined) => {
    const codeValue = value || '';
    setCode(codeValue);
    setValue('code', codeValue);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="code">Code with Error</Label>
        <div className="border border-slate-700/50 rounded-lg overflow-hidden">
          <Editor
            height="200px"
            language="python"
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
            }}
          />
        </div>
        {errors.code && (
          <p className="text-sm text-red-400 mt-1">{errors.code.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="error">Error Message</Label>
        <Textarea
          id="error"
          placeholder="Paste the error message here..."
          className="min-h-[80px] glass font-mono text-sm"
          {...register('error')}
        />
        {errors.error && (
          <p className="text-sm text-destructive mt-1">{errors.error.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="language">Language</Label>
        <Input
          id="language"
          placeholder="python"
          className="liquid-glass"
          {...register('language')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} variant="futuristic">
        {isLoading ? 'Fixing...' : 'Fix Code'}
      </Button>
    </form>
  );
}