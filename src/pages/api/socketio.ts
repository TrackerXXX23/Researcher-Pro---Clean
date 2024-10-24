import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { NextApiResponseServerIO } from '../../types/next';
import { NextApiRequest } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UserData {
  sub: string;
  [key: string]: any;
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    
    const io = new SocketIOServer(res.socket.server as any, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Authentication middleware
    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as UserData;
        socket.data.user = decoded;
        next();
      } catch (err) {
        console.error('Socket authentication error:', err);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.data.user.sub);

      // Join user's room for private messages
      socket.join(`user:${socket.data.user.sub}`);

      // Send connection confirmation
      socket.emit('connection_established', {
        userId: socket.data.user.sub,
        status: 'connected'
      });

      // Handle ping messages
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Handle analysis updates
      socket.on('analysis_update', async (data) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ws/message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${socket.handshake.auth.token}`
            },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            throw new Error('Failed to forward message to backend');
          }

          const responseData = await response.json();
          socket.emit('analysis_response', responseData);
        } catch (error) {
          console.error('Error handling analysis update:', error);
          socket.emit('error', { message: 'Failed to process analysis update' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.data.user.sub);
        socket.leave(`user:${socket.data.user.sub}`);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
