'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  Sparkles,
  Play,
  Eye,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface InstructionPanelProps {
  extractedData: any;
  onDataTransform: (transformedData: any) => void;
}

export default function InstructionPanel({ extractedData, onDataTransform }: InstructionPanelProps) {
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleProcessInstruction = async () => {
    if (!instruction.trim() || !extractedData) return;

    setIsProcessing(true);
    setError('');

    try {
      const response = await apiClient.makeRequest('post', '/instruction/process', {
        instruction: instruction.trim(),
        extracted_data: extractedData
      });

      setResult(response.data);
      onDataTransform(response.data.transformed_data);
    } catch (error: any) {
      console.error('Instruction processing failed:', error);
      setError(error.response?.data?.detail || 'Failed to process instruction');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreviewInstruction = async () => {
    if (!instruction.trim() || !extractedData) return;

    setIsPreviewing(true);
    setError('');

    try {
      const response = await apiClient.makeRequest('post', '/instruction/preview', {
        instruction: instruction.trim(),
        extracted_data: extractedData
      });

      setResult(response.data);
      // Don't apply transformation in preview mode
    } catch (error: any) {
      console.error('Instruction preview failed:', error);
      setError(error.response?.data?.detail || 'Failed to preview instruction');
    } finally {
      setIsPreviewing(false);
    }
  };

  const getExamples = async () => {
    try {
      const response = await apiClient.makeRequest('get', '/instruction/examples');
      // Could show examples in a modal or tooltip
      console.log('Instruction examples:', response.data);
    } catch (error) {
      console.error('Failed to get examples:', error);
    }
  };

  return (
    <Card className="liquid-glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          AI Data Transformation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Describe how you want to transform the data:
          </label>
          <Textarea
            placeholder="e.g., 'Show only Name and Email columns', 'Create a table with contact info from this resume', 'Filter rows where age > 25'"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="min-h-20 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
            disabled={isProcessing || isPreviewing}
          />
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={getExamples}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              View examples
            </button>
            <Badge variant="outline" className="text-xs">
              AWS Bedrock Powered
            </Badge>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-400 mr-2" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handlePreviewInstruction}
            disabled={!instruction.trim() || !extractedData || isProcessing || isPreviewing}
            variant="outline"
            className="flex-1"
          >
            {isPreviewing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Previewing...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview Changes
              </>
            )}
          </Button>

          <Button
            onClick={handleProcessInstruction}
            disabled={!instruction.trim() || !extractedData || isProcessing || isPreviewing}
            className="flex-1"
            variant="futuristic"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Apply Transformation
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">Transformation Result</h4>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <Badge variant="glow" className="text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Failed
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {result.confidence * 100}% confidence
                </Badge>
              </div>
            </div>

            {result.transformation_rules && result.transformation_rules.length > 0 && (
              <div className="bg-slate-800/30 rounded-lg p-3">
                <h5 className="text-sm font-medium text-slate-300 mb-2">Applied Transformations:</h5>
                <div className="space-y-1">
                  {result.transformation_rules.map((rule: any, index: number) => (
                    <div key={index} className="text-xs text-slate-400">
                      <span className="font-medium text-blue-400">{rule.operation}:</span> {rule.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.explanation && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <h5 className="text-sm font-medium text-blue-300 mb-1">AI Explanation:</h5>
                <p className="text-xs text-slate-300">{result.explanation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}