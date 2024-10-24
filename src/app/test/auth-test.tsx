'use client';

import React from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import { authService } from '../../services/authService';

export default function AuthTest() {
  const { toast } = useToast();
  const [testResults, setTestResults] = React.useState<any[]>([]);

  const addResult = (step: string, data: any) => {
    setTestResults(prev => [...prev, { step, data, timestamp: new Date().toISOString() }]);
  };

  const runLoginTest = async () => {
    try {
      // Step 1: Check initial state
      const initialState = {
        isAuthenticated: authService.isAuthenticated(),
        token: authService.getToken(),
        user: authService.getUser(),
      };
      addResult('Initial State', initialState);

      // Step 2: Attempt login
      const loginResponse = await authService.login({
        email: 'test@example.com',
        password: 'test123',
      });
      addResult('Login Response', loginResponse);

      // Step 3: Check post-login state
      const postLoginState = {
        isAuthenticated: authService.isAuthenticated(),
        token: authService.getToken(),
        user: authService.getUser(),
      };
      addResult('Post-Login State', postLoginState);

      // Step 4: Check auth headers
      const headers = authService.getAuthHeaders();
      addResult('Auth Headers', headers);

      // Step 5: Test API call
      const testResponse = await fetch('/api/start-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          topic: 'Auth Test Analysis',
          analysisDepth: 'detailed',
          clientSegment: 'enterprise',
          jurisdiction: 'global',
          industryType: 'technology',
          outputType: 'report',
        }),
      });

      const testData = await testResponse.json();
      addResult('API Test Response', {
        status: testResponse.status,
        headers: Object.fromEntries(testResponse.headers.entries()),
        data: testData,
      });

      toast({
        title: 'Test Complete',
        description: 'Check the results below',
      });
    } catch (error) {
      console.error('Test error:', error);
      addResult('Error', error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: 'Test Error',
        description: error instanceof Error ? error.message : 'Test failed',
        variant: 'destructive',
      });
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={runLoginTest}>Run Test</Button>
            <Button onClick={clearResults} variant="secondary">Clear Results</Button>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">{result.step}</h3>
                  <div className="text-sm text-gray-500 mb-2">{result.timestamp}</div>
                  <pre className="whitespace-pre-wrap text-sm bg-white p-2 rounded">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
