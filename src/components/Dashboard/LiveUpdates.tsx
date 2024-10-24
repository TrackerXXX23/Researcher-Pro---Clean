'use client';

import React from 'react';
import { Card } from '../ui/card';
import { ProcessUpdate, getStatusColor } from '../../types/analysis';
import { authService } from '../../services/authService';
import { websocketService, WebSocketMessage } from '../../services/websocketService';

interface LiveUpdatesProps {
  analysisId?: number;
  onUpdate?: (update: ProcessUpdate) => void;
}

export function LiveUpdates({ analysisId, onUpdate }: LiveUpdatesProps) {
  const [updates, setUpdates] = React.useState<ProcessUpdate[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const user = authService.getUser();
    if (!user) {
      console.error('LiveUpdates: No user found');
      return;
    }

    // Debug: Log connection attempt
    console.log('LiveUpdates: Connecting to WebSocket:', {
      userId: user.id,
      analysisId,
    });

    const handleMessage = (message: WebSocketMessage) => {
      console.log('LiveUpdates: Received message:', message);

      if (message.type === 'processUpdate') {
        const update = message.data;
        setUpdates((prev) => [...prev, update].slice(-5)); // Keep last 5 updates
        onUpdate?.(update);
      }
    };

    // Connect to WebSocket
    websocketService.connect(user.id.toString())
      .then(() => {
        console.log('LiveUpdates: WebSocket connected');
        setIsConnected(true);
        websocketService.addMessageHandler(handleMessage);
      })
      .catch((error) => {
        console.error('LiveUpdates: WebSocket connection error:', error);
      });

    // Cleanup
    return () => {
      console.log('LiveUpdates: Cleaning up WebSocket connection');
      websocketService.removeMessageHandler(handleMessage);
      websocketService.disconnect();
    };
  }, [analysisId, onUpdate]);

  if (!isConnected) {
    return (
      <div className="text-center py-4 text-gray-500">
        Connecting to analysis updates...
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No live updates available
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {updates.map((update, index) => (
        <Card key={`${update.stepId}-${index}`} className="p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{update.stepId}</p>
              {update.details && (
                <p className="text-sm text-gray-500">{update.details}</p>
              )}
              {update.error && (
                <p className="text-sm text-red-500 mt-1">{update.error}</p>
              )}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
              {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
            </span>
          </div>
          {typeof update.progress === 'number' && (
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  update.status === 'error'
                    ? 'bg-red-600'
                    : update.status === 'completed'
                    ? 'bg-green-600'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${update.progress}%` }}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
