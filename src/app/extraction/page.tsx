'use client';

import { useState } from 'react';
import { flushSync } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Upload,
  Download,
  Copy,
  Brain,
  FileImage,
  File,
  CheckCircle,
  X,
  Sparkles
} from 'lucide-react';
import InstructionPanel from '@/components/InstructionPanel';
import { apiClient } from '@/lib/api';

// Form schemas
const extractSchema = z.object({
  file_path: z.string().min(1, 'File path is required'),
});

type ExtractForm = z.infer<typeof extractSchema>;

export default function ExtractionPage() {
  const [result, setResult] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [processingJob, setProcessingJob] = useState<any>(null);
  const [statusPolling, setStatusPolling] = useState<NodeJS.Timeout | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError('');

    if (file) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setUploadError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'text/plain',
        'text/csv',
        'text/markdown',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ];

      // Special handling for CSV files that may come as application/octet-stream
      const isCsvFile = file.name.toLowerCase().endsWith('.csv') &&
                       (file.type === 'text/csv' || file.type === 'application/octet-stream');

      if (!allowedTypes.includes(file.type) && !isCsvFile) {
        setUploadError('Unsupported file type. Please upload TXT, CSV, MD, PDF, DOCX, PNG, or JPG files.');
        return;
      }

      setUploadedFile(file);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setUploadError('');
    // Reset the input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const pollProcessingStatus = async (jobId: string) => {
    try {
      console.log('Polling status for job:', jobId);
      // Use the API client for consistent authentication and base URL
      const response = await apiClient.makeRequest('get', `/processing/status/${jobId}`);
      const statusData = response.data;
      console.log('Status response:', statusData);

      if (statusData.status === 'completed') {
        // Processing complete, get results
        const resultData = {
          ...statusData.result,
          metadata: {
            ...statusData.result.metadata,
            file_type: uploadedFile?.type,
            file_size: uploadedFile?.size,
            file_name: uploadedFile?.name,
            job_id: jobId,
            processing_time: statusData.duration,
            aws_cost: statusData.cost_estimate
          },
          timestamp: Date.now()
        };

        setResult(resultData);
        setProcessingJob(null);
        setIsLoading(false);

        if (statusPolling) {
          clearInterval(statusPolling);
          setStatusPolling(null);
        }

      } else if (statusData.status === 'failed') {
        // Processing failed
        setUploadError(`Processing failed: ${statusData.error}`);
        setProcessingJob(null);
        setIsLoading(false);

        if (statusPolling) {
          clearInterval(statusPolling);
          setStatusPolling(null);
        }

      } else {
        // Still processing, update status
        setProcessingJob(statusData);
      }
    } catch (error) {
      console.error('Status polling failed:', error);
    }
  };

  const handleExtract = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    setResult(null);
    setProcessingJob(null);
    setUploadError('');

    try {
      // Call extraction API with the actual file
      const extractResponse = await apiClient.extractData(uploadedFile);
      console.log('API Response:', extractResponse.data);

      const jobId = extractResponse.data.job_id;

      // Start polling for status updates
      console.log('Starting polling for job:', jobId);
      setProcessingJob({ job_id: jobId, status: 'queued', progress: 0 });

      const pollingInterval = setInterval(() => {
        pollProcessingStatus(jobId);
      }, 2000); // Poll every 2 seconds

      setStatusPolling(pollingInterval);

    } catch (error: any) {
      console.error('Extraction failed:', error);

      // Show detailed error information
      const errorMessage = error.response?.data?.detail ||
                           error.message ||
                           'Network error occurred';

      setUploadError(`Extraction failed: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportData = async (format: 'csv' | 'json' | 'excel' | 'xml' | 'html') => {
    if (!result) {
      console.log('Export failed: No result data available');
      return;
    }

    console.log(`Starting export for format: ${format}`);

    try {
      // Use transformed data if available, otherwise edited data, otherwise original result
      const dataToExport = transformedData || editedData || result;
      console.log('Data to export:', dataToExport);

      // Call the export API
      console.log(`Calling apiClient.exportData for ${format}`);
      const response = await apiClient.exportData(dataToExport, format);
      console.log(`Export successful for ${format}:`, response);

    } catch (error: any) {
      console.error(`Export failed for format ${format}:`, error);
      console.error('Error details:', error.response?.data, error.response?.status, error.message);

      // Fallback to client-side export for JSON if API fails
      if (format === 'json') {
        console.log('Using JSON fallback');
        const dataToExport = transformedData || editedData || result;
        const content = JSON.stringify(dataToExport, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(content)}`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `extraction_${Date.now()}.json`);
        linkElement.click();
        console.log('JSON fallback download triggered');
      }
      // CSV and Excel have client-side fallbacks in apiClient.exportData
    }
  };

  const downloadResult = () => exportData('json');

  // Get the data to display (transformed if available, otherwise original)
  const displayData = transformedData || editedData || result;

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Left Panel - File Upload */}
      <div className="w-80 space-y-4">
        <Card className="liquid-glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Brain className="h-5 w-5 mr-2 text-primary" />
              Data Extraction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Upload Document</Label>
                <div className="mt-2 space-y-4">
                  {/* File Input */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".txt,.csv,.md,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className={`absolute inset-0 w-full h-full opacity-0 z-10 ${
                        isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      id="file-upload"
                      disabled={isLoading}
                    />
                    <div className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
                      isLoading
                        ? 'border-slate-600 bg-slate-800/30 cursor-not-allowed'
                        : uploadedFile
                        ? 'border-green-500/50 bg-green-500/5 cursor-pointer hover:border-green-400/70 hover:bg-green-500/10'
                        : 'border-slate-600/50 bg-slate-900/50 cursor-pointer hover:border-blue-400/70 hover:bg-blue-500/10'
                    }`}>
                      <div className="text-center">
                        <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${
                          uploadedFile ? 'text-green-400' : 'text-slate-400'
                        }`} />
                        <p className={`text-sm font-medium transition-colors ${
                          uploadedFile ? 'text-green-300' : 'text-slate-300'
                        }`}>
                          {isLoading ? 'Processing...' : uploadedFile ? 'File Selected' : 'Click to Choose File'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          TXT, CSV, MD, PDF, DOCX, PNG, JPG (max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {uploadError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{uploadError}</p>
                    </div>
                  )}

                  {/* File Preview */}
                  {uploadedFile && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isLoading ? 'bg-yellow-500/20' : 'bg-green-500/20'
                          }`}>
                            <Upload className={`h-5 w-5 ${
                              isLoading ? 'text-yellow-400' : 'text-green-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium truncate max-w-48">{uploadedFile.name}</p>
                             <p className="text-xs text-slate-400">
                               {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type.split('/')[1].toUpperCase()}
                             </p>
                             {processingJob && (
                               <div className="mt-2">
                                 <div className="flex items-center justify-between text-xs mb-1">
                                   <span className="text-slate-400">{processingJob.current_step || 'Processing...'}</span>
                                   <span className="text-slate-400">{processingJob.progress || 0}%</span>
                                 </div>
                                 <div className="w-full bg-slate-700 rounded-full h-1">
                                   <div
                                     className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                     style={{ width: `${processingJob.progress || 0}%` }}
                                   ></div>
                                 </div>
                                 {processingJob.aws_services_used && processingJob.aws_services_used.length > 0 && (
                                   <p className="text-xs text-purple-400 mt-1">
                                     Using: {processingJob.aws_services_used.join(', ')}
                                   </p>
                                 )}
                               </div>
                             )}
                             {isLoading && !processingJob && (
                               <p className="text-xs text-yellow-400 mt-1">Starting processing...</p>
                             )}
                          </div>
                        </div>
                        {!isLoading && (
                          <button
                            onClick={clearFile}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            title="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>



            <Button
              onClick={handleExtract}
              className="w-full"
              disabled={!uploadedFile || isLoading}
              variant="futuristic"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Extracting...</span>
                </div>
              ) : (
                'Extract Data'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Supported Formats */}
        <Card className="liquid-glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Supported Formats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-slate-300">Documents: PDF, DOCX, TXT, CSV, MD</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <FileImage className="h-4 w-4 text-green-400" />
              <span className="text-slate-300">Images: PNG, JPG, JPEG</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Brain className="h-4 w-4 text-purple-400" />
              <span className="text-slate-300">OCR powered by AWS Textract</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1">
        <Card className="h-full liquid-glass flex flex-col" style={{ pointerEvents: 'auto' }}>
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Extraction Results
              </CardTitle>
               {result && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="glow">
                      AI Processing
                    </Badge>
                    {transformedData && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Transformed
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTransformedData(null)}
                          className="hover:bg-red-500/20 hover:text-red-400 transition-colors text-xs px-2 h-6"
                          title="Reset to original data"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(displayData, null, 2))}
                      className="hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                      title="Copy results to clipboard"
                    >
                     <Copy className="h-4 w-4" />
                   </Button>
                   <div className="flex items-center space-x-1">
                     <span className="text-xs text-slate-400 mr-1">Export:</span>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => exportData('json')}
                       className="hover:bg-green-500/20 hover:text-green-400 transition-colors text-xs px-2"
                       title="Download as JSON"
                     >
                       JSON
                     </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportData('csv')}
                        className="hover:bg-orange-500/20 hover:text-orange-400 transition-colors text-xs px-2"
                        title="Download as CSV"
                        disabled={!result}
                      >
                        CSV
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportData('excel')}
                        className="hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-xs px-2"
                        title="Download as Excel"
                        disabled={!result}
                      >
                        Excel
                     </Button>
                   </div>
                 </div>
               )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full overflow-y-auto p-4">
              {!result && !isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Ready to Extract</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Upload a document or image to extract text and data using AI-powered OCR.
                      The system will automatically detect and structure the content.
                    </p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-pulse-glow w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-300">AI is analyzing your document...</p>
                    <p className="text-sm text-slate-400 mt-2">This may take a few moments</p>
                  </div>
                </div>
              )}

               {result && (
                 <div className="space-y-6 animate-fade-in">
                   {/* Extracted Text */}
                   <div>
                     <h4 className="font-semibold mb-3 text-white flex items-center">
                       <FileText className="h-4 w-4 mr-2" />
                       Extracted Text
                     </h4>
                     <div className="bg-muted/50 p-4 rounded-lg">
                       <div className="prose prose-sm max-w-none text-slate-200">
                          {displayData.text ? (
                           <div
                             className="p-3 rounded bg-slate-800/30 border border-slate-600/30"
                             dangerouslySetInnerHTML={{
                               __html: result.text.replace(/\n/g, '<br>')
                             }}
                           />
                         ) : (
                           <div className="text-slate-400 italic p-3 rounded bg-slate-800/30 border border-slate-600/30">
                             No text was extracted from this document. The document may be empty, corrupted, or in an unsupported format.
                           </div>
                         )}
                       </div>
                     </div>
                    </div>

                    {/* Extracted Tables */}
                    {displayData.tables && displayData.tables.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-white flex items-center">
                          <File className="h-4 w-4 mr-2" />
                          Extracted Tables ({displayData.tables.length})
                        </h4>
                        <div className="space-y-4">
                          {displayData.tables.map((table: any, tableIndex: number) => (
                            <div key={tableIndex} className="bg-muted/50 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-white">{table.name || `Table ${tableIndex + 1}`}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {table.row_count} rows × {table.column_count} columns
                                </Badge>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-slate-600">
                                      {table.columns.map((col: string, colIndex: number) => (
                                        <th key={colIndex} className="text-left p-2 text-slate-300 font-medium">
                                          {col}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {table.rows.slice(0, 10).map((row: any, rowIndex: number) => (
                                      <tr key={rowIndex} className="border-b border-slate-700/50">
                                        {table.columns.map((col: string, colIndex: number) => (
                                          <td key={colIndex} className="p-2 text-slate-200">
                                            {String(row[col] || '')}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                    {table.rows.length > 10 && (
                                      <tr>
                                        <td colSpan={table.columns.length} className="p-2 text-center text-slate-400 italic">
                                          ... and {table.rows.length - 10} more rows
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

                    {/* AI Instruction Panel */}
                    <div className="mt-6">
                      <InstructionPanel
                        extractedData={displayData}
                        onDataTransform={setTransformedData}
                      />
                    </div>

                    {/* Data Editing */}
                    {displayData.tables && displayData.tables.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white flex items-center">
                            <File className="h-4 w-4 mr-2" />
                            Data Editing
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditing(!isEditing);
                              if (!isEditing) {
                                setEditedData(JSON.parse(JSON.stringify(result))); // Deep copy
                              }
                            }}
                            className="hover:bg-blue-500/20 hover:text-blue-400"
                          >
                            {isEditing ? 'Cancel Edit' : 'Edit Data'}
                          </Button>
                        </div>

                        {isEditing && editedData && (
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-300 mb-3">
                              Edit the extracted data below. Changes are saved locally and can be exported.
                            </p>
                            <div className="space-y-4">
                              {editedData.tables.map((table: any, tableIndex: number) => (
                                <div key={tableIndex}>
                                  <h5 className="font-medium text-white mb-2">{table.name || `Table ${tableIndex + 1}`}</h5>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-slate-600">
                                          {table.columns.map((col: string, colIndex: number) => (
                                            <th key={colIndex} className="text-left p-2 text-slate-300 font-medium">
                                              {col}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {table.rows.slice(0, 5).map((row: any, rowIndex: number) => (
                                          <tr key={rowIndex} className="border-b border-slate-700/50">
                                            {table.columns.map((col: string, colIndex: number) => (
                                              <td key={colIndex} className="p-2">
                                                <input
                                                  type="text"
                                                  value={row[col] || ''}
                                                  onChange={(e) => {
                                                    const newEditedData = { ...editedData };
                                                    newEditedData.tables[tableIndex].rows[rowIndex][col] = e.target.value;
                                                    setEditedData(newEditedData);
                                                  }}
                                                  className="w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-slate-200 text-xs focus:border-blue-400 focus:outline-none"
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-end mt-4 space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(false)}
                              >
                                Done Editing
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cost Tracking */}
                    {displayData.metadata && displayData.metadata.aws_cost && (
                     <div>
                       <h4 className="font-semibold mb-3 text-white flex items-center">
                         <Brain className="h-4 w-4 mr-2" />
                         AWS Cost Tracking
                       </h4>
                       <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <div className="text-sm text-slate-400">Processing Cost</div>
                              <div className="text-lg font-bold text-green-400">
                                ${displayData.metadata.aws_cost.toFixed(4)}
                              </div>
                           </div>
                           <div>
                             <div className="text-sm text-slate-400">Processing Time</div>
                             <div className="text-lg font-bold text-blue-400">
                               {displayData.metadata.processing_time ? `${displayData.metadata.processing_time.toFixed(1)}s` : 'N/A'}
                             </div>
                           </div>
                         </div>
                         {displayData.metadata.aws_service && (
                           <div className="mt-3 pt-3 border-t border-purple-500/20">
                             <div className="text-sm text-slate-400">AWS Service Used</div>
                             <Badge variant="outline" className="mt-1">
                               {displayData.metadata.aws_service.toUpperCase()}
                             </Badge>
                           </div>
                         )}
                       </div>
                     </div>
                   )}

                   {/* Metadata */}
                   {displayData.metadata && (
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Document Metadata</h4>
                      <div className="grid grid-cols-2 gap-3">
                         {Object.entries(displayData.metadata).map(([key, value]) => (
                          <div key={key} className="bg-muted/30 p-3 rounded-lg">
                            <div className="text-sm text-slate-400 capitalize">{key.replace('_', ' ')}</div>
                            <div className="text-white font-medium">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  {result.note && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-300">ℹ️ Note</h4>
                      <p className="text-slate-300 text-sm">{result.note}</p>
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