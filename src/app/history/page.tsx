"use client"

import React, { useEffect, useState } from 'react';
import { ProcessedData } from '@/interfaces';

export default function HistoryPage() {
  const [history, setHistory] = useState<ProcessedData[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analysis History</h1>
      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow p-4"
          >
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-gray-600">{item.date}</p>
            <span className={`inline-block px-2 py-1 rounded text-sm ${
              item.status === 'completed' ? 'bg-green-100 text-green-800' :
              item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
