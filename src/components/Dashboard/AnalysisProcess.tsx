'use client';

import React, { useEffect } from 'react';
import { socket, subscribeToUpdates, type ProcessUpdate } from '@/lib/socket';

interface ProcessStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  details?: string;
}

export const AnalysisProcess: React.FC = () => {
  const [steps, setSteps] = React.useState<ProcessStep[]>([
    { id: 'data-collection', name: 'Data Collection', status: 'pending', progress: 0 },
    { id: 'processing', name: 'Processing', status: 'pending', progress: 0 },
    { id: 'ai-analysis', name: 'AI Analysis', status: 'pending', progress: 0 },
    { id: 'report-creation', name: 'Report Creation', status: 'pending', progress: 0 }
  ]);

  const [status, setStatus] = React.useState<'idle' | 'running' | 'paused'>('idle');
  const [processId, setProcessId] = React.useState<string | null>(null);

  useEffect(() => {
    const handleProcessUpdate = (update: ProcessUpdate) => {
      console.log('Process update received:', update);
      
      if (update.processStatus) {
        setStatus(update.processStatus === 'running' ? 'running' : 'idle');
      }

      if (update.stepId) {
        setSteps(prevSteps => prevSteps.map(step => 
          step.id === update.stepId 
            ? { 
                ...step, 
                status: update.status,
                progress: update.progress,
                details: update.details 
              }
            : step
        ));
      }
    };

    const cleanup = subscribeToUpdates(
      handleProcessUpdate,
      () => {}
    );

    return () => {
      cleanup();
    };
  }, []);

  const handleStart = async () => {
    try {
      const response = await fetch('/api/start-process', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to start process');
      }

      const data = await response.json();
      setProcessId(data.processId);
      setStatus('running');
      
      setSteps(steps => steps.map(step => ({
        ...step,
        status: 'pending',
        progress: 0,
        details: undefined
      })));
    } catch (error) {
      console.error('Error starting process:', error);
      setStatus('idle');
    }
  };

  return (
    <div>
      <div className="section-header">Analysis Process</div>
      
      <button 
        onClick={handleStart}
        className="mb-4"
      >
        Start Process
      </button>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="process-step">
            <div className="process-step-name">{step.name}</div>
            <div className="process-step-status">{step.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisProcess;
