import { Analysis } from '../types/analysis';
import { websocketService } from './websocketService';

class AnalysisService {
  private baseUrl = 'http://localhost:8002/api/v1';

  async createAnalysis(analysis: Analysis): Promise<Analysis> {
    try {
      console.log('Creating analysis:', analysis);
      
      // Make API call to create analysis
      const response = await fetch(`${this.baseUrl}/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysis),
      });

      if (!response.ok) {
        throw new Error(`Failed to create analysis: ${response.statusText}`);
      }

      const createdAnalysis = await response.json();
      console.log('Analysis created:', createdAnalysis);

      // Set up websocket connection with the analysis ID
      websocketService.setAnalysisId(createdAnalysis.id);

      return createdAnalysis;
    } catch (error) {
      console.error('Error in createAnalysis:', error);
      throw error;
    }
  }

  async getAnalysis(id: string): Promise<Analysis> {
    try {
      const response = await fetch(`${this.baseUrl}/analyses/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to get analysis: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getAnalysis:', error);
      throw error;
    }
  }

  async updateAnalysis(id: string, updates: Partial<Analysis>): Promise<Analysis> {
    try {
      const response = await fetch(`${this.baseUrl}/analyses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update analysis: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in updateAnalysis:', error);
      throw error;
    }
  }

  async deleteAnalysis(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/analyses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete analysis: ${response.statusText}`);
      }

      // Disconnect websocket if it was connected to this analysis
      if (websocketService.isConnected()) {
        websocketService.disconnect();
      }
    } catch (error) {
      console.error('Error in deleteAnalysis:', error);
      throw error;
    }
  }

  async getAllAnalyses(): Promise<Analysis[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analyses`);
      if (!response.ok) {
        throw new Error(`Failed to get analyses: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getAllAnalyses:', error);
      throw error;
    }
  }
}

// Create a single instance
const analysisService = new AnalysisService();

export { analysisService };
