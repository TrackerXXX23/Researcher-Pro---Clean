import { Server as SocketIOServer } from 'socket.io';
import { processData, validateData, enrichData, type ResearchData } from '@/utils/dataProcessing';
import { AIAnalysisService, type AnalysisResult } from './aiAnalysisService';
import { generateDailyReport, formatReportForExport } from './reportGenerationService';

export class ResearchService {
  private io: SocketIOServer;
  private activeProcesses: Map<string, {
    status: 'running' | 'paused' | 'completed' | 'error';
    data?: ResearchData[];
    analysisResults?: AnalysisResult[];
  }>;
  private aiService: AIAnalysisService;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.activeProcesses = new Map();
    this.aiService = new AIAnalysisService();
  }

  private emitUpdate(processId: string, update: any) {
    this.io.emit('processUpdate', { processId, ...update });
  }

  private emitLiveUpdate(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    this.io.emit('liveUpdate', {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    });
  }

  async runProcess(processId: string) {
    try {
      this.activeProcesses.set(processId, { status: 'running' });
      let processState = this.activeProcesses.get(processId)!;

      // Step 1: Data Collection
      this.emitUpdate(processId, {
        stepId: 'data-collection',
        status: 'running',
        progress: 0,
        details: 'Starting data collection...'
      });

      const rawData = await processData();
      if (!this.activeProcesses.has(processId)) return;

      this.emitUpdate(processId, {
        stepId: 'data-collection',
        status: 'completed',
        progress: 100,
        details: `Collected ${rawData.length} data points`
      });
      this.emitLiveUpdate(`Data collection completed: ${rawData.length} points`, 'success');

      // Step 2: Processing
      this.emitUpdate(processId, {
        stepId: 'processing',
        status: 'running',
        progress: 0,
        details: 'Validating and enriching data...'
      });

      const isValid = await validateData(rawData);
      if (!isValid) throw new Error('Data validation failed');
      if (!this.activeProcesses.has(processId)) return;

      const enrichedData = await enrichData(rawData);
      if (!this.activeProcesses.has(processId)) return;

      processState.data = enrichedData;
      this.emitUpdate(processId, {
        stepId: 'processing',
        status: 'completed',
        progress: 100,
        details: 'Data processing completed'
      });
      this.emitLiveUpdate('Data processing and enrichment completed', 'success');

      // Step 3: AI Analysis
      this.emitUpdate(processId, {
        stepId: 'ai-analysis',
        status: 'running',
        progress: 0,
        details: 'Starting AI analysis...'
      });

      const analysisResults: AnalysisResult[] = [];
      for (let i = 0; i < enrichedData.length; i++) {
        if (!this.activeProcesses.has(processId)) return;
        
        const result = await this.aiService.analyzeData(enrichedData[i]);
        analysisResults.push(result);
        
        const progress = Math.floor((i + 1) / enrichedData.length * 100);
        this.emitUpdate(processId, {
          stepId: 'ai-analysis',
          status: 'running',
          progress,
          details: `Analyzing item ${i + 1} of ${enrichedData.length}`
        });
      }

      if (!this.activeProcesses.has(processId)) return;
      processState.analysisResults = analysisResults;

      const aggregatedResults = await this.aiService.aggregateResults(analysisResults);
      this.emitUpdate(processId, {
        stepId: 'ai-analysis',
        status: 'completed',
        progress: 100,
        details: aggregatedResults.summary
      });
      this.emitLiveUpdate('AI analysis completed', 'success');

      // Step 4: Report Generation
      this.emitUpdate(processId, {
        stepId: 'report-creation',
        status: 'running',
        progress: 0,
        details: 'Generating report...'
      });

      const report = await generateDailyReport(enrichedData, analysisResults);
      if (!this.activeProcesses.has(processId)) return;

      // Generate PDF and CSV versions
      const [pdfVersion, csvVersion] = await Promise.all([
        formatReportForExport(report, 'pdf'),
        formatReportForExport(report, 'csv')
      ]);

      this.emitUpdate(processId, {
        stepId: 'report-creation',
        status: 'completed',
        progress: 100,
        details: 'Report generated successfully'
      });
      this.emitLiveUpdate('Report generation completed', 'success');

      // Process completed
      processState.status = 'completed';
      this.emitUpdate(processId, {
        status: 'completed',
        details: 'Process completed successfully'
      });
      this.emitLiveUpdate('Research process completed successfully', 'success');

    } catch (error) {
      console.error('Error in research process:', error);
      this.emitUpdate(processId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      this.emitLiveUpdate('Error in research process', 'error');
      this.activeProcesses.set(processId, { status: 'error' });
    }
  }

  stopProcess(processId: string) {
    this.activeProcesses.delete(processId);
    this.emitUpdate(processId, {
      status: 'idle',
      details: 'Process stopped'
    });
    this.emitLiveUpdate('Process stopped', 'warning');
  }

  pauseProcess(processId: string) {
    const process = this.activeProcesses.get(processId);
    if (process) {
      process.status = 'paused';
      this.emitUpdate(processId, {
        status: 'paused',
        details: 'Process paused'
      });
      this.emitLiveUpdate('Process paused', 'warning');
    }
  }

  resumeProcess(processId: string) {
    const process = this.activeProcesses.get(processId);
    if (process) {
      process.status = 'running';
      this.emitUpdate(processId, {
        status: 'running',
        details: 'Process resumed'
      });
      this.emitLiveUpdate('Process resumed', 'info');
      this.runProcess(processId);
    }
  }
}
