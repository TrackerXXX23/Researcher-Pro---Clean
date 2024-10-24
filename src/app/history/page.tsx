'use client';

import { useEffect, useState } from 'react';
import { AnalysisDTO } from '../../types/analysis';
import { analysisService } from '../../services/analysisService';
import { useToast } from '../../components/ui/use-toast';
import { Card } from '../../components/ui/card';

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const analyses = await analysisService.getAnalyses();
        setHistory(analyses);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load analysis history',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Analysis History</h1>
        <p className="text-gray-600">No analyses found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Analysis History</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {history.map((analysis) => (
          <Card key={analysis.id} className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg">{analysis.query}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  analysis.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : analysis.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {analysis.status}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Created: {new Date(analysis.created_at).toLocaleDateString()}
            </div>
            {analysis.results && (
              <div className="mt-2">
                <p className="text-sm line-clamp-2">
                  {JSON.stringify(analysis.results)}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
