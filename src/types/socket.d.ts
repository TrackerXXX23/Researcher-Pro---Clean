import { Server as HTTPServer } from 'http';
import { Socket } from 'net';
import { Server as WSServer } from 'ws';

declare global {
  namespace NodeJS {
    interface Process {
      browser: boolean;
    }
  }
}

declare module 'http' {
  interface IncomingMessage {
    socket: Socket & {
      server: HTTPServer & {
        ws?: boolean;
        wsServer?: WSServer;
      };
    };
  }
}

export interface WebSocketMessage {
  type: 'start_analysis' | 'request_update' | 'connected' | 'error';
  id?: string;
  token?: string;
  message?: string;
  data?: any;
}

export interface WebSocketError {
  id: string;
  error: Error;
}

export interface WebSocketEventMap {
  analysisStarted: { id: string; [key: string]: any };
  updateRequested: { id: string; [key: string]: any };
  clientDisconnected: string;
  clientError: WebSocketError;
}
