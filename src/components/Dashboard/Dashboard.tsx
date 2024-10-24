import React, { useState } from 'react';
import { StartNewAnalysis } from './StartNewAnalysis';
import { AnalysisProcess } from './AnalysisProcess';
import { LiveUpdates } from './LiveUpdates';
import { Card } from '../ui/card';

export const Dashboard: React.FC = () => {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  const handleAnalysisStart = (analysisId: string) => {
    console.log('Starting analysis with ID:', analysisId);
    setCurrentAnalysisId(analysisId);
  };

  const handleAnalysisComplete = () => {
    console.log('Analysis completed');
    setCurrentAnalysisId(null);
  };

  const handleAnalysisError = (error: Error) => {
    console.error('Analysis error:', error);
    setCurrentAnalysisId(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Research Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <StartNewAnalysis onAnalysisStart={handleAnalysisStart} />
        </div>
        
        <div>
          {currentAnalysisId && (
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Current Analysis</h2>
              <AnalysisProcess
                analysisId={currentAnalysisId}
                onComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8">
        {currentAnalysisId && (
          <LiveUpdates analysisId={currentAnalysisId} />
        )}
      </div>
    </div>
  );
};
