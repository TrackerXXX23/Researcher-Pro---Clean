import { User, Analysis, ProcessResult, Report, Template } from './models';

// Base API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Analysis API Types
export interface CreateAnalysisInput {
  query: string;
  userId: number;
  parameters?: {
    depth?: 'basic' | 'detailed' | 'comprehensive';
    focus?: string[];
    timeframe?: string;
    customParams?: Record<string, any>;
  };
}

export interface UpdateAnalysisInput {
  status?: 'pending' | 'processing' | 'completed' | 'error';
  results?: any;
  error?: string;
  completed_at?: Date;
  metadata?: Record<string, any>;
}

export interface AnalysisResponse extends Analysis {
  user: User;
  reports: ProcessResult[];
  metadata?: Record<string, any>;
}

// Process Result API Types
export interface CreateProcessResultInput {
  processId: string;
  analysisId: number;
  result: any;
  metadata?: {
    duration?: number;
    resources?: string[];
    confidence?: number;
  };
}

export interface ProcessResultResponse extends ProcessResult {
  analysis: Analysis;
  metadata?: Record<string, any>;
}

// Auth API Types
export interface LoginInput {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupInput extends LoginInput {
  name?: string;
  terms_accepted: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_at: string;
  refresh_token?: string;
}

// Template API Types
export interface TemplateInput {
  name: string;
  description?: string;
  parameters: Record<string, any>;
  type: 'analysis' | 'report' | 'custom';
}

export interface TemplateResponse extends Template {
  creator: User;
  usage_count: number;
}

// Report API Types
export interface GenerateReportInput {
  analysisId: number;
  template?: string;
  format?: 'pdf' | 'docx' | 'html';
  options?: {
    includeGraphics?: boolean;
    includeSummary?: boolean;
    customSections?: string[];
  };
}

export interface ReportResponse extends Report {
  analysis: Analysis;
  template?: Template;
}

// Websocket API Types
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  sessionId?: string;
}

export interface WebSocketError {
  code: string;
  message: string;
  timestamp: string;
  reconnect?: boolean;
}

// Cache Control Types
export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  invalidate?: string[];
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// Service Response Types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    duration?: number;
    cache?: {
      hit: boolean;
      key: string;
    };
  };
}

// API Error Codes
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  BAD_REQUEST: 'BAD_REQUEST'
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];
