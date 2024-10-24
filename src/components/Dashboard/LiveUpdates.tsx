import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ProcessUpdate, getStatusColor } from '../../types/analysis';
import useWebSocket from '../../hooks/useWebSocket';

interface LiveUpdatesProps {
  analysisId: string;
}

export const LiveUpdates: React.FC<LiveUpdatesProps> = ({ analysisId }) => {
  const [updates, setUpdates] = useState<ProcessUpdate[]>([]);
  const { connected } = useWebSocket('analysis_update', (update: ProcessUpdate) => {
    console.log('LiveUpdates: Received update:', update);
    if (update.analysisId === analysisId) {
      setUpdates(prev => [...prev, update]);
    }
  }, analysisId);

  useEffect(() => {
    // Clear updates when analysis ID changes
    setUpdates([]);
  }, [analysisId]);

  if (!analysisId) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Live Updates</h3>
        <p className="text-gray-500">No analysis in progress</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Live Updates</h3>
      <div className="space-y-2">
        {!connected && (
          <div className="text-yellow-600">
            Connecting to analysis {analysisId}...
          </div>
        )}
        {connected && updates.length === 0 && (
          <p className="text-gray-500">Waiting for updates...</p>
        )}
        {updates.map((update, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm">{update.message}</span>
            <Badge variant={getStatusColor(update.status) as any}>
              {update.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
