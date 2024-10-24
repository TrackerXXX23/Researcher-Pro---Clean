import { NextApiRequest, NextApiResponse } from 'next';
import WebSocket from 'ws';
import { Server as HTTPServer } from 'http';
import { EventEmitter } from 'events';

interface ExtendedServer extends WebSocket.Server {
  clients: Set<WebSocket>;
}

interface WebSocketWithId extends WebSocket {
  id?: string;
}

export const wsServer = new WebSocket.Server({ noServer: true }) as ExtendedServer;
const eventEmitter = new EventEmitter();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!res.socket?.server?.httpServer) {
    res.status(500).json({ error: 'HTTP Server not available' });
    return;
  }

  // Only set up WebSocket handling once
  if (!res.socket.server.ws) {
    const server = res.socket.server;
    server.ws = true;

    const httpServer = server.httpServer as HTTPServer;

    httpServer.on('upgrade', (request, socket, head) => {
      wsServer.handleUpgrade(request, socket, head, (ws: WebSocketWithId) => {
        wsServer.emit('connection', ws, request);
      });
    });

    wsServer.on('connection', (ws: WebSocketWithId, request) => {
      // Generate unique ID for the connection
      ws.id = Math.random().toString(36).substring(2, 15);

      // Send initial connection confirmation
      ws.send(JSON.stringify({ type: 'connected', id: ws.id }));

      ws.on('message', async (message: WebSocket.Data) => {
        try {
          const data = JSON.parse(message.toString());
          
          // Verify authentication if needed
          const authToken = data.token;
          if (!authToken) {
            ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
            return;
          }

          // Handle different message types
          switch (data.type) {
            case 'start_analysis':
              eventEmitter.emit('analysisStarted', { id: ws.id, ...data });
              break;
            case 'request_update':
              eventEmitter.emit('updateRequested', { id: ws.id, ...data });
              break;
            default:
              ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
          }
        } catch (error) {
          console.error('WebSocket message handling error:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        console.log(`Client ${ws.id} disconnected`);
        eventEmitter.emit('clientDisconnected', ws.id);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${ws.id}:`, error);
        eventEmitter.emit('clientError', { id: ws.id, error });
      });
    });
  }

  res.status(200).json({ message: 'WebSocket server is running' });
}
