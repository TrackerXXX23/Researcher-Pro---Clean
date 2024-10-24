'use client';

import React from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { AnalysisProcess } from './AnalysisProcess';
import { LiveUpdates } from './LiveUpdates';
import { GeneratedReports } from './GeneratedReports';
import { StartNewAnalysis } from './StartNewAnalysis';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';

export function Dashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAnalysisStart = (topic: string) => {
    // Handle starting new analysis here
    toast({
      title: "Analysis Started",
      description: `Starting analysis for topic: ${topic}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Research Dashboard</h1>
        <div className="max-w-md">
          <Input
            type="text"
            placeholder="Search analyses..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Analysis</h2>
          <AnalysisProcess />
          <LiveUpdates />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generated Reports</h2>
          <GeneratedReports searchQuery={searchQuery} />
        </Card>
      </div>

      <div className="mt-6">
        <StartNewAnalysis onAnalysisStart={handleAnalysisStart} />
      </div>
    </div>
  );
}
