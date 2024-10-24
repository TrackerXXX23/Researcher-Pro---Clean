// Export all types from individual files
export * from './api';
export * from './models';
export * from './components';
export * from './analysis';
export * from './auth';

// Common utility types
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryParams extends PaginationParams {
  sort?: SortParams;
  filter?: FilterParams;
  search?: string;
}

// Environment variables type
export interface Env {
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  JWT_SECRET: string;
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_WS_URL: string;
  OPENAI_API_KEY?: string;
  PERPLEXITY_API_KEY?: string;
  REDIS_URL?: string;
  S3_BUCKET?: string;
  AWS_REGION?: string;
  SENTRY_DSN?: string;
}

// Service response types
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    duration?: number;
    cache?: {
      hit: boolean;
      key: string;
    };
  };
}

// Utility function return types
export type AsyncServiceResult<T> = Promise<ServiceResult<T>>;

// Common status types
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  error: string;
  warning: string;
  success: string;
  info: string;
};

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

// Error types
export interface AppError extends Error {
  code?: string;
  details?: any;
  isOperational?: boolean;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string | number;
  sessionId?: string;
}

// Cache types
export interface CacheConfig {
  ttl: number;
  namespace?: string;
  invalidationTags?: string[];
}

// Feature flag types
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rules?: {
    userGroups?: string[];
    percentage?: number;
    startDate?: string;
    endDate?: string;
  };
}

// Monitoring types
export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: string;
}

// Test utility types
export type MockFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;
export type MockObject<T> = jest.Mocked<T>;

// Utility type for handling promises
export type Awaited<T> = T extends Promise<infer U> ? U : T;

// Type guard utility
export type TypeGuard<T> = (value: any) => value is T;

// Utility type for component event handlers
export type EventHandler<T = void> = (event?: any) => T | Promise<T>;

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
