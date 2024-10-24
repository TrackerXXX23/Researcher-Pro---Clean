export type UserRole = 'user' | 'admin';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;  // Changed from token to access_token to match API
}

export type AuthResponseData = AuthResponse;

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  exp: number;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface AuthGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;  // Added fallback prop
}

// API Response types
export interface ApiAuthResponse {
  success: boolean;
  data: AuthResponse;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}
