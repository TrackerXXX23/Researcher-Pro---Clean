import { ResearchData } from '@/interfaces';

interface PerplexityConfig {
  apiKey: string;
  model: string;
  options: {
    temperature: number;
    maxTokens: number;
    streaming: boolean;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

interface EnrichedData extends ResearchData {
  enrichedContent: {
    marketInsights: string[];
    competitorAnalysis: string[];
    trends: string[];
    sourceVerification: {
      isVerified: boolean;
      confidence: number;
      verificationDetails: string;
    };
  };
}

// Rate limiter implementation
class RateLimiter {
  private requests: number = 0;
  private lastReset: number = Date.now();
  private readonly limit: number = 50; // requests per minute
  private readonly interval: number = 60000; // 1 minute in milliseconds

  canMakeRequest(): boolean {
    const now = Date.now();
    if (now - this.lastReset >= this.interval) {
      this.requests = 0;
      this.lastReset = now;
    }
    return this.requests < this.limit;
  }

  incrementRequests(): void {
    this.requests++;
  }
}

class PerplexityService {
  private config: PerplexityConfig;
  private rateLimiter: RateLimiter;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_DURATION = 1800000; // 30 minutes in milliseconds

  constructor(config: PerplexityConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter();
    this.cache = new Map();
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      const response = await fetch(`https://api.perplexity.ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          ...data,
          model: this.config.model,
          ...this.config.options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      this.rateLimiter.incrementRequests();
      return await response.json();
    } catch (error) {
      console.error('Perplexity API request failed:', error);
      throw error;
    }
  }

  private getCacheKey(query: string): string {
    return `perplexity:${query}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  async collectData(query: string): Promise<ResearchData[]> {
    const cacheKey = this.getCacheKey(query);
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await this.makeRequest('collect', { query });
      const data = response.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: item.source,
        timestamp: new Date().toISOString(),
        confidence: item.confidence || 0.8,
      }));

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Data collection failed:', error);
      throw new Error('Failed to collect research data');
    }
  }

  async validateData(data: ResearchData[]): Promise<ValidationResult> {
    try {
      const validationPromises = data.map(async (item) => {
        const response = await this.makeRequest('validate', { data: item });
        return response.validation;
      });

      const validationResults = await Promise.all(validationPromises);
      const errors = validationResults
        .filter((result) => !result.isValid)
        .map((result) => result.error);

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Data validation failed:', error);
      throw new Error('Failed to validate research data');
    }
  }

  async enrichData(data: ResearchData[]): Promise<EnrichedData[]> {
    try {
      const enrichmentPromises = data.map(async (item) => {
        const response = await this.makeRequest('enrich', { data: item });
        return {
          ...item,
          enrichedContent: {
            marketInsights: response.marketInsights,
            competitorAnalysis: response.competitorAnalysis,
            trends: response.trends,
            sourceVerification: {
              isVerified: response.sourceVerification.isVerified,
              confidence: response.sourceVerification.confidence,
              verificationDetails: response.sourceVerification.details,
            },
          },
        };
      });

      return await Promise.all(enrichmentPromises);
    } catch (error) {
      console.error('Data enrichment failed:', error);
      throw new Error('Failed to enrich research data');
    }
  }
}

export type { PerplexityConfig, ValidationResult, EnrichedData };
export { PerplexityService };
