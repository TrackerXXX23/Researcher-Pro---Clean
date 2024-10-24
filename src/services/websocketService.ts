import { create } from 'zustand';
import { getToken } from './authService';

export type WebSocketConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface WebSocketMessage {
  type: string;
  data: any;
  payload: any;
  timestamp?: string;
}

type MessageHandler = (data: WebSocketMessage) => void;

interface WebSocketStore {
  connectionState: WebSocketConnectionState;
  setConnectionState: (state: WebSocketConnectionState) => void;
}

const useWebSocketStore = create<WebSocketStore>((set) => ({
  connectionState: 'disconnected',
  setConnectionState: (state: WebSocketConnectionState) => {
    console.log('WebSocketService: Setting connection state:', state);
    set((prev) => ({ ...prev, connectionState: state }));
  },
}));

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds
  private url: string;
  private isIntentionalClose = false;

  constructor(url: string) {
    this.url = url;
  }

  private async getWebSocketUrl(): Promise<string> {
    const token = await getToken();
    return `${this.url}?token=${token}`;
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      useWebSocketStore.getState().setConnectionState('connecting');
      const wsUrl = await this.getWebSocketUrl();
      console.log('WebSocketService: Connecting to URL:', wsUrl);

      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
    } catch (error) {
      console.error('WebSocketService: Connection error:', error);
      this.handleConnectionError();
    }
  }

  private setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocketService: Connection established');
      useWebSocketStore.getState().setConnectionState('connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 2000; // Reset delay on successful connection
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        this.messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('WebSocketService: Error parsing message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocketService: Connection closed', event);
      useWebSocketStore.getState().setConnectionState('disconnected');
      
      if (!this.isIntentionalClose) {
        this.handleConnectionError();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocketService: Connection error:', error);
      this.handleConnectionError();
    };
  }

  private handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isIntentionalClose) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 10000); // Cap at 10 seconds
      
      console.log(`WebSocketService: Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        console.log(`WebSocketService: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocketService: Max reconnection attempts reached');
      useWebSocketStore.getState().setConnectionState('disconnected');
    }
  }

  addMessageHandler(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    console.log('WebSocketService: Added message handler, total handlers:', this.messageHandlers.size);
    return () => this.removeMessageHandler(handler);
  }

  removeMessageHandler(handler: MessageHandler) {
    this.messageHandlers.delete(handler);
    console.log('WebSocketService: Removed message handler, handlers before/after:', {
      before: this.messageHandlers.size + 1,
      after: this.messageHandlers.size
    });
  }

  disconnect() {
    console.log('WebSocketService: Disconnecting');
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
    useWebSocketStore.getState().setConnectionState('disconnected');
  }

  send(data: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocketService: Cannot send message - connection not open');
    }
  }
}

// Create a singleton instance
const wsService = new WebSocketService(`ws://${process.env.NEXT_PUBLIC_WS_HOST || 'localhost:3000'}/api/v1/ws/1`);

export const useWebSocket = () => {
  const { connectionState } = useWebSocketStore();
  return {
    connect: () => wsService.connect(),
    disconnect: () => wsService.disconnect(),
    send: (data: WebSocketMessage) => wsService.send(data),
    addMessageHandler: (handler: MessageHandler) => wsService.addMessageHandler(handler),
    connectionState
  };
};

export default wsService;
