import { io } from 'socket.io-client';

export const socket = io({
  path: '/api/socketio',
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('error', (error: Error) => {
  console.error('Socket error:', error);
});

export type ProcessUpdate = {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  details?: string;
  processStatus?: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
};

export type LiveUpdate = {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
};

export const subscribeToUpdates = (
  onProcessUpdate: (update: ProcessUpdate) => void,
  onLiveUpdate: (update: LiveUpdate) => void
) => {
  socket.on('processUpdate', onProcessUpdate);
  socket.on('liveUpdate', onLiveUpdate);

  return () => {
    socket.off('processUpdate', onProcessUpdate);
    socket.off('liveUpdate', onLiveUpdate);
  };
};
