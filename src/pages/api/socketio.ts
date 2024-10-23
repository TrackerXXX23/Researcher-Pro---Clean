import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Socket as NetSocket } from 'net';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Store active processes
    const processes = new Map<string, {
      status: 'running' | 'paused' | 'completed' | 'error';
      steps: any[];
    }>();

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      // Send current process states to newly connected client
      processes.forEach((process, processId) => {
        socket.emit('processState', { processId, ...process });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    // Store the io instance
    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
