# Development Workflow Guide

## Overview
This guide outlines the development workflow and best practices for contributing to the FastAPI backend implementation.

## Development Environment Setup

### 1. Local Environment
```bash
# Clone repository
git clone <repository-url>
cd researcher-pro

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies with poetry
poetry install

# Set up pre-commit hooks
pre-commit install

# Copy environment template
cp .env.example .env
```

### 2. Environment Configuration
```python
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/researcher_pro
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-api-key
PERPLEXITY_API_KEY=your-api-key
```

## Development Workflow

### 1. Feature Development Process
```python
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Implement feature
# Example: New analysis endpoint
from fastapi import APIRouter, Depends
from app.services.analysis_service import AnalysisService

router = APIRouter()

@router.post("/analysis/new-feature")
async def new_feature(
    request: FeatureRequest,
    service: AnalysisService = Depends()
):
    """
    Implementation following best practices:
    - Type hints
    - Dependency injection
    - Error handling
    - Documentation
    """
    try:
        result = await service.process_feature(request)
        return result
    except Exception as e:
        handle_error(e)

# 3. Write tests
# tests/api/test_new_feature.py
async def test_new_feature(test_client):
    response = await test_client.post(
        "/api/v1/analysis/new-feature",
        json=test_data
    )
    assert response.status_code == 200
    assert "result" in response.json()

# 4. Run tests
pytest tests/api/test_new_feature.py

# 5. Commit changes
git add .
git commit -m "feat: Add new analysis feature"

# 6. Push changes
git push origin feature/your-feature-name
```

### 2. Code Review Process
```python
# Pre-review checklist:
# 1. Run all tests
pytest

# 2. Run linter
flake8

# 3. Run type checker
mypy .

# 4. Update documentation
# Example: Update API documentation
"""
New Analysis Feature
---
tags:
  - Analysis
parameters:
  - name: request
    in: body
    required: true
    schema:
      $ref: '#/definitions/FeatureRequest'
responses:
  200:
    description: Feature processed successfully
    schema:
      $ref: '#/definitions/FeatureResponse'
"""
```

### 3. Testing Guidelines
```python
# app/tests/conftest.py
import pytest
from typing import Generator

@pytest.fixture
def test_data() -> dict:
    """
    Provide test data following best practices:
    - Isolated test data
    - Clear setup and teardown
    - Meaningful test cases
    """
    return {
        "parameter": "test_value",
        "options": ["option1", "option2"]
    }

@pytest.fixture
async def mock_service() -> Generator:
    """
    Mock service following best practices:
    - Proper async/await usage
    - Clear mock behavior
    - Resource cleanup
    """
    service = MockService()
    yield service
    await service.cleanup()
```

### 4. Documentation Guidelines
```python
# Example: Service documentation
class AnalysisService:
    """
    Service for processing analysis requests.
    
    Follows documentation best practices:
    - Clear class/method descriptions
    - Type hints
    - Example usage
    - Error handling details
    
    Example:
        ```python
        service = AnalysisService()
        result = await service.process_analysis(data)
        ```
    
    Attributes:
        db: Database session
        cache: Cache manager
        config: Service configuration
    """
    
    async def process_analysis(
        self,
        data: AnalysisData
    ) -> AnalysisResult:
        """
        Process analysis request.
        
        Args:
            data: Analysis request data
            
        Returns:
            Processed analysis result
            
        Raises:
            ValidationError: If data is invalid
            ProcessingError: If analysis fails
        """
        pass
```

## Best Practices

### 1. Code Style
```python
# Follow PEP 8 and project-specific guidelines
from typing import Dict, List, Optional

class ExampleClass:
    """
    Example class showing style guidelines.
    """
    
    def __init__(
        self,
        parameter: str,
        options: Optional[List[str]] = None
    ):
        self.parameter = parameter
        self.options = options or []
    
    async def process_data(
        self,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process data following style guidelines.
        """
        try:
            result = await self._internal_process(data)
            return result
        except Exception as e:
            logger.error(f"Processing error: {str(e)}")
            raise
```

### 2. Error Handling
```python
# app/core/errors.py
from typing import Optional

class AppError(Exception):
    """
    Base error class following best practices:
    - Clear error hierarchy
    - Proper error information
    - Logging integration
    """
    
    def __init__(
        self,
        message: str,
        code: Optional[str] = None
    ):
        super().__init__(message)
        self.code = code
        logger.error(
            f"Error {code}: {message}",
            exc_info=True
        )
```

### 3. Performance Considerations
```python
# Example: Optimized query
from sqlalchemy import select
from sqlalchemy.orm import joinedload

async def get_analysis_data(
    self,
    analysis_id: str
) -> Optional[Analysis]:
    """
    Get analysis data following performance best practices:
    - Proper indexing
    - Efficient queries
    - Caching consideration
    """
    # Check cache first
    cached = await self.cache.get(f"analysis:{analysis_id}")
    if cached:
        return cached
    
    # Efficient database query
    query = (
        select(Analysis)
        .options(joinedload(Analysis.results))
        .where(Analysis.id == analysis_id)
    )
    
    result = await self.db.execute(query)
    analysis = result.scalar_one_or_none()
    
    # Cache result
    if analysis:
        await self.cache.set(
            f"analysis:{analysis_id}",
            analysis,
            ttl=3600
        )
    
    return analysis
```

### 4. Security Practices
```python
# Example: Secure endpoint
from fastapi import Security
from app.core.security import auth

@router.post("/secure-endpoint")
async def secure_endpoint(
    request: SecureRequest,
    user: User = Security(auth.get_current_user)
):
    """
    Secure endpoint following security best practices:
    - Authentication
    - Authorization
    - Input validation
    - Secure data handling
    """
    # Validate permissions
    if not await auth.has_permission(user, "required_permission"):
        raise NotAuthorizedError()
    
    # Sanitize input
    clean_data = sanitize_input(request.dict())
    
    # Process securely
    result = await process_secure_data(clean_data)
    
    # Return safe response
    return sanitize_output(result)
```

## Contribution Guidelines

1. **Branch Naming**
   - feature/feature-name
   - fix/bug-description
   - refactor/component-name

2. **Commit Messages**
   - feat: Add new feature
   - fix: Fix specific issue
   - refactor: Improve code structure
   - docs: Update documentation

3. **Pull Request Process**
   - Create descriptive PR
   - Include tests
   - Update documentation
   - Address review comments

4. **Code Review Checklist**
   - Functionality
   - Test coverage
   - Documentation
   - Performance
   - Security

This workflow guide ensures consistent and high-quality contributions to the FastAPI backend.
