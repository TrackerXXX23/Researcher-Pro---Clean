"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Stage {
  name: string;
  status: 'inactive' | 'waiting' | 'running' | 'completed' | 'error';
  output: string;
}

const initialStages: Stage[] = [
  { name: 'Prompt Generation', status: 'inactive', output: '' },
  { name: 'Data Collection', status: 'inactive', output: '' },
  { name: 'AI Analysis', status: 'inactive', output: '' },
  { name: 'Report Generation', status: 'inactive', output: '' }
];

const VerticalProgressFlow: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [isPolling, setIsPolling] = useState(false);
  const [processId, setProcessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startProcess = async () => {
    setIsStarting(true);
    setError(null);
    setStages(stages.map((stage: Stage) => ({ ...stage, status: 'waiting' })));
    try {
      const response = await axios.post('/api/start-research-process');
      setProcessId(response.data.processId);
      setIsPolling(true);
    } catch (error) {
      console.error('Failed to start process:', error);
      setError('Failed to start the research process. Please try again.');
      setStages(stages.map((stage: Stage) => ({ ...stage, status: 'inactive' })));
    } finally {
      setIsStarting(false);
    }
  };

  const pollForUpdates = useCallback(async () => {
    if (!processId) return;

    try {
      const response = await axios.get(`/api/process-updates?processId=${processId}`);
      const updatedStages = response.data.stages;
      setStages(updatedStages);

      if (updatedStages.every((stage: Stage) => ['completed', 'error'].includes(stage.status))) {
        setIsPolling(false);
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
      setError('Error updating process status. Please refresh the page.');
      setIsPolling(false);
    }
  }, [processId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling) {
      interval = setInterval(pollForUpdates, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isPolling, pollForUpdates]);

  const getStageStatusMessage = (status: Stage['status']) => {
    switch (status) {
      case 'inactive': return 'Waiting to start...';
      case 'waiting': return 'Ready to process...';
      case 'running': return 'Processing...';
      case 'completed': return 'Completed';
      case 'error': return 'Error occurred';
      default: return '';
    }
  };

  const isProcessComplete = stages.every(stage => stage.status === 'completed');

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Research Process</h2>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="mb-16 bg-white rounded-lg shadow-lg p-6">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-start mb-8">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              stage.status === 'completed' ? 'bg-green-500' :
              stage.status === 'running' ? 'bg-yellow-500' :
              stage.status === 'error' ? 'bg-red-500' :
              stage.status === 'inactive' ? 'bg-gray-300' : 'bg-blue-500'
            } text-white font-bold transition-all duration-300 ${
              stage.status !== 'inactive' ? 'transform scale-105' : ''
            }`}>
              {index + 1}
            </div>
            <div className="ml-4 flex-grow">
              <span className={`font-medium ${stage.status === 'inactive' ? 'text-gray-500' : 'text-gray-800'}`}>
                {stage.name}
              </span>
              <div className={`mt-2 p-2 rounded transition-all duration-300 ${
                stage.status === 'inactive' ? 'bg-gray-100 text-gray-400' : 'bg-white border border-gray-200'
              }`}>
                {stage.output || getStageStatusMessage(stage.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        {isProcessComplete ? (
          <div className="text-green-600 font-bold mb-4">Process completed successfully!</div>
        ) : (
          <button 
            onClick={startProcess}
            disabled={isPolling || isStarting}
            className={`px-4 py-2 rounded transition-colors duration-300 ${
              isPolling || isStarting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isStarting ? 'Starting...' : isPolling ? 'Processing...' : 'Start Process'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerticalProgressFlow;
