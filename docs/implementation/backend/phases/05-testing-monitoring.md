# Phase 5: Testing and Monitoring Implementation

## Overview
Implement comprehensive testing infrastructure and monitoring systems to ensure reliability and performance.

## Components

### 1. Test Infrastructure
```python
# app/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.db.base import Base
from app.main import app

@pytest.fixture(scope="session")
def engine():
    """
    Create test database engine
    """
    return create_engine(settings.TEST_DATABASE_URL)

@pytest.fixture(scope="session")
def TestingSessionLocal(engine):
    """
    Create test database session
    """
    return sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )

@pytest.fixture(scope="function")
async def db_session(TestingSessionLocal):
    """
    Create test database session for each test
    """
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()

@pytest.fixture(scope="module")
def test_client():
    """
    Create test client
    """
    with TestClient(app) as client:
        yield client
```

### 2. Service Tests
```python
# app/tests/services/test_ai_service.py
import pytest
from app.services.ai_service import AIService

class TestAIService:
    @pytest.mark.asyncio
    async def test_analysis_creation(self, db_session):
        service = AIService(db_session)
        result = await service.create_analysis(test_data)
        assert result.status == "success"
        assert result.analysis_id is not None

    @pytest.mark.asyncio
    async def test_analysis_processing(self, db_session):
        service = AIService(db_session)
        result = await service.process_analysis(test_analysis_id)
        assert result.status == "completed"
        assert result.insights is not None

    @pytest.mark.asyncio
    async def test_error_handling(self, db_session):
        service = AIService(db_session)
        with pytest.raises(ValidationError):
            await service.create_analysis(invalid_data)
```

### 3. API Tests
```python
# app/tests/api/test_analysis_endpoints.py
import pytest
from fastapi.testclient import TestClient

class TestAnalysisAPI:
    def test_start_analysis(self, test_client: TestClient):
        response = test_client.post(
            "/api/v1/analysis/start",
            json=test_request_data
        )
        assert response.status_code == 200
        assert "analysis_id" in response.json()

    def test_get_analysis(self, test_client: TestClient):
        response = test_client.get(
            f"/api/v1/analysis/{test_analysis_id}"
        )
        assert response.status_code == 200
        assert response.json()["status"] in ["pending", "processing", "completed"]

    def test_invalid_request(self, test_client: TestClient):
        response = test_client.post(
            "/api/v1/analysis/start",
            json=invalid_request_data
        )
        assert response.status_code == 422
```

### 4. Integration Tests
```python
# app/tests/integration/test_analysis_flow.py
import pytest
import asyncio
from app.services.ai_service import AIService
from app.services.research_service import ResearchService

class TestAnalysisFlow:
    @pytest.mark.asyncio
    async def test_complete_analysis_flow(
        self,
        db_session,
        test_client
    ):
        # 1. Start analysis
        response = test_client.post(
            "/api/v1/analysis/start",
            json=test_request_data
        )
        analysis_id = response.json()["analysis_id"]

        # 2. Wait for completion
        while True:
            status = test_client.get(
                f"/api/v1/analysis/{analysis_id}"
            ).json()["status"]
            if status == "completed":
                break
            await asyncio.sleep(1)

        # 3. Verify results
        result = test_client.get(
            f"/api/v1/analysis/{analysis_id}/results"
        )
        assert result.status_code == 200
        assert "insights" in result.json()
```

### 5. Performance Tests
```python
# app/tests/performance/test_api_performance.py
import pytest
import asyncio
from time import time

class TestAPIPerformance:
    @pytest.mark.asyncio
    async def test_concurrent_requests(
        self,
        test_client
    ):
        # Create multiple concurrent requests
        start_time = time()
        tasks = [
            test_client.post(
                "/api/v1/analysis/start",
                json=test_request_data
            )
            for _ in range(100)
        ]
        responses = await asyncio.gather(*tasks)
        end_time = time()

        # Verify performance
        assert end_time - start_time < 10  # Max 10 seconds
        assert all(r.status_code == 200 for r in responses)
```

### 6. Monitoring Setup
```python
# app/monitoring/setup.py
from prometheus_client import Counter, Histogram, Gauge
import logging

class MonitoringSystem:
    def __init__(self):
        # Metrics
        self.request_count = Counter(
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status']
        )
        
        self.request_latency = Histogram(
            'http_request_duration_seconds',
            'HTTP request latency',
            ['method', 'endpoint']
        )
        
        self.active_tasks = Gauge(
            'active_tasks',
            'Number of active tasks',
            ['task_type']
        )
        
        # Logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Alerts
        self.alert_manager = AlertManager()

    async def track_request(
        self,
        method: str,
        endpoint: str,
        status: int,
        duration: float
    ):
        """
        Track API request
        """
        self.request_count.labels(
            method=method,
            endpoint=endpoint,
            status=status
        ).inc()
        
        self.request_latency.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)

    async def update_task_count(
        self,
        task_type: str,
        count: int
    ):
        """
        Update active task count
        """
        self.active_tasks.labels(
            task_type=task_type
        ).set(count)
```

### 7. Alert System
```python
# app/monitoring/alerts.py
from typing import Dict, Any
import aiosmtplib
from email.message import EmailMessage

class AlertManager:
    def __init__(self):
        self.thresholds = {
            "error_rate": 0.05,  # 5% error rate
            "latency": 1.0,      # 1 second
            "task_queue": 100    # 100 pending tasks
        }

    async def check_metrics(
        self,
        metrics: Dict[str, Any]
    ):
        """
        Check metrics against thresholds
        """
        try:
            # Check error rate
            if metrics["error_rate"] > self.thresholds["error_rate"]:
                await self.send_alert(
                    "High Error Rate",
                    f"Error rate: {metrics['error_rate']}"
                )

            # Check latency
            if metrics["avg_latency"] > self.thresholds["latency"]:
                await self.send_alert(
                    "High Latency",
                    f"Average latency: {metrics['avg_latency']}s"
                )

            # Check task queue
            if metrics["pending_tasks"] > self.thresholds["task_queue"]:
                await self.send_alert(
                    "Task Queue Alert",
                    f"Pending tasks: {metrics['pending_tasks']}"
                )
        except Exception as e:
            logging.error(f"Alert check failed: {str(e)}")

    async def send_alert(
        self,
        subject: str,
        message: str
    ):
        """
        Send alert email
        """
        try:
            email = EmailMessage()
            email.set_content(message)
            email["Subject"] = f"Alert: {subject}"
            email["From"] = settings.ALERT_EMAIL_FROM
            email["To"] = settings.ALERT_EMAIL_TO

            await aiosmtplib.send(
                email,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USERNAME,
                password=settings.SMTP_PASSWORD,
                use_tls=True
            )
        except Exception as e:
            logging.error(f"Alert sending failed: {str(e)}")
```

## Success Criteria

1. All tests passing and providing good coverage
2. Performance tests meeting benchmarks
3. Monitoring system collecting metrics
4. Alert system functioning properly
5. Logging providing useful information
6. System stability verified

## Next Steps

1. Set up continuous integration
2. Configure production monitoring
3. Implement automated deployments
4. Create maintenance procedures
5. Document testing and monitoring
