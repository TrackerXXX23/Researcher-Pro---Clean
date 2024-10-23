'use client';

import React, { useEffect } from 'react';
import { subscribeToUpdates, type LiveUpdate } from '@/lib/socket';

export const LiveUpdates: React.FC = () => {
  const [updates, setUpdates] = React.useState<LiveUpdate[]>([]);

  useEffect(() => {
    const handleLiveUpdate = (update: LiveUpdate) => {
      setUpdates(prev => [update, ...prev].slice(0, 50));
    };

    const cleanup = subscribeToUpdates(
      () => {},
      handleLiveUpdate
    );

    return () => {
      cleanup();
    };
  }, []);

  return (
    <div>
      <div className="section-header">Live Updates</div>
      {updates.length === 0 ? (
        <div className="text-secondary">No updates yet</div>
      ) : (
        <div className="space-y-2">
          {updates.map((update) => (
            <div key={update.id} className="update-item">
              <div className="update-timestamp">{update.timestamp}</div>
              <div className="update-message">{update.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveUpdates;
