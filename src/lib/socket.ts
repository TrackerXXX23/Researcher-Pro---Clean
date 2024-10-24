import { io, Socket } from 'socket.io-client';
import { ProcessUpdate, LiveUpdate } from '@/types/socket';

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io({
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const subscribeToUpdates = (
  onProcessUpdate: (update: ProcessUpdate) => void,
  onLiveUpdate: (update: LiveUpdate) => void
) => {
  const socket = getSocket();

  socket.on('processUpdate', onProcessUpdate);
  socket.on('liveUpdate', onLiveUpdate);

  return () => {
    socket.off('processUpdate', onProcessUpdate);
    socket.off('liveUpdate', onLiveUpdate);
  };
};

// Initialize socket connection
initializeSocket();
