import React, { useEffect, useState } from 'react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { websocketService } from '../../services/websocketService';
import { ProcessUpdate } from '../../types/analysis';

interface AnalysisProcessProps {
  analysisId: string;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export const AnalysisProcess: React.FC<AnalysisProcessProps> = ({
  analysisId,
  onComplete,
  onError
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('initializing');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    console.log('AnalysisProcess: Setting up WebSocket connection for analysis:', analysisId);

    // Handle connection status updates
    const handleConnectionStatus = (status: { status: string }) => {
      console.log('AnalysisProcess: WebSocket connection status:', status);
      setConnected(status.status === 'connected');
    };

    // Handle analysis updates
    const handleUpdate = (update: ProcessUpdate) => {
      console.log('AnalysisProcess: Received update:', update);
      if (update.analysisId === analysisId) {
        setStatus(update.status);
        if (update.progress !== undefined) {
          setProgress(update.progress);
        }

        if (update.status === 'completed') {
          onComplete();
        } else if (update.status === 'error') {
          onError(new Error(update.message || 'Unknown error'));
        }
      }
    };

    // Subscribe to WebSocket events
    websocketService.subscribe('connection_status', handleConnectionStatus);
    websocketService.subscribe('analysis_update', handleUpdate);

    // Initialize WebSocket connection
    websocketService.setAnalysisId(analysisId);

    // Cleanup function
    return () => {
      console.log('AnalysisProcess: Cleaning up WebSocket connection');
      websocketService.unsubscribe('connection_status', handleConnectionStatus);
      websocketService.unsubscribe('analysis_update', handleUpdate);
      websocketService.disconnect();
    };
  }, [analysisId, onComplete, onError]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Analysis Progress</span>
        <Badge variant={connected ? "success" : "destructive"}>
          {connected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <Progress value={progress} className="w-full" />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Status: {status}</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
    </div>
  );
};
