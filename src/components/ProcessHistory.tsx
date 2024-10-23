'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ProcessResult {
  id: number;
  processId: string;
  startTime: string;
  endTime: string;
  status: string;
  reportPath: string | null;
}

const ProcessHistory: React.FC = () => {
  const [processResults, setProcessResults] = useState<ProcessResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProcessResults();
  }, []);

  const fetchProcessResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/process-results');
      setProcessResults(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching process results:', err);
      setError('Failed to fetch process results');
    } finally {
      setLoading(false);
    }
  };

  const viewReport = (processId: string) => {
    window.open(`/api/get-report?processId=${processId}`, '_blank');
  };

  if (loading) return <div>Loading process history...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Process History</h2>
      {processResults.length === 0 ? (
        <p>No process results found.</p>
      ) : (
        <ul>
          {processResults.map((result) => (
            <li key={result.id} className="mb-4 p-4 border rounded">
              <p>Process ID: {result.processId}</p>
              <p>Start Time: {new Date(result.startTime).toLocaleString()}</p>
              <p>End Time: {new Date(result.endTime).toLocaleString()}</p>
              <p>Status: {result.status}</p>
              {result.status === 'completed' && result.reportPath && (
                <button
                  onClick={() => viewReport(result.processId)}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  View Report
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProcessHistory;
