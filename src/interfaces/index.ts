import OpenAI from 'openai';

// Research Types
export interface ResearchData {
  id: string;
  content: string;
  source: string;
  timestamp: string;
  metadata?: {
    industry?: string;
    region?: string;
    timeframe?: string;
  };
}

// Analysis Types
export interface AnalysisResult {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  data?: {
    insights: string[];
    recommendations: string[];
    riskAssessment: string;
  };
}

export interface AggregatedResults {
  id: string;
  timestamp: string;
  results: AnalysisResult[];
  summary: string;
  topInsights: string[];
  keyRecommendations: string[];
  criticalRisks: string[];
}

export interface AIFunctionResponse {
  insights: string[];
  recommendations: string[];
  riskAssessment: string;
}

export interface AIServiceConfig {
  openai: OpenAI;
  maxRetries?: number;
  timeout?: number;
}

export interface AnalysisOptions {
  depth: 'basic' | 'detailed' | 'comprehensive';
  focus?: string[];
  includeRecommendations: boolean;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

// Rest of the interfaces remain unchanged...
// (keeping all the other interfaces as they were)
