# Phase 2: API Layer Implementation

## Overview
Implement the FastAPI endpoints and WebSocket support for real-time communication.

## Components

### 1. Analysis Endpoints
```python
# app/api/v1/analysis.py
from fastapi import APIRouter, BackgroundTasks, Depends
from app.services.analysis_service import AnalysisService

router = APIRouter()

@router.post("/analysis/start")
async def start_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    service: AnalysisService = Depends()
):
    """
    Start a new analysis process
    """
    try:
        # 1. Validate request
        await service.validate_request(request)
        
        # 2. Create analysis record
        analysis = await service.create_analysis(request)
        
        # 3. Queue analysis task
        background_tasks.add_task(
            service.process_analysis,
            analysis.id
        )
        
        return {
            "status": "processing",
            "analysis_id": analysis.id
        }
    except Exception as e:
        await handle_api_error(e)

@router.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    service: AnalysisService = Depends()
):
    """
    Get analysis status and results
    """
    try:
        analysis = await service.get_analysis(analysis_id)
        return analysis
    except Exception as e:
        await handle_api_error(e)
```

### 2. Research Endpoints
```python
# app/api/v1/research.py
from fastapi import APIRouter, Depends
from app.services.research_service import ResearchService

router = APIRouter()

@router.post("/research/collect")
async def collect_research(
    parameters: ResearchParameters,
    service: ResearchService = Depends()
):
    """
    Collect research data
    """
    try:
        data = await service.collect_data(parameters)
        return data
    except Exception as e:
        await handle_api_error(e)
```

### 3. Template Endpoints
```python
# app/api/v1/templates.py
from fastapi import APIRouter, Depends
from app.services.template_service import TemplateService

router = APIRouter()

@router.get("/templates")
async def list_templates(
    category: str = None,
    service: TemplateService = Depends()
):
    """
    List available templates
    """
    try:
        templates = await service.list_templates(category)
        return templates
    except Exception as e:
        await handle_api_error(e)

@router.post("/templates/customize")
async def customize_template(
    template_id: str,
    customization: dict,
    service: TemplateService = Depends()
):
    """
    Customize analysis template
    """
    try:
        template = await service.customize_template(
            template_id,
            customization
        )
        return template
    except Exception as e:
        await handle_api_error(e)
```

### 4. WebSocket Support
```python
# app/api/websocket.py
from fastapi import WebSocket
from typing import Dict

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(
        self,
        websocket: WebSocket,
        client_id: str
    ):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    async def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_update(
        self,
        client_id: str,
        data: dict
    ):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(data)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str
):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Process received data
            await manager.send_update(
                client_id,
                {"status": "received", "data": data}
            )
    except WebSocketDisconnect:
        await manager.disconnect(client_id)
```

### 5. API Security
```python
# app/core/security.py
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(
    api_key: str = Security(api_key_header)
):
    if api_key != settings.API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )
    return api_key

# Apply to routes
@router.post("/analysis/start")
async def start_analysis(
    request: AnalysisRequest,
    api_key: str = Depends(verify_api_key)
):
    # Implementation
    pass
```

### 6. Rate Limiting
```python
# app/core/rate_limit.py
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.middleware("http")
async def rate_limit_middleware(
    request: Request,
    call_next
):
    try:
        # Check rate limit
        await limiter.check(request)
        response = await call_next(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=429,
            detail="Too many requests"
        )
```

## API Documentation
```python
# app/main.py
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI()

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Researcher Pro API",
        version="1.0.0",
        description="AI-driven research and analysis platform",
        routes=app.routes,
    )
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

## Success Criteria

1. All API endpoints implemented and tested
2. WebSocket support working correctly
3. API security measures in place
4. Rate limiting functioning
5. API documentation complete
6. Error handling implemented

## Next Steps

1. Implement background tasks
2. Add caching layer
3. Set up monitoring
4. Implement comprehensive testing
5. Add performance optimization
