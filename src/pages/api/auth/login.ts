import { NextApiRequest, NextApiResponse } from 'next';
import { LoginCredentials, ApiAuthResponse, ApiErrorResponse } from '../../../types/auth';

// In a real application, this would be stored in a database
const MOCK_USER = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const,
  password: 'test123', // In a real app, this would be hashed
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiAuthResponse | ApiErrorResponse>
) {
  // Debug: Log request
  console.log('Login request:', {
    method: req.method,
    body: req.body,
    headers: req.headers,
  });

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED',
      },
    });
  }

  try {
    const { email, password } = req.body as LoginCredentials;

    // Debug: Log credentials (remove in production)
    console.log('Login attempt:', { email, password });

    // Basic validation
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS',
        },
      });
    }

    // Check credentials
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      // Generate token payload
      const tokenPayload = {
        userId: MOCK_USER.id,
        email: MOCK_USER.email,
        role: MOCK_USER.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now in seconds
        iat: Math.floor(Date.now() / 1000), // Issued at time in seconds
      };

      // Convert to JSON string
      const tokenStr = JSON.stringify(tokenPayload);
      
      // Convert to base64url
      const token = Buffer.from(tokenStr).toString('base64url');

      // Debug: Log token generation
      console.log('Generated token:', {
        payload: tokenPayload,
        tokenStr,
        token,
        decodedBack: Buffer.from(token, 'base64url').toString('utf-8'),
      });

      const response: ApiAuthResponse = {
        success: true,
        data: {
          user: {
            id: MOCK_USER.id,
            email: MOCK_USER.email,
            name: MOCK_USER.name,
            role: MOCK_USER.role,
          },
          access_token: token,
        },
      };

      // Debug: Log successful response
      console.log('Login successful:', response);

      return res.status(200).json(response);
    }

    // Debug: Log failed attempt
    console.log('Invalid credentials:', { email });

    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      },
    });
  } catch (error) {
    // Debug: Log error
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
