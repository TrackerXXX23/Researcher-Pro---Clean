'use client';

import React from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { AnalysisProcess } from '../../components/Dashboard/AnalysisProcess';
import { LiveUpdates } from '../../components/Dashboard/LiveUpdates';
import { GeneratedReports } from '../../components/Dashboard/GeneratedReports';
import { useToast } from '../../components/ui/use-toast';
import { AnalysisFormData, ProcessUpdate } from '../../types/analysis';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { authService } from '../../services/authService';
import AuthTest from './auth-test';

function TestPage() {
  const [analysisId, setAnalysisId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [authState, setAuthState] = React.useState<any>(null);
  const { toast } = useToast();

  // Update auth state periodically
  React.useEffect(() => {
    const updateAuthState = () => {
      const state = {
        isAuthenticated: authService.isAuthenticated(),
        token: authService.getToken(),
        user: authService.getUser(),
      };
      setAuthState(state);
      console.log('Current auth state:', state);
    };

    // Initial update
    updateAuthState();

    // Update every 5 seconds
    const interval = setInterval(updateAuthState, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStartAnalysis = async () => {
    setIsLoading(true);
    const testData: AnalysisFormData = {
      topic: 'Test Analysis',
      analysisDepth: 'detailed',
      clientSegment: 'enterprise',
      jurisdiction: 'global',
      industryType: 'technology',
      outputType: 'report',
    };

    try {
      // Debug: Log auth state
      console.log('Auth state:', {
        isAuthenticated: authService.isAuthenticated(),
        token: authService.getToken(),
        user: authService.getUser(),
      });

      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      };

      // Debug: Log request headers
      console.log('Request headers:', headers);

      const response = await fetch('/api/start-analysis', {
        method: 'POST',
        headers,
        body: JSON.stringify(testData),
      });

      // Debug: Log response
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start analysis');
      }

      setAnalysisId(data.analysisId);
      toast({
        title: 'Analysis Started',
        description: 'Analysis process has been initiated',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start analysis',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessComplete = () => {
    toast({
      title: 'Analysis Complete',
      description: 'The analysis process has finished successfully',
    });
  };

  const handleProcessError = (error: Error) => {
    toast({
      title: 'Analysis Error',
      description: error.message,
      variant: 'destructive',
    });
  };

  const handleUpdate = (update: ProcessUpdate) => {
    if (update.error) {
      toast({
        title: 'Process Error',
        description: update.error,
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Analysis System Test</h1>
        <Button onClick={handleLogout} variant="ghost">
          Logout
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Auth Test */}
        <AuthTest />

        {/* Auth State */}
        <Card className="p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </Card>

        {/* Analysis Control */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Control</h2>
          <Button 
            onClick={handleStartAnalysis} 
            disabled={!!analysisId || isLoading}
            isLoading={isLoading}
          >
            Start Test Analysis
          </Button>
        </Card>

        {/* Analysis Process */}
        {analysisId && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Progress</h2>
            <AnalysisProcess
              analysisId={analysisId}
              onComplete={handleProcessComplete}
              onError={handleProcessError}
            />
          </Card>
        )}

        {/* Live Updates */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Live Updates</h2>
          <LiveUpdates
            analysisId={analysisId || undefined}
            onUpdate={handleUpdate}
          />
        </Card>

        {/* Generated Reports */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generated Reports</h2>
          <GeneratedReports searchQuery={searchQuery} />
        </Card>
      </div>
    </div>
  );
}

// Wrap the page with ProtectedRoute
export default function ProtectedTestPage() {
  return (
    <ProtectedRoute>
      <TestPage />
    </ProtectedRoute>
  );
}
