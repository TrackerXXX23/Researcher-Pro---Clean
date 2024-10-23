export interface ProcessUpdate {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  details?: string;
  processStatus?: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
}

export interface ProcessStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  details?: string;
}

export interface ProcessState {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  currentStep: number;
  steps: ProcessStep[];
  error?: string;
}
