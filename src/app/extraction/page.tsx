'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet } from '@/components/ui/sheet';
import { BottomNav } from '@/components/ui/bottom-nav';
import {
  FileText,
  Upload,
  Copy,
  Brain,
  FileImage,
  X,
  ArrowLeft,
  Loader2,
  Download,
  Table,
  Menu
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function ExtractionPage() {
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

  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError('');

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }

      const allowedTypes = [
        'text/plain',
        'text/csv',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ];

      const isCsvFile = file.name.toLowerCase().endsWith('.csv') &&
                       (file.type === 'text/csv' || file.type === 'application/octet-stream');

      if (!allowedTypes.includes(file.type) && !isCsvFile) {
        setUploadError('Unsupported file type');
        return;
      }

      setUploadedFile(file);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setUploadError('');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleExtract = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    setResult(null);
    setUploadError('');

    try {
      const extractResponse = await apiClient.extractData(uploadedFile);
      const jobId = extractResponse.data.job_id;

      const pollStatus = async () => {
        try {
          const response = await apiClient.makeRequest('get', `/processing/status/${jobId}`);
          const statusData = response.data;

          if (statusData.status === 'completed') {
            const resultData = {
              ...statusData.result,
              metadata: {
                ...statusData.result.metadata,
                file_type: uploadedFile.type,
                file_size: uploadedFile.size,
                file_name: uploadedFile.name,
                processing_time: statusData.duration,
                aws_cost: statusData.cost_estimate
              }
            };
            setResult(resultData);
            setIsLoading(false);
          } else if (statusData.status === 'failed') {
            setUploadError(`Processing failed: ${statusData.error}`);
            setIsLoading(false);
          } else {
            setTimeout(pollStatus, 2000);
          }
        } catch (error) {
          console.error('Status polling failed:', error);
          setTimeout(pollStatus, 2000);
        }
      };

      pollStatus();
    } catch (error: any) {
      setUploadError(`Extraction failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportData = async (format: 'csv' | 'json' | 'excel') => {
    if (!result) return;
    try {
      await apiClient.exportData(result, format);
    } catch (error) {
      console.error(`Export failed:`, error);
      if (format === 'json') {
        const content = JSON.stringify(result, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(content)}`;
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `extraction_${Date.now()}.json`);
        link.click();
      }
    }
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
            <Brain className="h-5 w-5 text-blue-400" />
            Data Extraction
          </h2>
          <p className="text-sm text-slate-400 mt-1">OCR & intelligent parsing</p>
        </Card>

        {/* Input Form */}
        <Card className="liquid-glass bg-slate-900/80 p-4">
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-slate-300">Upload Document</Label>
              
              <div className="mt-1.5 border-2 border-dashed border-slate-600/50 rounded-lg p-6 text-center hover:border-slate-500/50 transition-colors">
                <input
                  type="file"
                  accept=".txt,.csv,.pdf,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <label htmlFor="file-upload" className={`cursor-pointer ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
                  <Upload className={`h-8 w-8 mx-auto mb-2 ${uploadedFile ? 'text-green-400' : 'text-slate-400'}`} />
                  <p className={`text-sm font-medium ${uploadedFile ? 'text-green-300' : 'text-slate-300'}`}>
                    {uploadedFile ? 'File Selected' : 'Choose File'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, DOCX, Images (max 10MB)
                  </p>
                </label>
              </div>

              {uploadError && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                  {uploadError}
                </div>
              )}

              {uploadedFile && (
                <div className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0">
                      <Upload className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-slate-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                    </div>
                    {!isLoading && (
                      <button
                        onClick={clearFile}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleExtract}
              className="w-full h-9"
              disabled={!uploadedFile || isLoading}
              variant="futuristic"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Extract Data
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Context */}
        <Card className="liquid-glass bg-slate-900/80 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Supported Formats</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              <span>Documents: PDF, DOCX, TXT, CSV</span>
            </div>
            <div className="flex items-center gap-2">
              <FileImage className="h-3.5 w-3.5 text-green-400" />
              <span>Images: PNG, JPG, JPEG</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-purple-400" />
              <span>AI-powered OCR</span>
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
                <FileText className="h-5 w-5 text-blue-400" />
                Extraction Results
              </h2>
              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant="glow" className="text-xs px-2 py-0.5">
                    AI Processing
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                    className="h-7 px-2"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => exportData('json')}
                      className="h-7 px-2 text-xs"
                    >
                      JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => exportData('csv')}
                      className="h-7 px-2 text-xs"
                    >
                      CSV
                    </Button>
                  </div>
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
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Brain className="h-6 w-6 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">Ready to Extract</h3>
                    <p className="text-sm text-slate-400">Upload documents or images for AI-powered data extraction</p>
                  </div>

                  {/* Supported Formats */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Supported Formats</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { emoji: '📄', name: 'PDF', desc: 'Documents' },
                        { emoji: '📝', name: 'DOCX', desc: 'Word Files' },
                        { emoji: '📊', name: 'CSV/TXT', desc: 'Text Data' },
                        { emoji: '🖼️', name: 'Images', desc: 'PNG, JPG' }
                      ].map((format) => (
                        <div
                          key={format.name}
                          className="p-4 bg-slate-800/60 border border-slate-700/50 rounded-lg text-center"
                        >
                          <div className="text-3xl mb-2">{format.emoji}</div>
                          <div className="text-sm font-medium text-white mb-0.5">{format.name}</div>
                          <div className="text-xs text-slate-400">{format.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What Can Be Extracted */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">What Can Be Extracted</h4>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">✓</span>
                          <span>Text content from documents and images (OCR)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">✓</span>
                          <span>Tables with rows, columns, and structured data</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">✓</span>
                          <span>Form fields and key-value pairs</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">✓</span>
                          <span>Metadata (file info, author, dates)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Instructions */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Upload className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-white mb-1">Getting Started</h4>
                        <p className="text-sm text-slate-300">
                          Click "Choose File" in the left panel or drag and drop your document directly onto the upload area. 
                          Maximum file size is 10MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Processing Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                      <Brain className="h-5 w-5 text-amber-400 mx-auto mb-1.5" />
                      <div className="text-xs text-slate-400">AI-Powered OCR</div>
                    </div>
                    <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                      <FileText className="h-5 w-5 text-amber-400 mx-auto mb-1.5" />
                      <div className="text-xs text-slate-400">Structured Output</div>
                    </div>
                    <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                      <Copy className="h-5 w-5 text-amber-400 mx-auto mb-1.5" />
                      <div className="text-xs text-slate-400">Export Ready</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-300">Processing document...</p>
                  <p className="text-xs text-slate-400 mt-1">This may take a moment</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-fade-in">
                {/* Extracted Text */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Extracted Text
                  </h3>
                  <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                    {result.text ? (
                      <div className="prose prose-sm prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {result.text}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No text extracted</p>
                    )}
                  </div>
                </div>

                {/* Extracted Tables */}
                {result.tables && result.tables.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      Tables ({result.tables.length})
                    </h3>
                    <div className="space-y-3">
                      {result.tables.map((table: any, idx: number) => (
                        <div key={idx} className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-white">{table.name || `Table ${idx + 1}`}</h4>
                            <Badge variant="outline" className="text-xs">
                              {table.row_count} × {table.column_count}
                            </Badge>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="border-b border-slate-700">
                                <tr>
                                  {table.columns.map((col: string, colIdx: number) => (
                                    <th key={colIdx} className="text-left p-2 text-slate-400 font-medium">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows.slice(0, 5).map((row: any, rowIdx: number) => (
                                  <tr key={rowIdx} className="border-b border-slate-700/50">
                                    {table.columns.map((col: string, colIdx: number) => (
                                      <td key={colIdx} className="p-2 text-slate-200">
                                        {String(row[col] || '')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                                {table.rows.length > 5 && (
                                  <tr>
                                    <td colSpan={table.columns.length} className="p-2 text-center text-slate-400 italic text-xs">
                                      ... and {table.rows.length - 5} more rows
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {result.metadata && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Metadata</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.metadata).map(([key, value]) => (
                        <div key={key} className="bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/50">
                          <div className="text-xs text-slate-400 mb-0.5">{key.replace('_', ' ')}</div>
                          <div className="text-sm text-white font-medium truncate">{String(value)}</div>
                        </div>
                      ))}
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