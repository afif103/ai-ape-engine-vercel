'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  Image,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  Zap,
  Loader2
} from 'lucide-react';

const batchSchema = z.object({
  name: z.string().min(1, 'Batch name is required').max(100, 'Name too long'),
});

type BatchForm = z.infer<typeof batchSchema>;

interface FileItem {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  result?: any;
}

const ALLOWED_TYPES = [
  'text/plain',
  'text/csv',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

const getFileIcon = (type: string) => {
  if (type.startsWith('text/') || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return <FileText className="h-4 w-4" />;
  }
  if (type.startsWith('image/')) {
    return <Image className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'processing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'uploading': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
};

export default function BatchProcessingPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [batchJob, setBatchJob] = useState<any>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<BatchForm>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: `Batch ${new Date().toLocaleDateString()}`
    }
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    const validFiles = selectedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 10MB limit`);
        return false;
      }
      if (!ALLOWED_TYPES.includes(file.type) &&
          !(file.type === 'application/octet-stream' && file.name.toLowerCase().endsWith('.csv'))) {
        alert(`"${file.name}" format not supported`);
        return false;
      }
      return true;
    });

    if (validFiles.length + files.length > 10) {
      alert('Maximum 10 files per batch');
      return;
    }

    const newFileItems: FileItem[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFileItems]);
  }, [files.length]);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const onSubmit = async (data: BatchForm) => {
    if (files.length === 0) {
      alert('Add at least one file');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach(fileItem => {
        formData.append('files', fileItem.file);
      });
      formData.append('batch_name', data.name);

      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })));

      const response = await fetch('/api/v1/batch/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const result = await response.json();
      setBatchJob(result);
      pollBatchStatus(result.batch_job_id);

    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'failed', error: error.message })));
    } finally {
      setIsUploading(false);
    }
  };

  const pollBatchStatus = async (batchJobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/v1/batch/status/${batchJobId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (response.ok) {
          const status = await response.json();
          setBatchJob(status);

          if (status.status === 'completed' || status.status === 'completed_with_errors') {
            return;
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      setTimeout(poll, 2000);
    };

    poll();
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Left Panel - Controls */}
      <div className="w-80 space-y-4">
        <Card className="liquid-glass bg-slate-900/80 p-4">
          <div className="space-y-4">
            <div>
              <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back
              </Link>
              <h2 className="text-lg font-semibold text-white mt-2 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-400" />
                Batch Processing
              </h2>
              <p className="text-sm text-slate-400 mt-1">Process up to 10 files</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-slate-300">Batch Name</Label>
                <Input
                  {...register('name')}
                  className="mt-1.5 glass text-white h-9"
                  placeholder="My batch job"
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label className="text-sm text-slate-300">Files ({files.length}/10)</Label>
                <div className="mt-1.5 border-2 border-dashed border-slate-600/50 rounded-lg p-6 text-center hover:border-slate-500/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".csv,.txt,.pdf,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-300 font-medium">Choose Files</p>
                    <p className="text-xs text-slate-500 mt-1">
                      CSV, TXT, PDF, DOCX, Images
                    </p>
                  </label>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {files.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50"
                    >
                      <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${getStatusColor(fileItem.status)}`}>
                        {fileItem.status === 'completed' && <CheckCircle className="h-3.5 w-3.5" />}
                        {fileItem.status === 'failed' && <AlertCircle className="h-3.5 w-3.5" />}
                        {(fileItem.status === 'processing' || fileItem.status === 'uploading') && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {fileItem.status === 'pending' && getFileIcon(fileItem.file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{fileItem.file.name}</p>
                        <p className="text-xs text-slate-400">{(fileItem.file.size / 1024 / 1024).toFixed(1)}MB</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileItem.id)}
                        disabled={isUploading}
                        className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="w-full h-9"
                disabled={isUploading || files.length === 0}
                variant="futuristic"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Batch
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="liquid-glass bg-slate-900/80 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Supported Formats</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              <span>Documents: PDF, DOCX, TXT, CSV</span>
            </div>
            <div className="flex items-center gap-2">
              <Image className="h-3.5 w-3.5 text-green-400" />
              <span>Images: PNG, JPG, JPEG</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-purple-400" />
              <span>Max: 10MB per file, 10 files total</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Panel - Status/Results */}
      <div className="flex-1">
        <Card className="h-full liquid-glass bg-slate-900/70 flex flex-col">
          {!batchJob ? (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">Batch Processing</h3>
                  <p className="text-sm text-slate-400">Process multiple files simultaneously with AI</p>
                </div>

                {/* How It Works - 3 Step Flow */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">How It Works</h4>
                  <div className="flex flex-col md:flex-row gap-4">
                    {[
                      { step: '1', emoji: '📤', title: 'Upload', desc: 'Add up to 10 files' },
                      { step: '2', emoji: '⚡', title: 'Process', desc: 'AI extracts data' },
                      { step: '3', emoji: '📥', title: 'Export', desc: 'Download results' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex-1">
                        <div className="relative">
                          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 text-center">
                            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <span className="text-xl">{item.emoji}</span>
                            </div>
                            <div className="text-xs font-medium text-cyan-400 mb-1">Step {item.step}</div>
                            <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                            <div className="text-xs text-slate-400">{item.desc}</div>
                          </div>
                          {idx < 2 && (
                            <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-cyan-400">
                              →
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Limits & Requirements</h4>
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">Max 10 files</div>
                          <div className="text-xs text-slate-400">per batch job</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Upload className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">Max 10MB</div>
                          <div className="text-xs text-slate-400">per file</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <File className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">Multiple formats</div>
                          <div className="text-xs text-slate-400">PDF, DOCX, Images, CSV</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Getting Started */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Getting Started</h4>
                      <p className="text-sm text-slate-300 mb-2">
                        1. Enter a batch name in the left panel<br/>
                        2. Click "Choose Files" or drag and drop your files<br/>
                        3. Click "Start Batch" to begin processing
                      </p>
                      <p className="text-xs text-slate-400">
                        Results will appear here with real-time progress tracking and downloadable exports.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg text-center">
                    <Clock className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
                    <div className="text-xs font-medium text-white mb-0.5">Real-time Progress</div>
                    <div className="text-xs text-slate-400">Track each file</div>
                  </div>
                  <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg text-center">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
                    <div className="text-xs font-medium text-white mb-0.5">Error Handling</div>
                    <div className="text-xs text-slate-400">Continues on failure</div>
                  </div>
                  <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg text-center">
                    <Zap className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
                    <div className="text-xs font-medium text-white mb-0.5">Fast Processing</div>
                    <div className="text-xs text-slate-400">Parallel execution</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white">Batch Status</h2>
                  <Badge className={`${
                    batchJob.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    batchJob.status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}>
                    {batchJob.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-medium">{Math.round(batchJob.progress)}%</span>
                  </div>
                  <Progress value={batchJob.progress} className="h-2" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                    <div className="text-2xl font-bold text-blue-400">{batchJob.total_files}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Total</div>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                    <div className="text-2xl font-bold text-green-400">{batchJob.processed_files}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Processed</div>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                    <div className="text-2xl font-bold text-red-400">{batchJob.failed_files || 0}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Failed</div>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                    <div className="text-2xl font-bold text-yellow-400">${batchJob.actual_cost?.toFixed(2) || '0.00'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Cost</div>
                  </div>
                </div>

                {batchJob.status === 'completed' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white">Processed Files</h3>
                    <div className="text-sm text-slate-400">
                      All {batchJob.total_files} files processed successfully
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-800/50 flex gap-3">
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
                {batchJob.status === 'completed' && (
                  <Button className="flex-1" variant="futuristic">
                    View Results
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}