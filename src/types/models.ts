import { UserRole } from './auth';

// Base model interfaces
export interface BaseModel {
  id: number;
  created_at: Date;
  updated_at?: Date;
}

// User model
export interface User extends BaseModel {
  email: string;
  name?: string;
  password_hash: string;
  role: UserRole;
  last_login?: Date;
  settings?: Record<string, any>;
}

// Analysis model
export interface Analysis extends BaseModel {
  user_id: number;
  query: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  results?: Record<string, any>;
  error?: string;
  completed_at?: Date;
  parameters?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Process Result model
export interface ProcessResult extends BaseModel {
  analysis_id: number;
  process_id: string;
  result: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  metadata?: {
    duration?: number;
    resources?: string[];
    confidence?: number;
  };
}

// Template model
export interface Template extends BaseModel {
  name: string;
  description?: string;
  type: 'analysis' | 'report' | 'custom';
  parameters: Record<string, any>;
  created_by: number;
  is_public: boolean;
  version: number;
}

// Report model
export interface Report extends BaseModel {
  analysis_id: number;
  template_id?: number;
  format: 'pdf' | 'docx' | 'html';
  url: string;
  metadata?: {
    pageCount?: number;
    sections?: string[];
    generationTime?: number;
  };
}

// Relationship types
export interface AnalysisWithRelations extends Analysis {
  user: User;
  reports: ProcessResult[];
  template?: Template;
}

export interface ProcessResultWithRelations extends ProcessResult {
  analysis: Analysis;
}

export interface TemplateWithRelations extends Template {
  creator: User;
  analyses: Analysis[];
}

export interface ReportWithRelations extends Report {
  analysis: Analysis;
  template?: Template;
}

// Utility types
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'error';
export type ProcessStatus = AnalysisStatus;
export type ReportFormat = 'pdf' | 'docx' | 'html';
export type TemplateType = 'analysis' | 'report' | 'custom';

// Settings and configuration types
export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  language?: string;
  timezone?: string;
  defaultTemplate?: number;
}

export interface AnalysisParameters {
  depth?: 'basic' | 'detailed' | 'comprehensive';
  focus?: string[];
  timeframe?: string;
  customParams?: Record<string, any>;
}

export interface TemplateParameters {
  required: string[];
  optional?: string[];
  defaults?: Record<string, any>;
  validation?: Record<string, any>;
}
