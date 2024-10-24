import OpenAI from 'openai';
import {
  ResearchData,
  AnalysisResult,
  AggregatedResults,
  AIFunctionResponse,
  AIServiceConfig
} from '../interfaces';

export class AIAnalysisService {
  private openai: OpenAI;
  private maxRetries: number;
  private timeout: number;

  constructor(config: AIServiceConfig) {
    this.openai = config.openai;
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 30000;
  }

  public async analyzeData(data: ResearchData): Promise<AnalysisResult> {
    try {
      const aiResponse = await this.callOpenAIWithFunctions(data);
      
      return {
        id: `analysis-${data.id}`,
        title: `Analysis of ${data.metadata?.industry || 'Industry'} in ${data.metadata?.region || 'Region'}`,
        content: data.content,
        timestamp: new Date().toISOString(),
        status: 'completed',
        data: {
          insights: aiResponse.insights,
          recommendations: aiResponse.recommendations,
          riskAssessment: aiResponse.riskAssessment
        }
      };
    } catch (error) {
      return {
        id: `analysis-${data.id}`,
        title: `Failed Analysis of ${data.source}`,
        content: data.content,
        timestamp: new Date().toISOString(),
        status: 'failed',
        data: {
          insights: [],
          recommendations: [],
          riskAssessment: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      };
    }
  }

  public async aggregateResults(results: AnalysisResult[]): Promise<AggregatedResults> {
    if (!results.length) {
      throw new Error('Failed to aggregate analysis results: No results provided');
    }

    try {
      const summary = await this.generateSummary(results);
      const topInsights = this.extractTopInsights(results);
      const keyRecommendations = this.extractKeyRecommendations(results);
      const criticalRisks = this.extractCriticalRisks(results);

      return {
        id: `aggregated-${Date.now()}`,
        timestamp: new Date().toISOString(),
        results,
        summary,
        topInsights,
        keyRecommendations,
        criticalRisks
      };
    } catch (error) {
      throw new Error(`Failed to aggregate results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected async callOpenAIWithFunctions(data: ResearchData): Promise<AIFunctionResponse> {
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert industry analyst. Analyze the provided research data and provide insights, recommendations, and risk assessment."
            },
            {
              role: "user",
              content: `Analyze this research data: ${data.content}`
            }
          ],
          functions: [
            {
              name: "provide_analysis",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: { type: "string" }
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" }
                  },
                  riskAssessment: { type: "string" }
                },
                required: ["insights", "recommendations", "riskAssessment"]
              }
            }
          ],
          function_call: { name: "provide_analysis" }
        });

        const functionCall = response.choices[0]?.message?.function_call;
        
        if (functionCall && functionCall.arguments) {
          return JSON.parse(functionCall.arguments) as AIFunctionResponse;
        }
        
        throw new Error('Invalid response format from OpenAI');
      } catch (error) {
        retries++;
        if (retries === this.maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  private async generateSummary(results: AnalysisResult[]): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate a concise summary of the analysis results."
          },
          {
            role: "user",
            content: JSON.stringify(results.map(r => ({
              title: r.title,
              insights: r.data?.insights,
              recommendations: r.data?.recommendations,
              riskAssessment: r.data?.riskAssessment
            })))
          }
        ]
      });

      return response.choices[0]?.message?.content || 'Failed to generate summary';
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractTopInsights(results: AnalysisResult[]): string[] {
    return results
      .flatMap(r => r.data?.insights || [])
      .filter((insight, index, self) => self.indexOf(insight) === index)
      .slice(0, 5);
  }

  private extractKeyRecommendations(results: AnalysisResult[]): string[] {
    return results
      .flatMap(r => r.data?.recommendations || [])
      .filter((rec, index, self) => self.indexOf(rec) === index)
      .slice(0, 5);
  }

  private extractCriticalRisks(results: AnalysisResult[]): string[] {
    return results
      .map(r => r.data?.riskAssessment || '')
      .filter(risk => risk && !risk.includes('Analysis failed'))
      .slice(0, 3);
  }
}
