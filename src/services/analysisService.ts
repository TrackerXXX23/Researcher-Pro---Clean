import axios from 'axios';
import { authService } from './authService';
import { AnalysisDTO, AnalysisCreate, AnalysisUpdate } from '../types/analysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class AnalysisService {
  private static instance: AnalysisService;

  private constructor() {}

  public static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }

  private getHeaders() {
    const token = authService.getToken();
    
    // Debug: Log token retrieval
    console.log('AnalysisService: Getting headers:', {
      hasToken: !!token,
      token,
    });

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Debug: Log final headers
    console.log('AnalysisService: Generated headers:', headers);

    return headers;
  }

  public async createAnalysis(data: AnalysisCreate): Promise<AnalysisDTO> {
    try {
      // Debug: Log request
      console.log('AnalysisService: Creating analysis:', {
        data,
        headers: this.getHeaders(),
      });

      const response = await axios.post<AnalysisDTO>(
        `${API_BASE_URL}/analysis/`,
        data,
        {
          headers: this.getHeaders(),
        }
      );

      // Debug: Log response
      console.log('AnalysisService: Analysis created:', response.data);

      return response.data;
    } catch (error) {
      // Debug: Log error details
      console.error('AnalysisService: Error creating analysis:', {
        error,
        data,
        headers: this.getHeaders(),
      });
      throw error;
    }
  }

  public async getAnalyses(): Promise<AnalysisDTO[]> {
    try {
      // Debug: Log request
      console.log('AnalysisService: Fetching analyses');

      const response = await axios.get<AnalysisDTO[]>(
        `${API_BASE_URL}/analysis/`,
        {
          headers: this.getHeaders(),
        }
      );

      // Debug: Log response
      console.log('AnalysisService: Analyses fetched:', response.data);

      return response.data;
    } catch (error) {
      // Debug: Log error details
      console.error('AnalysisService: Error fetching analyses:', {
        error,
        headers: this.getHeaders(),
      });
      throw error;
    }
  }

  public async getAnalysis(id: number): Promise<AnalysisDTO> {
    try {
      // Debug: Log request
      console.log('AnalysisService: Fetching analysis:', { id });

      const response = await axios.get<AnalysisDTO>(
        `${API_BASE_URL}/analysis/${id}`,
        {
          headers: this.getHeaders(),
        }
      );

      // Debug: Log response
      console.log('AnalysisService: Analysis fetched:', response.data);

      return response.data;
    } catch (error) {
      // Debug: Log error details
      console.error('AnalysisService: Error fetching analysis:', {
        error,
        id,
        headers: this.getHeaders(),
      });
      throw error;
    }
  }

  public async updateAnalysis(id: number, data: AnalysisUpdate): Promise<AnalysisDTO> {
    try {
      // Debug: Log request
      console.log('AnalysisService: Updating analysis:', { id, data });

      const response = await axios.patch<AnalysisDTO>(
        `${API_BASE_URL}/analysis/${id}`,
        data,
        {
          headers: this.getHeaders(),
        }
      );

      // Debug: Log response
      console.log('AnalysisService: Analysis updated:', response.data);

      return response.data;
    } catch (error) {
      // Debug: Log error details
      console.error('AnalysisService: Error updating analysis:', {
        error,
        id,
        data,
        headers: this.getHeaders(),
      });
      throw error;
    }
  }

  public async deleteAnalysis(id: number): Promise<void> {
    try {
      // Debug: Log request
      console.log('AnalysisService: Deleting analysis:', { id });

      await axios.delete(
        `${API_BASE_URL}/analysis/${id}`,
        {
          headers: this.getHeaders(),
        }
      );

      // Debug: Log success
      console.log('AnalysisService: Analysis deleted:', { id });
    } catch (error) {
      // Debug: Log error details
      console.error('AnalysisService: Error deleting analysis:', {
        error,
        id,
        headers: this.getHeaders(),
      });
      throw error;
    }
  }

  // Mock implementation for local development
  private mockAnalysis(data: AnalysisCreate): AnalysisDTO {
    return {
      id: Math.floor(Math.random() * 1000),
      user_id: 1,
      query: data.query,
      status: 'pending',
      parameters: data.parameters,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

export const analysisService = AnalysisService.getInstance();
