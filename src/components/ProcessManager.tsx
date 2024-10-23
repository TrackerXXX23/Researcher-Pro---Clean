'use client';

import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { io } from 'socket.io-client';

interface ProcessStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  details?: string;
}

interface ProcessState {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  currentStep: number;
  steps: ProcessStep[];
  error?: string;
}

export const ProcessManager: React.FC = () => {
  const [processState, setProcessState] = useState<ProcessState>({
    id: '',
    status: 'idle',
    currentStep: 0,
    steps: [
      { id: 'data-collection', name: 'Data Collection', status: 'pending', progress: 0 },
      { id: 'analysis', name: 'Analysis', status: 'pending', progress: 0 },
      { id: 'report-generation', name: 'Report Generation', status: 'pending', progress: 0 },
      { id: 'insights', name: 'Insights Generation', status: 'pending', progress: 0 }
    ]
  });

  useEffect(() => {
    const socket = io({
      path: '/api/socketio',
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('processUpdate', (update: any) => {
      console.log('Process update received:', update);
      setProcessState(prevState => ({
        ...prevState,
        steps: prevState.steps.map(step => 
          step.id === update.stepId 
            ? { ...step, status: update.status, progress: update.progress, details: update.details }
            : step
        ),
        status: update.processStatus || prevState.status,
        error: update.error
      }));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStartProcess = async () => {
    try {
      const response = await fetch('/api/start-process', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start process');
      }

      const data = await response.json();
      setProcessState(prev => ({
        ...prev,
        id: data.processId,
        status: 'running',
        error: undefined
      }));
    } catch (error) {
      console.error('Error starting process:', error);
      setProcessState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }));
    }
  };

  const handleStopProcess = async () => {
    try {
      await fetch(`/api/process-updates?processId=${processState.id}`, {
        method: 'DELETE',
      });

      setProcessState(prev => ({
        ...prev,
        status: 'idle',
        error: undefined
      }));
    } catch (error) {
      console.error('Error stopping process:', error);
    }
  };

  const getStepStatusColor = (status: ProcessStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getTotalProgress = () => {
    const completedSteps = processState.steps.filter(step => step.status === 'completed').length;
    return (completedSteps / processState.steps.length) * 100;
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Research Process</h2>
          <Badge variant={processState.status === 'running' ? 'default' : 'secondary'}>
            {processState.status.charAt(0).toUpperCase() + processState.status.slice(1)}
          </Badge>
        </div>

        <Progress value={getTotalProgress()} className="w-full" />

        <div className="space-y-6">
          {processState.steps.map((step, index) => (
            <div key={step.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStepStatusColor(step.status)}`} />
                  <span className="font-medium">{step.name}</span>
                </div>
                <Badge variant="outline">{step.status}</Badge>
              </div>
              <Progress value={step.progress} className="w-full" />
              {step.details && (
                <p className="text-sm text-gray-500 mt-1">{step.details}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          {processState.status === 'idle' ? (
            <Button onClick={handleStartProcess}>
              Start Process
            </Button>
          ) : (
            <Button onClick={handleStopProcess} variant="destructive">
              Stop Process
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProcessManager;
