'use client';

import React from 'react';
import { Card } from '../../components/ui/card';
import { AnalysisDTO } from '../../types/analysis';
import { useToast } from '../../components/ui/use-toast';
import { analysisService } from '../../services/analysisService';

interface GeneratedReportsProps {
  searchQuery: string;
}

export function GeneratedReports({ searchQuery }: GeneratedReportsProps) {
  const [reports, setReports] = React.useState<AnalysisDTO[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const loadReports = async () => {
      try {
        const analyses = await analysisService.getAnalyses();
        setReports(analyses);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load reports',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [toast]);

  const filteredReports = reports.filter((report) =>
    report.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (filteredReports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reports found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredReports.map((report) => (
        <Card key={report.id} className="p-4">
          <h3 className="font-medium">{report.query}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Created: {new Date(report.created_at).toLocaleDateString()}
          </p>
          {report.results && (
            <div className="mt-2">
              <p className="text-sm line-clamp-2">{JSON.stringify(report.results)}</p>
            </div>
          )}
          <div className="mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                report.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : report.status === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {report.status}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
