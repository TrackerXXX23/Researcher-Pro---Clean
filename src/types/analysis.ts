import { Analysis as DbAnalysis } from './models';

export interface AnalysisBase {
  query: string;
}

export interface AnalysisCreate extends AnalysisBase {
  parameters?: Record<string, any>;
  userId?: number;
}

export interface AnalysisUpdate extends AnalysisBase {
  status?: string;
  results?: Record<string, any>;
  error?: string;
}

export interface AnalysisDTO extends AnalysisBase {
  id: number;
  user_id: number;
  status: string;
  parameters?: Record<string, any>;
  results?: Record<string, any>;
  error?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

// Status types
export type AnalysisStatusType = 'pending' | 'running' | 'processing' | 'completed' | 'error';
export type ProcessStatusType = AnalysisStatusType;

// Process types
export interface ProcessStep {
  id: string;
  label: string;
  status: ProcessStatusType;
  progress: number;
  details?: string;
  error?: string;
}

export interface ProcessUpdate {
  stepId: string;
  status: ProcessStatusType;
  progress: number;
  details?: string;
  error?: string;
  processStatus?: ProcessStatusType;
}

export interface AnalysisFormData {
  topic: string;
  analysisDepth: string;
  clientSegment: string;
  jurisdiction: string;
  industryType: string;
  outputType: string;
  parameters?: Record<string, any>;
}

// Type guards
export function isDbAnalysis(analysis: any): analysis is DbAnalysis {
  return (
    analysis &&
    typeof analysis.id === 'number' &&
    typeof analysis.user_id === 'number' &&
    typeof analysis.query === 'string' &&
    typeof analysis.status === 'string'
  );
}

export function isAnalysisDTO(analysis: any): analysis is AnalysisDTO {
  return (
    analysis &&
    typeof analysis.id === 'number' &&
    typeof analysis.user_id === 'number' &&
    typeof analysis.query === 'string' &&
    typeof analysis.status === 'string' &&
    typeof analysis.created_at === 'string'
  );
}

export interface AnalysisMetadata {
  startTime?: string;
  endTime?: string;
  duration?: number;
  steps?: {
    name: string;
    status: AnalysisStatusType;
    duration?: number;
    error?: string;
  }[];
}

export interface AnalysisOptions {
  depth?: 'basic' | 'detailed' | 'comprehensive';
  focus?: string[];
  timeframe?: string;
  customParams?: Record<string, any>;
}

export interface AnalysisResult {
  summary: string;
  details: Record<string, any>;
  recommendations?: string[];
  metadata?: AnalysisMetadata;
}

// Helper functions
export function isValidAnalysisStatus(status: string): status is AnalysisStatusType {
  return ['pending', 'running', 'processing', 'completed', 'error'].includes(status);
}

export function getStatusColor(status: AnalysisStatusType): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'running':
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
