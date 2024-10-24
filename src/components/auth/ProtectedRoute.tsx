'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService';
import { AuthGuardProps, AuthUser } from '../../types/auth';

export function ProtectedRoute({
  children,
  roles,
  redirectTo = '/login',
  fallback = null,
}: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getUser();
      const isAuthenticated = authService.isAuthenticated();
      const token = authService.getToken();

      // Debug: Log auth state
      console.log('ProtectedRoute auth check:', {
        isAuthenticated,
        token,
        user,
        requiredRoles: roles,
        currentPath: window.location.pathname,
      });

      if (!isAuthenticated || !user) {
        console.log('Not authenticated, redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }

      if (roles && !roles.includes(user.role)) {
        console.log('User role not authorized:', {
          userRole: user.role,
          requiredRoles: roles,
        });
        router.push(redirectTo);
        return;
      }

      // Debug: Log successful authorization
      console.log('User authorized:', {
        userId: user.id,
        role: user.role,
        path: window.location.pathname,
      });

      setIsAuthorized(true);
    };

    try {
      checkAuth();
    } catch (error) {
      console.error('Auth check error:', error);
      router.push(redirectTo);
    } finally {
      setIsLoading(false);
    }
  }, [roles, redirectTo, router]);

  // Debug: Log component state
  useEffect(() => {
    console.log('ProtectedRoute state:', {
      isAuthorized,
      isLoading,
      currentPath: window.location.pathname,
    });
  }, [isAuthorized, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return fallback;
  }

  return <>{children}</>;
}
