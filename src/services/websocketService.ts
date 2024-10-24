import { ProcessUpdate } from '../types/analysis';

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private analysisId: string | null = null;
  private connecting: boolean = false;
  private readonly baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8002';

  public setAnalysisId(id: string | null) {
    console.log('Setting analysis ID:', id);
    
    // Disconnect existing connection if any
    if (this.socket) {
      this.disconnect();
    }
    
    this.analysisId = id;
    
    // Only connect if we have a valid analysis ID
    if (id) {
      console.log('Attempting to connect with analysis ID:', id);
      this.connect();
    } else {
      console.log('No analysis ID provided, skipping connection');
      this.notifyListeners('connection_status', { status: 'disconnected' });
    }
  }

  private connect() {
    if (!this.analysisId) {
      console.warn('Cannot connect without an analysis ID');
      return;
    }

    if ((!this.socket || this.socket.readyState !== WebSocket.OPEN) && !this.connecting) {
      this.connecting = true;
      try {
        // Ensure we're using the correct URL format with the analysis ID
        const wsUrl = `${this.baseUrl}/ws/${encodeURIComponent(this.analysisId)}`;
        console.log('Connecting to WebSocket URL:', wsUrl);
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('WebSocket connected successfully');
          this.reconnectAttempts = 0;
          this.connecting = false;
          this.notifyListeners('connection_status', { status: 'connected' });
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.socket = null;
          this.connecting = false;
          this.notifyListeners('connection_status', { status: 'disconnected' });
          if (this.analysisId) {  // Only try to reconnect if we still have an analysis ID
            this.tryReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connecting = false;
          this.notifyListeners('connection_status', { status: 'error', error });
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);
            if (message.type) {
              this.notifyListeners(message.type, message.data);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        this.connecting = false;
        if (this.analysisId) {  // Only try to reconnect if we still have an analysis ID
          this.tryReconnect();
        }
      }
    }
  }

  private tryReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.connecting && this.analysisId) {
      this.reconnectAttempts++;
      const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.notifyListeners('connection_status', { 
        status: 'error', 
        error: 'Failed to connect after maximum attempts' 
      });
    }
  }

  public subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    console.log(`Subscribed to event: ${event}`);
  }

  public unsubscribe(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        console.log(`Unsubscribed from event: ${event}`);
      }
    }
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      console.log(`Notifying listeners for event: ${event}`, data);
      callbacks.forEach(callback => callback(data));
    }
  }

  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.close();
      this.socket = null;
    }
    this.analysisId = null;
    this.notifyListeners('connection_status', { status: 'disconnected' });
  }

  public sendMessage(type: string, data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, data });
      console.log('Sending WebSocket message:', message);
      this.socket.send(message);
    } else {
      console.warn('WebSocket not connected. Message not sent:', { type, data });
      if (this.analysisId) {  // Only try to connect if we have an analysis ID
        this.connect();
      }
    }
  }
}

// Create a single instance
const websocketService = new WebSocketService();

// Prevent automatic connection on import
export { websocketService };
