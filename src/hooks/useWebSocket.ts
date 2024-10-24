import { useEffect, useState } from 'react';
import { websocketService } from '../services/websocketService';

const useWebSocket = (
  eventType: string,
  callback: (data: any) => void,
  analysisId: string | null
) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!analysisId) {
      console.log('useWebSocket: No analysis ID provided');
      setConnected(false);
      return;
    }

    console.log('useWebSocket: Setting up connection with analysis ID:', analysisId);

    // Handle connection status updates
    const handleConnectionStatus = (status: { status: string }) => {
      console.log('useWebSocket: Connection status update:', status);
      setConnected(status.status === 'connected');
    };

    // Subscribe to connection status updates
    websocketService.subscribe('connection_status', handleConnectionStatus);

    // Subscribe to the specific event type
    websocketService.subscribe(eventType, callback);

    // Set the analysis ID to initiate connection
    websocketService.setAnalysisId(analysisId);

    // Cleanup function
    return () => {
      console.log('useWebSocket: Cleaning up subscriptions');
      websocketService.unsubscribe('connection_status', handleConnectionStatus);
      websocketService.unsubscribe(eventType, callback);
      
      // Only disconnect if this was the last subscriber
      if (analysisId) {
        websocketService.disconnect();
      }
    };
  }, [eventType, callback, analysisId]); // Re-run effect if these dependencies change

  return { connected };
};

export default useWebSocket;
