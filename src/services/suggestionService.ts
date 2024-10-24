import { PerplexityService } from './perplexityService';

interface AnalysisContext {
  industry: string;
  topic: string;
  userPreferences: UserPreferences;
  historicalData: HistoricalData;
}

interface UserPreferences {
  preferredSources: string[];
  topicInterests: string[];
  dataVisualizationPreferences: string[];
}

interface HistoricalData {
  previousSearches: string[];
  successfulAnalyses: string[];
  userFeedback: FeedbackRecord[];
}

interface Suggestion {
  id: string;
  type: 'research' | 'analysis' | 'visualization';
  content: string;
  confidence: number;
  relevance: number;
  source?: string;
}

interface RankedSuggestion extends Suggestion {
  rank: number;
  score: number;
}

interface Feedback {
  userId: string;
  suggestionId: string;
  rating: number;
  comments?: string;
  timestamp: string;
}

interface FeedbackRecord extends Feedback {
  impact: number;
  processed: boolean;
}

class SuggestionEngine {
  private perplexityService: PerplexityService;
  private learningModel: Map<string, number>;
  private feedbackHistory: FeedbackRecord[];

  constructor(perplexityService: PerplexityService) {
    this.perplexityService = perplexityService;
    this.learningModel = new Map();
    this.feedbackHistory = [];
  }

  private async analyzeContext(context: AnalysisContext): Promise<any> {
    try {
      const enrichedData = await this.perplexityService.enrichData([{
        id: 'context-analysis',
        title: context.topic,
        content: JSON.stringify(context),
        source: 'user-context',
        timestamp: new Date().toISOString(),
        confidence: 1,
      }]);

      return enrichedData[0].enrichedContent;
    } catch (error) {
      console.error('Context analysis failed:', error);
      throw new Error('Failed to analyze context');
    }
  }

  private calculateRelevance(suggestion: Suggestion, context: AnalysisContext): number {
    const topicMatch = context.topic.toLowerCase().includes(suggestion.content.toLowerCase()) ? 0.3 : 0;
    const industryMatch = context.industry.toLowerCase().includes(suggestion.content.toLowerCase()) ? 0.3 : 0;
    const preferenceMatch = context.userPreferences.topicInterests.some(
      interest => suggestion.content.toLowerCase().includes(interest.toLowerCase())
    ) ? 0.4 : 0;

    return topicMatch + industryMatch + preferenceMatch;
  }

  async generateSuggestions(context: AnalysisContext): Promise<Suggestion[]> {
    try {
      const contextAnalysis = await this.analyzeContext(context);
      const suggestions: Suggestion[] = [];

      // Generate research suggestions
      contextAnalysis.marketInsights.forEach((insight: string) => {
        suggestions.push({
          id: `research-${Date.now()}-${Math.random()}`,
          type: 'research',
          content: insight,
          confidence: 0.8,
          relevance: this.calculateRelevance({ 
            id: '', 
            type: 'research', 
            content: insight, 
            confidence: 0.8,
            relevance: 0
          }, context),
        });
      });

      // Generate analysis suggestions
      contextAnalysis.competitorAnalysis.forEach((analysis: string) => {
        suggestions.push({
          id: `analysis-${Date.now()}-${Math.random()}`,
          type: 'analysis',
          content: analysis,
          confidence: 0.85,
          relevance: this.calculateRelevance({
            id: '',
            type: 'analysis',
            content: analysis,
            confidence: 0.85,
            relevance: 0
          }, context),
        });
      });

      // Generate visualization suggestions
      contextAnalysis.trends.forEach((trend: string) => {
        suggestions.push({
          id: `visualization-${Date.now()}-${Math.random()}`,
          type: 'visualization',
          content: trend,
          confidence: 0.75,
          relevance: this.calculateRelevance({
            id: '',
            type: 'visualization',
            content: trend,
            confidence: 0.75,
            relevance: 0
          }, context),
        });
      });

      return suggestions;
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      throw new Error('Failed to generate suggestions');
    }
  }

  async rankSuggestions(suggestions: Suggestion[]): Promise<RankedSuggestion[]> {
    return suggestions
      .map(suggestion => {
        const learningScore = this.learningModel.get(suggestion.type) || 1;
        const score = (suggestion.confidence * 0.4 + suggestion.relevance * 0.4 + learningScore * 0.2);

        return {
          ...suggestion,
          score,
          rank: 0, // Will be set after sorting
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((suggestion, index) => ({
        ...suggestion,
        rank: index + 1,
      }));
  }

  async trackFeedback(suggestion: Suggestion, feedback: Feedback): Promise<void> {
    const feedbackRecord: FeedbackRecord = {
      ...feedback,
      impact: this.calculateFeedbackImpact(feedback),
      processed: false,
    };

    this.feedbackHistory.push(feedbackRecord);
    await this.updateLearningModel(feedbackRecord);
  }

  private calculateFeedbackImpact(feedback: Feedback): number {
    const baseImpact = (feedback.rating / 5) * 0.8;
    const hasComments = feedback.comments ? 0.2 : 0;
    return baseImpact + hasComments;
  }

  private async updateLearningModel(feedback: FeedbackRecord): Promise<void> {
    const currentScore = this.learningModel.get(feedback.suggestionId) || 1;
    const newScore = currentScore * (1 + feedback.impact * 0.1);
    this.learningModel.set(feedback.suggestionId, newScore);

    // Mark feedback as processed
    const feedbackIndex = this.feedbackHistory.findIndex(f => f.suggestionId === feedback.suggestionId);
    if (feedbackIndex !== -1) {
      this.feedbackHistory[feedbackIndex].processed = true;
    }
  }
}

export type {
  AnalysisContext,
  UserPreferences,
  HistoricalData,
  Suggestion,
  RankedSuggestion,
  Feedback,
  FeedbackRecord,
};
export { SuggestionEngine };
