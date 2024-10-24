'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';
import { LoginCredentials } from '../../types/auth';
import { authService } from '../../services/authService';

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [debugInfo, setDebugInfo] = React.useState<any>(null);
  const [credentials, setCredentials] = React.useState<LoginCredentials>({
    email: 'test@example.com', // Pre-fill for testing
    password: 'test123',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Debug: Log pre-login state
      console.log('Pre-login auth state:', {
        isAuthenticated: authService.isAuthenticated(),
        token: authService.getToken(),
        user: authService.getUser(),
      });

      const response = await authService.login(credentials);
      
      // Debug: Log response and post-login state
      console.log('Login response:', response);
      console.log('Post-login auth state:', {
        isAuthenticated: authService.isAuthenticated(),
        token: authService.getToken(),
        user: authService.getUser(),
      });

      setDebugInfo({
        response,
        authState: {
          isAuthenticated: authService.isAuthenticated(),
          token: authService.getToken(),
          user: authService.getUser(),
        }
      });

      // Verify token is set before redirecting
      if (!authService.getToken()) {
        throw new Error('Token not set after login');
      }

      // Redirect to dashboard instead of test page
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* Debug Information */}
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium mb-2">Debug Information</h3>
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a
            href="/signup"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign up
          </a>
        </p>
      </Card>
    </div>
  );
}
