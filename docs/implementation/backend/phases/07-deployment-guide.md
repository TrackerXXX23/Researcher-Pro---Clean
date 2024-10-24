# Backend Deployment Guide

## Overview
This guide outlines the process of deploying the FastAPI backend in a production environment, including setup, configuration, and maintenance procedures.

## Infrastructure Setup

### 1. Docker Configuration
```dockerfile
# Dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev --no-interaction --no-ansi

# Copy application code
COPY ./app ./app

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/dbname
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dbname
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Database Setup

### 1. Migrations
```python
# app/db/migrations/env.py
from alembic import context
from app.db.base import Base
from app.core.config import settings

config = context.config
target_metadata = Base.metadata

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = create_engine(settings.DATABASE_URL)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()
```

### 2. Backup Configuration
```python
# app/db/backup.py
class DatabaseBackup:
    async def create_backup(self):
        """
        Create database backup
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = f"/backups/db_{timestamp}.sql"
            
            # Run pg_dump
            process = await asyncio.create_subprocess_shell(
                f"pg_dump -U {settings.DB_USER} -d {settings.DB_NAME} > {backup_path}",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            await process.communicate()
            
            # Upload to storage
            await self._upload_backup(backup_path)
            
            return backup_path
        except Exception as e:
            logger.error(f"Backup failed: {str(e)}")
            raise
```

## Security Configuration

### 1. SSL Setup
```python
# app/core/security.py
ssl_context = ssl.create_default_context(
    purpose=ssl.Purpose.CLIENT_AUTH
)
ssl_context.load_cert_chain(
    certfile=settings.SSL_CERT_FILE,
    keyfile=settings.SSL_KEY_FILE
)
```

### 2. CORS Configuration
```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Monitoring Setup

### 1. Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fastapi'
    static_configs:
      - targets: ['api:8000']
```

### 2. Grafana Dashboard
```json
{
  "dashboard": {
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      }
    ]
  }
}
```

## CI/CD Pipeline

### 1. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and test
        run: |
          poetry install
          poetry run pytest
      
      - name: Build Docker image
        run: docker build -t app:latest .
      
      - name: Deploy to production
        run: |
          echo "${{ secrets.KUBECONFIG }}" > kubeconfig.yaml
          kubectl --kubeconfig=kubeconfig.yaml apply -f k8s/
```

### 2. Kubernetes Configuration
```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: app:latest
          ports:
            - containerPort: 8000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
```

## Maintenance Procedures

### 1. Database Maintenance
```python
# app/maintenance/database.py
class DatabaseMaintenance:
    async def perform_maintenance(self):
        """
        Perform database maintenance
        """
        try:
            # 1. Create backup
            await self.create_backup()
            
            # 2. Vacuum database
            await self.vacuum_database()
            
            # 3. Update statistics
            await self.update_statistics()
            
            # 4. Check indexes
            await self.check_indexes()
        except Exception as e:
            logger.error(f"Maintenance failed: {str(e)}")
            raise
```

### 2. Cache Maintenance
```python
# app/maintenance/cache.py
class CacheMaintenance:
    async def cleanup_cache(self):
        """
        Clean up cache
        """
        try:
            # 1. Remove expired entries
            await self.remove_expired()
            
            # 2. Check memory usage
            await self.check_memory()
            
            # 3. Optimize if needed
            await self.optimize_if_needed()
        except Exception as e:
            logger.error(f"Cache cleanup failed: {str(e)}")
            raise
```

## Deployment Checklist

1. **Pre-deployment**
   - Run tests
   - Check dependencies
   - Verify configurations
   - Create backups

2. **Deployment**
   - Deploy database migrations
   - Update application code
   - Restart services
   - Verify health checks

3. **Post-deployment**
   - Monitor metrics
   - Check logs
   - Verify functionality
   - Update documentation

## Rollback Procedures

1. **Application Rollback**
   - Revert code changes
   - Restore previous version
   - Verify functionality

2. **Database Rollback**
   - Restore from backup
   - Verify data integrity
   - Update connections

This deployment guide ensures a smooth and reliable deployment process while maintaining system stability and security.
