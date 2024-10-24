'use client';

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ProcessUpdate, ProcessStep, getStatusColor } from '../../types/analysis';
import { authService } from '../../services/authService';
import { useWebSocket, WebSocketMessage } from '../../services/websocketService';

const defaultSteps: ProcessStep[] = [
  {
    id: 'data-collection',
    label: 'Data Collection',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'processing',
    label: 'Processing',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'ai-analysis',
    label: 'AI Analysis',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'report-creation',
    label: 'Report Creation',
    status: 'pending',
    progress: 0,
  },
];

interface AnalysisProcessProps {
  analysisId?: number;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export const AnalysisProcess: React.FC<AnalysisProcessProps> = ({
  analysisId,
  onComplete,
  onError,
}) => {
  const [steps, setSteps] = React.useState<ProcessStep[]>(defaultSteps);
  const { connect, disconnect, addMessageHandler, connectionState } = useWebSocket();

  React.useEffect(() => {
    const user = authService.getUser();
    if (!user) {
      console.error('No user found');
      onError?.(new Error('Authentication required'));
      return;
    }

    // Debug: Log connection attempt
    console.log('AnalysisProcess: Connecting to WebSocket:', {
      userId: user.id,
      analysisId,
    });

    const handleMessage = (message: WebSocketMessage) => {
      console.log('AnalysisProcess: Received message:', message);

      if (message.type === 'processUpdate') {
        const update = message.payload as ProcessUpdate;
        setSteps((currentSteps) =>
          currentSteps.map((step) =>
            step.id === update.stepId
              ? {
                  ...step,
                  status: update.status,
                  progress: update.progress,
                  details: update.details,
                  error: update.error,
                }
              : step
          )
        );

        // Check if all steps are completed
        if (update.processStatus === 'completed') {
          onComplete?.();
        } else if (update.processStatus === 'error') {
          onError?.(new Error(update.error || 'Analysis process failed'));
        }
      }
    };

    // Connect to WebSocket
    connect();
    const cleanup = addMessageHandler(handleMessage);

    // Cleanup
    return () => {
      console.log('AnalysisProcess: Cleaning up WebSocket connection');
      cleanup();
      disconnect();
    };
  }, [analysisId, onComplete, onError, connect, disconnect, addMessageHandler]);

  if (connectionState !== 'connected') {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">
          {connectionState === 'connecting'
            ? 'Connecting to analysis process...'
            : 'Disconnected from analysis process'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <Card key={step.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{step.label}</h3>
              {step.details && (
                <p className="text-sm text-gray-500">{step.details}</p>
              )}
              {step.error && (
                <p className="text-sm text-red-500 mt-1">{step.error}</p>
              )}
            </div>
            <Badge className={getStatusColor(step.status)}>
              {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
            </Badge>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                step.status === 'error'
                  ? 'bg-red-600'
                  : step.status === 'completed'
                  ? 'bg-green-600'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${step.progress}%` }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};
