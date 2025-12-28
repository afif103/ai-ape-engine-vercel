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
  Zap
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

export default function BatchProcessingPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [batchJob, setBatchJob] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const batchName = watch('name');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    // Validate files
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert(`File "${file.name}" is too large. Maximum size: 10MB`);
        return false;
      }
      if (!ALLOWED_TYPES.includes(file.type) &&
          !(file.type === 'application/octet-stream' && file.name.toLowerCase().endsWith('.csv'))) {
        alert(`File type "${file.type}" not supported for "${file.name}"`);
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
      alert('Please select at least one file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(fileItem => {
        formData.append('files', fileItem.file);
      });
      formData.append('batch_name', data.name);

      // Update file statuses
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

      // Start polling for status
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

          // Update file progress based on batch status
          if (status.status === 'completed' || status.status === 'completed_with_errors') {
            // Could fetch individual file statuses here
            return; // Stop polling
          }
        }
      } catch (error) {
        console.error('Error polling batch status:', error);
      }

      // Continue polling every 2 seconds
      setTimeout(poll, 2000);
    };

    poll();
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      queued: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
      completed_with_errors: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-slate-700"></div>
              <h1 className="text-xl font-semibold text-white">Batch Processing</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!batchJob ? (
          /* Upload Form */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Process Multiple Files</h2>
              <p className="text-slate-300 text-lg">
                Upload up to 10 files simultaneously for batch processing with AI analysis
              </p>
            </div>

            <Card className="bg-slate-900/70 border-slate-700/70 p-8 backdrop-blur-sm">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Batch Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white text-base">Batch Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    className="glass text-white"
                    placeholder="Enter a name for this batch"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-400">{errors.name.message}</p>
                  )}
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <Label className="text-white text-base">Files to Process</Label>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
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
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-300 mb-2">
                        Click to select files or drag and drop
                      </p>
                      <p className="text-sm text-slate-500">
                        CSV, TXT, PDF, DOCX, Images (max 10MB each, up to 10 files)
                      </p>
                    </label>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300 font-medium">
                        {files.length} file{files.length !== 1 ? 's' : ''} selected
                      </p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {files.map((fileItem) => (
                          <div
                            key={fileItem.id}
                            className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getFileIcon(fileItem.file.type)}
                              <div>
                                <p className="text-white text-sm font-medium truncate max-w-xs">
                                  {fileItem.file.name}
                                </p>
                                <p className="text-slate-400 text-xs">
                                  {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(fileItem.status)}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(fileItem.id)}
                                disabled={isUploading}
                                className="text-slate-400 hover:text-red-400"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isUploading || files.length === 0}
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing Batch...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Batch Processing
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        ) : (
          /* Processing Status */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Batch Processing Status</h2>
              <div className="flex items-center justify-center space-x-4 mb-6">
                {getStatusBadge(batchJob.status)}
                <span className="text-slate-300">
                  {batchJob.processed_files}/{batchJob.total_files} files processed
                </span>
              </div>
            </div>

            <Card className="bg-slate-900/70 border-slate-700/70 p-8 backdrop-blur-sm">
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Overall Progress</span>
                    <span className="text-white font-medium">{Math.round(batchJob.progress)}%</span>
                  </div>
                  <Progress value={batchJob.progress} className="h-3" />
                </div>

                {/* Batch Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{batchJob.total_files}</p>
                    <p className="text-sm text-slate-400">Total Files</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{batchJob.processed_files}</p>
                    <p className="text-sm text-slate-400">Processed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{batchJob.failed_files}</p>
                    <p className="text-sm text-slate-400">Failed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">${batchJob.actual_cost?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-slate-400">Cost</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Dashboard
                  </Button>
                  {batchJob.status === 'completed' && (
                    <Button className="flex-1">
                      View Results
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}