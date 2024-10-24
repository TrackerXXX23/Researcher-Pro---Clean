# Backend Security Guide

## Overview
This guide outlines security best practices and implementation details for the FastAPI backend.

## Security Components

### 1. Authentication System
```python
# app/security/auth.py
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

class AuthenticationManager:
    def __init__(self):
        self.pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto"
        )
        self.oauth2_scheme = OAuth2PasswordBearer(
            tokenUrl="token"
        )
    
    async def authenticate_user(
        self,
        username: str,
        password: str
    ):
        """
        Authenticate user
        """
        try:
            # Get user
            user = await self.get_user(username)
            
            if not user:
                return False
            
            # Verify password
            if not self.verify_password(
                password,
                user.hashed_password
            ):
                return False
            
            return user
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return False
    
    def create_access_token(
        self,
        data: dict,
        expires_delta: timedelta = None
    ):
        """
        Create JWT token
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        
        to_encode.update({"exp": expire})
        
        return jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
```

### 2. Authorization System
```python
# app/security/authorization.py
from fastapi import Security, HTTPException
from typing import List

class AuthorizationManager:
    async def check_permissions(
        self,
        user: User,
        required_permissions: List[str]
    ):
        """
        Check user permissions
        """
        try:
            # Get user permissions
            user_permissions = await self.get_user_permissions(
                user.id
            )
            
            # Check required permissions
            for permission in required_permissions:
                if permission not in user_permissions:
                    raise HTTPException(
                        status_code=403,
                        detail="Not enough permissions"
                    )
            
            return True
        except Exception as e:
            logger.error(f"Authorization error: {str(e)}")
            raise HTTPException(
                status_code=403,
                detail="Authorization failed"
            )
```

### 3. Rate Limiting
```python
# app/security/rate_limit.py
from fastapi import Request, HTTPException
import time

class RateLimiter:
    def __init__(self):
        self.requests = {}
        self.window_size = 60  # 1 minute
        self.max_requests = 100
    
    async def check_rate_limit(
        self,
        request: Request
    ):
        """
        Check rate limit for request
        """
        try:
            # Get client IP
            client_ip = request.client.host
            
            # Get current time
            current_time = time.time()
            
            # Clean old requests
            await self.clean_old_requests(current_time)
            
            # Check requests count
            if await self.is_rate_limited(
                client_ip,
                current_time
            ):
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests"
                )
            
            # Record request
            await self.record_request(
                client_ip,
                current_time
            )
        except Exception as e:
            logger.error(f"Rate limit error: {str(e)}")
            raise
```

### 4. Input Validation
```python
# app/security/validation.py
from pydantic import BaseModel, validator
from typing import List, Optional

class SecurityValidator:
    @validator("password")
    def password_strength(cls, v):
        """
        Validate password strength
        """
        if len(v) < 8:
            raise ValueError("Password too short")
        
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain uppercase")
        
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain lowercase")
        
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain number")
        
        return v
    
    @validator("email")
    def email_format(cls, v):
        """
        Validate email format
        """
        # Add email validation logic
        if "@" not in v:
            raise ValueError("Invalid email format")
        
        return v
```

### 5. SQL Injection Prevention
```python
# app/security/sql.py
from sqlalchemy import text
from typing import List, Any

class SQLSecurityManager:
    async def safe_execute(
        self,
        query: str,
        params: dict
    ):
        """
        Execute SQL safely
        """
        try:
            # Use parameterized queries
            async with self.Session() as session:
                result = await session.execute(
                    text(query),
                    params
                )
                return result
        except Exception as e:
            logger.error(f"SQL error: {str(e)}")
            raise
```

### 6. XSS Prevention
```python
# app/security/xss.py
import html
from typing import Any

class XSSProtection:
    def sanitize_input(self, data: Any) -> Any:
        """
        Sanitize input data
        """
        if isinstance(data, str):
            return html.escape(data)
        elif isinstance(data, dict):
            return {
                k: self.sanitize_input(v)
                for k, v in data.items()
            }
        elif isinstance(data, list):
            return [
                self.sanitize_input(item)
                for item in data
            ]
        return data
```

### 7. CORS Configuration
```python
# app/security/cors.py
from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    """
    Configure CORS
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
```

### 8. Security Headers
```python
# app/security/headers.py
from fastapi import Response
from typing import Dict

class SecurityHeaders:
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """
        Get security headers
        """
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }

    async def add_security_headers(
        self,
        response: Response
    ):
        """
        Add security headers to response
        """
        headers = self.get_security_headers()
        for key, value in headers.items():
            response.headers[key] = value
```

### 9. Audit Logging
```python
# app/security/audit.py
from datetime import datetime
from typing import Dict, Any

class AuditLogger:
    async def log_action(
        self,
        user_id: str,
        action: str,
        details: Dict[str, Any]
    ):
        """
        Log security-relevant action
        """
        try:
            await self.db.audit_logs.insert_one({
                "user_id": user_id,
                "action": action,
                "details": details,
                "timestamp": datetime.utcnow(),
                "ip_address": self.get_ip_address(),
                "user_agent": self.get_user_agent()
            })
        except Exception as e:
            logger.error(f"Audit logging error: {str(e)}")
```

## Security Best Practices

### 1. Password Storage
- Use bcrypt for password hashing
- Implement password strength requirements
- Regular password rotation
- Secure password reset flow

### 2. API Security
- Use HTTPS only
- Implement rate limiting
- Validate all input
- Use proper authentication
- Implement proper authorization

### 3. Data Protection
- Encrypt sensitive data
- Implement proper access controls
- Regular security audits
- Secure backup procedures

### 4. Monitoring
- Log security events
- Monitor for suspicious activity
- Set up alerts
- Regular security reviews

This security guide provides comprehensive protection for the FastAPI backend while maintaining usability and performance.
