# Frequently Asked Questions (FAQ)

## General Questions

### Q: Why FastAPI instead of keeping Next.js API routes?
A: FastAPI was chosen for several reasons:
1. Better handling of long-running processes
2. Built-in async support
3. Automatic API documentation
4. Better performance for complex operations
5. More robust middleware system
6. Better separation of concerns

### Q: How does the migration process work?
A: The migration follows a phased approach:
1. Set up FastAPI alongside existing Next.js backend
2. Gradually move functionality
3. Use feature flags for controlled migration
4. Maintain backward compatibility
See [Migration Guide](phases/06-migration-guide.md) for details.

## Development Questions

### Q: How do I add a new API endpoint?
A: Follow these steps:
```python
# 1. Create route in appropriate file (e.g., app/api/v1/analysis.py)
from fastapi import APIRouter, Depends
from app.services.analysis_service import AnalysisService

router = APIRouter()

@router.post("/analysis/new-endpoint")
async def new_endpoint(
    request: RequestModel,
    service: AnalysisService = Depends()
):
    result = await service.process_request(request)
    return result

# 2. Add request/response models
# app/schemas/analysis.py
class RequestModel(BaseModel):
    parameter: str
    options: List[str]

# 3. Add service method
# app/services/analysis_service.py
async def process_request(self, request: RequestModel):
    # Implementation
    pass

# 4. Add tests
# tests/api/test_analysis.py
async def test_new_endpoint():
    response = await client.post(
        "/api/v1/analysis/new-endpoint",
        json={"parameter": "test", "options": ["1", "2"]}
    )
    assert response.status_code == 200
```

### Q: How do I handle long-running tasks?
A: Use the background task system:
```python
from fastapi import BackgroundTasks

@router.post("/analysis/start")
async def start_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks
):
    # Queue the task
    background_tasks.add_task(
        process_analysis,
        request.analysis_id
    )
    return {"status": "processing"}
```

### Q: How do I implement real-time updates?
A: Use WebSocket connections:
```python
@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str
):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Process data
            await manager.send_personal_message(
                client_id,
                {"status": "processing"}
            )
    except WebSocketDisconnect:
        await manager.disconnect(client_id)
```

## Database Questions

### Q: How do I add a new database model?
A: Follow these steps:
```python
# 1. Create model
# app/db/models/new_model.py
from sqlalchemy import Column, String
from app.db.base import Base

class NewModel(Base):
    __tablename__ = "new_models"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)

# 2. Create migration
# alembic revision --autogenerate -m "Add new model"
# alembic upgrade head

# 3. Add repository
# app/repositories/new_model.py
class NewModelRepository:
    async def create(self, data: dict):
        model = NewModel(**data)
        self.db.add(model)
        await self.db.commit()
        return model
```

### Q: How do I optimize database queries?
A: Several approaches:
1. Use proper indexing
2. Implement caching
3. Use query optimization:
```python
# Example: Optimized query
query = (
    select(Model)
    .options(joinedload(Model.related))
    .where(Model.id == model_id)
)
```

## Caching Questions

### Q: How do I implement caching?
A: Use the cache manager:
```python
from app.cache.manager import cache_manager

# Cache data
await cache_manager.set(
    key="cache_key",
    value=data,
    ttl=3600  # 1 hour
)

# Get cached data
cached = await cache_manager.get("cache_key")
```

### Q: How do I handle cache invalidation?
A: Use the cache invalidation system:
```python
# Invalidate specific key
await cache_manager.invalidate("cache_key")

# Invalidate pattern
await cache_manager.invalidate_pattern("prefix:*")

# Invalidate all
await cache_manager.invalidate_all()
```

## Testing Questions

### Q: How do I write tests for async code?
A: Use pytest.mark.asyncio:
```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    result = await async_function()
    assert result == expected_result
```

### Q: How do I mock external services?
A: Use pytest fixtures:
```python
@pytest.fixture
def mock_openai():
    with patch("app.services.ai_service.openai") as mock:
        mock.ChatCompletion.create.return_value = {
            "choices": [{"message": {"content": "test"}}]
        }
        yield mock

async def test_ai_service(mock_openai):
    service = AIService()
    result = await service.analyze("test")
    assert result == expected_result
```

## Security Questions

### Q: How do I implement authentication?
A: Use the authentication system:
```python
from app.core.security import auth

@router.post("/secure")
async def secure_endpoint(
    user = Depends(auth.get_current_user)
):
    return {"message": "authenticated"}
```

### Q: How do I handle sensitive data?
A: Follow these guidelines:
1. Use environment variables for secrets
2. Encrypt sensitive data
3. Use secure headers
4. Implement proper access control
5. Regular security audits

## Performance Questions

### Q: How do I handle high concurrency?
A: Several strategies:
1. Use connection pooling
2. Implement caching
3. Use background tasks
4. Optimize database queries
5. Scale horizontally

### Q: How do I monitor performance?
A: Use the monitoring system:
```python
from app.core.monitoring import monitor

@monitor.track_performance
async def performance_critical_function():
    # Implementation
    pass
```

## Deployment Questions

### Q: How do I deploy to production?
A: Follow the [Deployment Guide](phases/07-deployment-guide.md):
1. Build Docker image
2. Configure environment
3. Run migrations
4. Deploy services
5. Monitor health

### Q: How do I handle database migrations in production?
A: Use Alembic with care:
1. Always backup before migrating
2. Test migrations in staging
3. Use transaction rollback
4. Monitor migration progress

For more detailed information on any topic, refer to the specific documentation in the [phases](phases/) directory.
