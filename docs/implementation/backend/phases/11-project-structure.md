# Backend Project Structure

## Overview
This document outlines the organization and structure of the FastAPI backend implementation, explaining how different components work together.

## Directory Structure
```plaintext
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── analysis.py
│   │   │   ├── research.py
│   │   │   ├── reports.py
│   │   │   └── websockets.py
│   │   └── deps.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── events.py
│   ├── db/
│   │   ├── base.py
│   │   ├── session.py
│   │   └── models/
│   │       ├── analysis.py
│   │       ├── research.py
│   │       └── reports.py
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── research_service.py
│   │   ├── report_service.py
│   │   └── template_service.py
│   ├── background/
│   │   ├── tasks.py
│   │   └── workers.py
│   ├── cache/
│   │   ├── manager.py
│   │   └── storage.py
│   ├── security/
│   │   ├── auth.py
│   │   └── permissions.py
│   └── utils/
│       ├── ai.py
│       └── processing.py
├── tests/
│   ├── api/
│   ├── services/
│   └── utils/
├── alembic/
│   └── versions/
└── scripts/
    ├── backup.py
    └── maintenance.py
```

## Component Relationships

### 1. API Layer
```python
# app/api/v1/analysis.py
from fastapi import APIRouter, Depends
from app.services.ai_service import AIService
from app.services.research_service import ResearchService

router = APIRouter()

@router.post("/analysis/start")
async def start_analysis(
    request: AnalysisRequest,
    ai_service: AIService = Depends(),
    research_service: ResearchService = Depends()
):
    """
    API endpoint showing service integration
    """
    # Collect research data
    research_data = await research_service.collect_data(
        request.parameters
    )
    
    # Perform AI analysis
    analysis_result = await ai_service.analyze(
        research_data
    )
    
    return analysis_result
```

### 2. Service Layer
```python
# app/services/ai_service.py
from app.core.config import settings
from app.db.session import Session
from app.cache.manager import CacheManager

class AIService:
    def __init__(
        self,
        db: Session,
        cache: CacheManager
    ):
        self.db = db
        self.cache = cache
    
    async def analyze(
        self,
        data: dict
    ) -> dict:
        """
        Service showing integration with other components
        """
        # Check cache
        cached_result = await self.cache.get(
            self._get_cache_key(data)
        )
        if cached_result:
            return cached_result
        
        # Perform analysis
        result = await self._perform_analysis(data)
        
        # Store in cache
        await self.cache.set(
            self._get_cache_key(data),
            result
        )
        
        # Store in database
        await self._store_result(result)
        
        return result
```

### 3. Background Tasks
```python
# app/background/tasks.py
from app.services.ai_service import AIService
from app.services.report_service import ReportService

class AnalysisTask:
    def __init__(
        self,
        ai_service: AIService,
        report_service: ReportService
    ):
        self.ai_service = ai_service
        self.report_service = report_service
    
    async def process(
        self,
        analysis_id: str
    ):
        """
        Background task showing service integration
        """
        try:
            # Get analysis data
            data = await self._get_analysis_data(analysis_id)
            
            # Perform analysis
            result = await self.ai_service.analyze(data)
            
            # Generate report
            report = await self.report_service.generate(result)
            
            # Update status
            await self._update_status(
                analysis_id,
                "completed",
                report.id
            )
        except Exception as e:
            await self._handle_error(analysis_id, e)
```

### 4. WebSocket Integration
```python
# app/api/websocket.py
from fastapi import WebSocket
from app.services.ai_service import AIService

class WebSocketManager:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service
        self.active_connections = {}
    
    async def connect(
        self,
        websocket: WebSocket,
        client_id: str
    ):
        """
        WebSocket showing service integration
        """
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
        try:
            while True:
                data = await websocket.receive_text()
                
                # Process with AI service
                result = await self.ai_service.process_realtime(
                    data
                )
                
                # Send result back
                await websocket.send_json(result)
        except Exception as e:
            await self._handle_error(client_id, e)
```

## Configuration Management

### 1. Environment Variables
```python
# app/core/config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Researcher Pro"
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External Services
    OPENAI_API_KEY: str
    PERPLEXITY_API_KEY: str
    
    class Config:
        case_sensitive = True
```

### 2. Dependencies
```python
# app/api/deps.py
from fastapi import Depends
from app.db.session import Session
from app.services.ai_service import AIService
from app.cache.manager import CacheManager

async def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()

async def get_cache():
    cache = CacheManager()
    try:
        yield cache
    finally:
        await cache.close()

async def get_ai_service(
    db: Session = Depends(get_db),
    cache: CacheManager = Depends(get_cache)
) -> AIService:
    return AIService(db, cache)
```

## Testing Organization

### 1. Test Structure
```plaintext
tests/
├── conftest.py           # Shared fixtures
├── api/                  # API tests
├── services/             # Service tests
├── background/           # Background task tests
└── integration/          # Integration tests
```

### 2. Test Configuration
```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import Session

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
async def db_session():
    session = Session()
    try:
        yield session
    finally:
        session.close()
```

## Deployment Structure

### 1. Docker Organization
```plaintext
deployment/
├── Dockerfile
├── docker-compose.yml
├── nginx/
│   └── nginx.conf
└── scripts/
    ├── entrypoint.sh
    └── backup.sh
```

### 2. Kubernetes Structure
```plaintext
k8s/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
└── overlays/
    ├── development/
    └── production/
```

This structure provides a clear organization of the backend components while maintaining flexibility for future expansion.
