'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Globe,
  BookOpen,
  ExternalLink,
  Copy,
  Download,
  Plus,
  X,
  Upload,
  FileText,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';

// Form schemas
const scrapeSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
});

const researchSchema = z.object({
  query: z.string().min(10, 'Query must be at least 10 characters'),
  urls: z.array(z.string().url()).max(10, 'Maximum 10 URLs allowed').optional(),
  maxSources: z.number().min(1).max(10),
});

type ScrapeForm = z.infer<typeof scrapeSchema>;
type ResearchForm = z.infer<typeof researchSchema>;

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState<'scrape' | 'research'>('scrape');
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [researchResult, setResearchResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [urlInputs, setUrlInputs] = useState<string[]>(['']);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsLoading(true);

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);

        // Upload file to backend
        const response = await apiClient.uploadFile(formData);
        setFileContent(response.data.content);

        // Show success message
        alert(`File "${file.name}" uploaded successfully! (${response.data.word_count} words)`);
      } catch (error: any) {
        console.error('File upload failed:', error);
        alert('File upload failed. Please try again.');
        setUploadedFile(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const tabs = [
    { id: 'scrape', label: 'Scrape URL', icon: Globe, description: 'Extract content from a single website' },
    { id: 'research', label: 'Research Topic', icon: BookOpen, description: 'Deep research with multiple sources' },
  ];

  const handleScrape = async (data: ScrapeForm) => {
    setIsLoading(true);
    setScrapeResult(null);
    try {
      const response = await apiClient.scrapeUrl(data.url);
      setScrapeResult(response.data);
    } catch (error) {
      console.error('Scraping failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addUrlInput = () => {
    setUrlInputs([...urlInputs, '']);
  };

  const removeUrlInput = (index: number) => {
    setUrlInputs(urlInputs.filter((_, i) => i !== index));
  };

  const updateUrlInput = (index: number, value: string) => {
    const newInputs = [...urlInputs];
    newInputs[index] = value;
    setUrlInputs(newInputs);
  };

  const handleResearch = async (data: ResearchForm) => {
    setIsLoading(true);
    setResearchResult(null);
    try {
      // Filter out empty URLs and validate them
      const validUrls = data.urls?.filter(url => url.trim()).map(url => url.trim()) || [];

      // If we have uploaded file content, include it in the query
      let enhancedQuery = data.query;
      let researchMethod = 'query_only';

      if (fileContent && validUrls.length > 0) {
        enhancedQuery = `${data.query}\n\nDocument Content:\n${fileContent}`;
        researchMethod = 'documents_and_urls';
      } else if (fileContent) {
        enhancedQuery = `${data.query}\n\nDocument Content:\n${fileContent}`;
        researchMethod = 'documents_only';
      } else if (validUrls.length > 0) {
        researchMethod = 'urls_only';
      }

      const response = await apiClient.researchTopic(enhancedQuery, validUrls, data.maxSources);

      // Add method info to response
      setResearchResult({
        ...response.data,
        method: researchMethod,
        urls_used: validUrls.length,
        documents_used: fileContent ? 1 : 0
      });
    } catch (error: any) {
      console.error('Research failed:', error);
      // Show user-friendly error message
      setResearchResult({
        error: error.response?.data?.detail || 'Research failed. Please check your inputs and try again.',
        success: false
      });
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
              <Search className="h-5 w-5 mr-2 text-primary" />
              Research Tools
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
            {activeTab === 'scrape' && (
              <ScrapeForm onSubmit={handleScrape} isLoading={isLoading} />
            )}
            {activeTab === 'research' && (
              <ResearchForm
                onSubmit={handleResearch}
                isLoading={isLoading}
                urlInputs={urlInputs}
                onAddUrl={addUrlInput}
                onRemoveUrl={removeUrlInput}
                onUpdateUrl={updateUrlInput}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1">
        <Card className="h-full liquid-glass flex flex-col">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                {activeTab === 'scrape' ? 'Scraped Content' : 'Research Results'}
              </CardTitle>
               {(scrapeResult || researchResult) && (
                 <div className="flex items-center space-x-2">
                   <Badge variant="glow">
                     {scrapeResult?.provider || researchResult?.provider} • {scrapeResult?.model || researchResult?.model}
                   </Badge>
                   {researchResult?.method && (
                     <Badge variant="secondary">
                       {researchResult.method === 'query_only' && 'Query Only'}
                       {researchResult.method === 'urls_only' && `${researchResult.urls_used} URLs`}
                       {researchResult.method === 'documents_only' && 'Document Analysis'}
                       {researchResult.method === 'documents_and_urls' && `Doc + ${researchResult.urls_used} URLs`}
                     </Badge>
                   )}
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => copyToClipboard(
                       scrapeResult?.content || researchResult?.synthesis || ''
                     )}
                   >
                     <Copy className="h-4 w-4" />
                   </Button>
                 </div>
               )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full overflow-y-auto p-4">
              {!scrapeResult && !researchResult && !isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Ready to Research</h3>
                    <p className="text-slate-300">
                      {activeTab === 'scrape'
                        ? 'Enter a URL to scrape content from a website.'
                        : 'Enter a research query and URLs to get AI-powered analysis.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-pulse-glow w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-300">
                      {activeTab === 'scrape' ? 'Scraping website...' : 'Researching across sources...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Scrape Results */}
              {scrapeResult && activeTab === 'scrape' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">Scraped Content</h4>
                    <a
                      href={scrapeResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Original
                    </a>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="prose prose-sm max-w-none text-slate-200">
                      <div dangerouslySetInnerHTML={{
                        __html: scrapeResult.content.replace(/\n/g, '<br>')
                      }} />
                    </div>
                  </div>

                  {scrapeResult.metadata && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2 text-white">Metadata</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(scrapeResult.metadata).map(([key, value]) => (
                          <div key={key} className="bg-muted/30 p-2 rounded text-slate-300">
                            <span className="font-medium text-white">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

               {/* Research Error */}
               {researchResult?.error && activeTab === 'research' && (
                 <div className="flex items-center justify-center h-full">
                   <div className="text-center max-w-md">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                      </div>
                     <h3 className="text-lg font-semibold mb-2 text-white">Research Failed</h3>
                     <p className="text-slate-300 mb-4">{researchResult.error}</p>
                     <p className="text-sm text-slate-400">
                       Try adjusting your query or check your inputs.
                     </p>
                   </div>
                 </div>
               )}

               {/* Research Results */}
               {researchResult && !researchResult.error && activeTab === 'research' && (
                 <div className="space-y-6 animate-fade-in">
                   <div>
                     <h4 className="font-semibold mb-2 text-white">Research Query</h4>
                     <p className="text-slate-300 bg-muted/30 p-3 rounded-lg">
                       {researchResult.query}
                     </p>
                   </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-white">AI Synthesis</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                       <div className="prose prose-sm max-w-none text-slate-200">
                         <div dangerouslySetInnerHTML={{
                           __html: researchResult.synthesis.replace(/\n/g, '<br>')
                         }} />
                       </div>
                      </div>
                    </div>

                   <div>
                     <h4 className="font-semibold mb-2 text-white">Sources ({researchResult.sources?.length || 0})</h4>
                     <div className="space-y-2">
                       {researchResult.sources?.map((source: any, index: number) => (
                         <div key={index} className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                           <div className="flex items-center space-x-2">
                             <Badge variant="secondary">{index + 1}</Badge>
                             <span className="font-medium text-white">{source.title || 'Untitled'}</span>
                           </div>
                           <a
                             href={source.url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center text-primary hover:underline"
                           >
                             <ExternalLink className="h-4 w-4" />
                           </a>
                         </div>
                       ))}
                     </div>
                   </div>
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
function ScrapeForm({ onSubmit, isLoading }: { onSubmit: (data: ScrapeForm) => void; isLoading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ScrapeForm>({
    resolver: zodResolver(scrapeSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="url">Website URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          className="liquid-glass"
          {...register('url')}
        />
        {errors.url && (
          <p className="text-sm text-destructive mt-1">{errors.url.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} variant="futuristic">
        {isLoading ? 'Scraping...' : 'Scrape Website'}
      </Button>
    </form>
  );
}

function ResearchForm({
  onSubmit,
  isLoading,
  urlInputs,
  onAddUrl,
  onRemoveUrl,
  onUpdateUrl
}: {
  onSubmit: (data: ResearchForm) => void;
  isLoading: boolean;
  urlInputs: string[];
  onAddUrl: () => void;
  onRemoveUrl: (index: number) => void;
  onUpdateUrl: (index: number, value: string) => void;
}) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ResearchForm>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      maxSources: 3,
    }
  });

  const onFormSubmit = (data: any) => {
    // Filter out empty URLs
    const validUrls = urlInputs.filter(url => url.trim());
    onSubmit({ ...data, urls: validUrls });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="query">Research Query</Label>
        <Textarea
          id="query"
          placeholder="What do you want to research?"
          className="min-h-[80px] glass"
          {...register('query')}
        />
        {errors.query && (
          <p className="text-sm text-destructive mt-1">{errors.query.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Source URLs</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddUrl}
            disabled={urlInputs.length >= 5}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add URL
          </Button>
        </div>

        <div className="space-y-2">
          {urlInputs.map((url, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => onUpdateUrl(index, e.target.value)}
                className="liquid-glass flex-1"
              />
              {urlInputs.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveUrl(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {errors.urls && (
          <p className="text-sm text-destructive mt-1">{errors.urls.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="maxSources">Maximum Sources</Label>
        <select
          id="maxSources"
          className="w-full p-2 rounded-md border border-input bg-background glass"
          {...register('maxSources', { valueAsNumber: true })}
        >
          <option value={1}>1 source</option>
          <option value={2}>2 sources</option>
          <option value={3}>3 sources</option>
          <option value={4}>4 sources</option>
          <option value={5}>5 sources</option>
        </select>
      </div>

      {/* File Upload */}
      <div>
        <Label>Upload Document (Optional)</Label>
        <div className="mt-2">
          <input
            type="file"
            accept=".txt,.md,.pdf,.doc,.docx"
            onChange={() => {}}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-600/50 rounded-lg cursor-pointer hover:border-slate-500 transition-colors bg-slate-900/50"
          >
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-400">
                {'Drop a document here or click to browse'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports: TXT, MD, PDF, DOC, DOCX (max 5MB)
              </p>
            </div>
          </label>
          {/* File status will be shown here */}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} variant="futuristic">
        {isLoading ? 'Researching...' : 'Start Research'}
      </Button>
    </form>
  );
}