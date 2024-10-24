import axios from 'axios';
import {
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  AuthUser,
  ApiAuthResponse,
  ApiErrorResponse,
} from '../types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

class AuthService {
  private static instance: AuthService;
  private user: AuthUser | null = null;
  private token: string | null = null;
  private initialized: boolean = false;

  private constructor() {
    // Don't initialize in constructor to avoid SSR issues
    if (typeof window !== 'undefined') {
      this.initializeAuth();
    }
  }

  private initializeAuth(): void {
    if (this.initialized) return;

    try {
      this.token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        this.user = JSON.parse(userStr);
      }

      // Debug: Log initial state
      console.log('AuthService initialized:', {
        token: this.token,
        user: this.user,
        initialized: true,
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      this.clearSession();
      this.initialized = true;
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private ensureInitialized(): void {
    if (!this.initialized && typeof window !== 'undefined') {
      this.initializeAuth();
    }
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Debug: Log login attempt
      console.log('Login attempt:', { email: credentials.email });

      const response = await axios.post<ApiAuthResponse>(
        '/api/auth/login',
        credentials
      );

      // Debug: Log login response
      console.log('Login response:', response.data);

      const { data } = response.data;

      // Ensure initialization before setting session
      this.ensureInitialized();
      await this.setSession(data);

      // Debug: Log post-login state
      console.log('Post-login state:', {
        token: this.token,
        user: this.user,
        localStorage: {
          token: localStorage.getItem(TOKEN_KEY),
          user: localStorage.getItem(USER_KEY),
        },
      });

      return data;
    } catch (error) {
      // Debug: Log login error
      console.error('Login error:', error);

      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error.message);
      }
      throw new Error('Failed to login');
    }
  }

  public async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<ApiAuthResponse>(
        '/api/auth/signup',
        credentials
      );

      const { data } = response.data;
      this.ensureInitialized();
      await this.setSession(data);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error.message);
      }
      throw new Error('Failed to signup');
    }
  }

  public logout(): void {
    // Debug: Log logout
    console.log('Logging out, previous state:', {
      token: this.token,
      user: this.user,
    });

    this.clearSession();

    // Debug: Log post-logout state
    console.log('Post-logout state:', {
      token: this.token,
      user: this.user,
      localStorage: {
        token: localStorage.getItem(TOKEN_KEY),
        user: localStorage.getItem(USER_KEY),
      },
    });
  }

  public isAuthenticated(): boolean {
    this.ensureInitialized();
    const isAuth = !!this.token;
    // Debug: Log auth check
    console.log('Auth check:', {
      isAuthenticated: isAuth,
      token: this.token,
      user: this.user,
      initialized: this.initialized,
    });
    return isAuth;
  }

  public getToken(): string | null {
    this.ensureInitialized();
    // Debug: Log token retrieval
    console.log('Getting token:', {
      memoryToken: this.token,
      storageToken: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
      initialized: this.initialized,
    });
    return this.token;
  }

  public getUser(): AuthUser | null {
    this.ensureInitialized();
    return this.user;
  }

  private async setSession(authResponse: AuthResponse): Promise<void> {
    // Debug: Log session setting
    console.log('Setting session:', authResponse);

    this.token = authResponse.access_token;
    this.user = authResponse.user;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(TOKEN_KEY, authResponse.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));

        // Debug: Verify storage
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        console.log('Session stored:', {
          storedToken,
          storedUser,
          memoryToken: this.token,
          memoryUser: this.user,
        });

        // Verify token was stored correctly
        if (storedToken !== authResponse.access_token) {
          throw new Error('Token storage verification failed');
        }
      } catch (error) {
        console.error('Failed to store session:', error);
        throw error;
      }
    }
  }

  private clearSession(): void {
    this.token = null;
    this.user = null;

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch (error) {
        console.error('Failed to clear session:', error);
      }
    }
  }

  public getAuthHeaders(): Record<string, string> {
    this.ensureInitialized();
    
    // Debug: Log headers generation
    console.log('Generating auth headers:', {
      hasToken: !!this.token,
      token: this.token,
      initialized: this.initialized,
    });

    // Always return a Record<string, string>
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Debug: Log final headers
    console.log('Generated headers:', headers);

    return headers;
  }

  public async refreshToken(): Promise<void> {
    this.ensureInitialized();
    if (!this.token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<ApiAuthResponse>(
        '/api/auth/refresh',
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );

      const { data } = response.data;
      await this.setSession(data);
    } catch (error) {
      this.clearSession();
      throw new Error('Failed to refresh token');
    }
  }
}

export const authService = AuthService.getInstance();
export const getToken = () => authService.getToken();
