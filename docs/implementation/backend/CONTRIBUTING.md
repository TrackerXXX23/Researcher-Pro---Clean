# Contributing to Researcher Pro Backend

## Overview
This guide outlines the process for contributing to the FastAPI backend implementation of Researcher Pro. We welcome contributions that improve functionality, performance, security, or documentation.

## Getting Started

### 1. Development Environment
```bash
# Fork and clone the repository
git clone <your-fork-url>
cd researcher-pro

# Install dependencies
poetry install

# Set up pre-commit hooks
pre-commit install

# Copy environment template
cp .env.example .env
```

### 2. Code Style
We follow these coding standards:

```python
# Example of proper code style
from typing import Optional, List
from pydantic import BaseModel

class AnalysisRequest(BaseModel):
    """
    Request model for analysis endpoint.
    
    Attributes:
        template_id: ID of the analysis template
        parameters: Analysis parameters
        options: Optional analysis options
    """
    template_id: str
    parameters: dict
    options: Optional[List[str]] = None

async def process_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks
) -> dict:
    """
    Process analysis request.
    
    Args:
        request: Analysis request data
        background_tasks: Background task manager
        
    Returns:
        Dict containing analysis ID and status
        
    Raises:
        ValidationError: If request data is invalid
        ProcessingError: If analysis fails
    """
    try:
        analysis_id = await start_analysis(request)
        background_tasks.add_task(
            process_analysis_task,
            analysis_id
        )
        return {
            "analysis_id": analysis_id,
            "status": "processing"
        }
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise
```

## Development Process

### 1. Create Feature Branch
```bash
# Create branch
git checkout -b feature/your-feature-name

# Keep branch updated
git fetch origin
git rebase origin/main
```

### 2. Development Workflow
```python
# 1. Write tests first
# tests/api/test_feature.py
@pytest.mark.asyncio
async def test_new_feature():
    # Arrange
    test_data = {"param": "value"}
    
    # Act
    response = await client.post(
        "/api/v1/new-feature",
        json=test_data
    )
    
    # Assert
    assert response.status_code == 200
    assert "result" in response.json()

# 2. Implement feature
# app/api/v1/feature.py
@router.post("/new-feature")
async def new_feature(
    request: FeatureRequest,
    service: FeatureService = Depends()
):
    result = await service.process_feature(request)
    return result

# 3. Run tests
pytest tests/api/test_feature.py
```

### 3. Code Quality Checks
```bash
# Run all checks
./scripts/check-code.sh

# Individual checks
flake8 app tests
mypy app tests
black app tests
isort app tests
bandit -r app
```

## Testing Requirements

### 1. Unit Tests
```python
# Example unit test
class TestFeatureService:
    @pytest.mark.asyncio
    async def test_process_feature(self):
        # Arrange
        service = FeatureService()
        test_data = {"param": "value"}
        
        # Act
        result = await service.process_feature(test_data)
        
        # Assert
        assert result.status == "success"
```

### 2. Integration Tests
```python
# Example integration test
@pytest.mark.asyncio
async def test_feature_flow():
    # 1. Start process
    response = await client.post(
        "/api/v1/feature/start",
        json=test_data
    )
    feature_id = response.json()["id"]
    
    # 2. Check progress
    response = await client.get(
        f"/api/v1/feature/{feature_id}"
    )
    assert response.json()["status"] in ["processing", "completed"]
```

## Documentation Requirements

### 1. Code Documentation
```python
class FeatureService:
    """
    Service for handling feature operations.
    
    This service provides functionality for:
    - Processing feature requests
    - Managing feature state
    - Handling feature-specific operations
    
    Example:
        ```python
        service = FeatureService()
        result = await service.process_feature(data)
        ```
    """
    
    async def process_feature(
        self,
        data: dict
    ) -> FeatureResult:
        """
        Process feature request.
        
        Args:
            data: Feature request data
            
        Returns:
            Processed feature result
            
        Raises:
            ValidationError: If data is invalid
            ProcessingError: If processing fails
        """
        pass
```

### 2. API Documentation
```python
@router.post("/feature")
async def create_feature(
    request: FeatureRequest,
    service: FeatureService = Depends()
):
    """
    Create new feature.
    
    Args:
        request: Feature creation request
        service: Feature service instance
        
    Returns:
        Created feature details
        
    Raises:
        HTTPException: If creation fails
        
    Example:
        ```bash
        curl -X POST http://localhost:8000/api/v1/feature \
            -H "Content-Type: application/json" \
            -d '{"name": "test", "options": ["1", "2"]}'
        ```
    """
    pass
```

## Pull Request Process

### 1. Prepare Changes
```bash
# Update documentation
# Update CHANGELOG.md
# Run all tests
pytest

# Check code quality
./scripts/check-code.sh

# Commit changes
git add .
git commit -m "feat: Add new feature"
```

### 2. Submit PR
- Create detailed PR description
- Link related issues
- Include test results
- Add documentation updates
- Request review

### 3. Review Process
- Address review comments
- Update tests if needed
- Keep PR focused
- Maintain clean commit history

## Release Process

### 1. Version Update
```bash
# Update version
poetry version patch  # or minor/major

# Update CHANGELOG.md
# Update documentation
```

### 2. Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] PR reviewed and approved

## Support

### Getting Help
1. Check [FAQ](FAQ.md)
2. Review [Troubleshooting Guide](phases/08-troubleshooting-guide.md)
3. Ask in team chat
4. Create issue

### Reporting Issues
- Use issue templates
- Provide clear steps to reproduce
- Include relevant logs
- Add system information

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Focus on constructive feedback
- Maintain professional conduct
- Support team members

### Enforcement
- Report violations to team leads
- Follow escalation process
- Maintain confidentiality

This contribution guide helps maintain high-quality code and effective collaboration. Follow these guidelines to ensure your contributions are successful.
