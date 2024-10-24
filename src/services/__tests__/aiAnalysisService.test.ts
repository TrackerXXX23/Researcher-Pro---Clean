/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />
/// <reference path="../../types/jest.d.ts" />

import '@testing-library/jest-dom';
import { AIAnalysisService } from '../aiAnalysisService';
import { ResearchData, AIServiceConfig, AnalysisResult } from '../../interfaces';

// Define types for our mocks
interface MockChatCompletion {
  choices: Array<{
    message: {
      role: string;
      function_call?: {
        name: string;
        arguments: string;
      };
      content?: string;
    };
    index: number;
    finish_reason: string;
  }>;
  id: string;
  created: number;
  model: string;
  object: string;
}

// Mock OpenAI client
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  }
} as any;

describe('AIAnalysisService', () => {
  let service: AIAnalysisService;
  const config: AIServiceConfig = {
    openai: mockOpenAI,
    maxRetries: 1,
    timeout: 1000
  };

  const mockResearchData: ResearchData = {
    id: 'test-1',
    content: 'Test research content',
    source: 'test-source',
    timestamp: '2023-01-01T00:00:00Z',
    metadata: {
      industry: 'Technology',
      region: 'North America'
    }
  };

  beforeEach(() => {
    service = new AIAnalysisService(config);
    jest.clearAllMocks();
  });

  describe('analyzeData', () => {
    test('should successfully analyze research data', async () => {
      const mockResponse: MockChatCompletion = {
        choices: [{
          message: {
            role: 'assistant',
            function_call: {
              name: 'provide_analysis',
              arguments: JSON.stringify({
                insights: ['Insight 1', 'Insight 2'],
                recommendations: ['Rec 1', 'Rec 2'],
                riskAssessment: 'Low risk'
              })
            }
          },
          index: 0,
          finish_reason: 'function_call'
        }],
        id: 'mock-id',
        created: Date.now(),
        model: 'gpt-4',
        object: 'chat.completion'
      };

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockResponse);

      const result = await service.analyzeData(mockResearchData);

      expect(result.status).toBe('completed');
      expect(result.data?.insights).toHaveLength(2);
      expect(result.data?.recommendations).toHaveLength(2);
      expect(result.data?.riskAssessment).toBe('Low risk');
    });

    test('should handle OpenAI API errors', async () => {
      const error = new Error('API Error');
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(error);

      const result = await service.analyzeData(mockResearchData);

      expect(result.status).toBe('failed');
      expect(result.data?.insights).toEqual([]);
      expect(result.data?.recommendations).toEqual([]);
      expect(result.data?.riskAssessment).toContain('API Error');
    });

    test('should handle invalid response format', async () => {
      const invalidResponse = {
        choices: [{
          message: {
            role: 'assistant',
            content: 'Invalid response'
          },
          index: 0,
          finish_reason: 'stop'
        }],
        id: 'mock-id',
        created: Date.now(),
        model: 'gpt-4',
        object: 'chat.completion'
      } as MockChatCompletion;

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(invalidResponse);

      const result = await service.analyzeData(mockResearchData);

      expect(result.status).toBe('failed');
    });
  });

  describe('aggregateResults', () => {
    const mockResults: AnalysisResult[] = [{
      id: 'test-1',
      title: 'Test Analysis',
      content: 'Test content',
      timestamp: '2023-01-01T00:00:00Z',
      status: 'completed',
      data: {
        insights: ['Insight 1'],
        recommendations: ['Rec 1'],
        riskAssessment: 'Low risk'
      }
    }];

    test('should successfully aggregate results', async () => {
      const mockResponse: MockChatCompletion = {
        choices: [{
          message: {
            role: 'assistant',
            content: 'Summary of analysis'
          },
          index: 0,
          finish_reason: 'stop'
        }],
        id: 'mock-id',
        created: Date.now(),
        model: 'gpt-4',
        object: 'chat.completion'
      };

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockResponse);

      const result = await service.aggregateResults(mockResults);

      expect(result.summary).toBe('Summary of analysis');
      expect(result.topInsights).toHaveLength(1);
      expect(result.keyRecommendations).toHaveLength(1);
      expect(result.criticalRisks).toHaveLength(1);
    });

    test('should handle empty results array', async () => {
      await expect(service.aggregateResults([])).rejects.toThrow('No results provided');
    });

    test('should handle OpenAI API errors during summary generation', async () => {
      const error = new Error('API Error');
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(error);

      await expect(service.aggregateResults(mockResults)).rejects.toThrow('Failed to generate summary');
    });

    test('should handle multiple results', async () => {
      const mockResponse: MockChatCompletion = {
        choices: [{
          message: {
            role: 'assistant',
            content: 'Aggregated summary'
          },
          index: 0,
          finish_reason: 'stop'
        }],
        id: 'mock-id',
        created: Date.now(),
        model: 'gpt-4',
        object: 'chat.completion'
      };

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockResponse);

      const multipleResults: AnalysisResult[] = [
        ...mockResults,
        {
          id: 'test-2',
          title: 'Test Analysis 2',
          content: 'Test content 2',
          timestamp: '2023-01-02T00:00:00Z',
          status: 'completed',
          data: {
            insights: ['Insight 2'],
            recommendations: ['Rec 2'],
            riskAssessment: 'Medium risk'
          }
        }
      ];

      const result = await service.aggregateResults(multipleResults);

      expect(result.topInsights).toHaveLength(2);
      expect(result.keyRecommendations).toHaveLength(2);
      expect(result.criticalRisks).toHaveLength(2);
    });
  });
});
