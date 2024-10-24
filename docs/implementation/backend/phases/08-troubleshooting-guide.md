# Backend Troubleshooting Guide

## Overview
This guide provides solutions for common issues that may arise during FastAPI implementation, migration, and operation.

## Common Issues and Solutions

### 1. Database Connection Issues

#### Symptom: Connection Pool Exhaustion
```python
# Error: Too many database connections
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) FATAL: remaining connection slots are reserved for non-replication superuser connections
```

**Solution:**
```python
# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

def get_engine():
    return create_engine(
        settings.DATABASE_URL,
        poolclass=QueuePool,
        pool_size=20,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=1800
    )

# Monitor connection usage
async def check_pool_health():
    engine = get_engine()
    pool = engine.pool
    
    if pool.checkedin() + pool.checked_out() > pool.size * 0.8:
        logger.warning("Connection pool nearing capacity")
```

#### Symptom: Stale Connections
```python
# Error: Connection timed out
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) server closed the connection unexpectedly
```

**Solution:**
```python
# app/db/health.py
class ConnectionHealthCheck:
    async def check_connections(self):
        try:
            async with self.Session() as session:
                # Test query
                await session.execute(text("SELECT 1"))
        except Exception:
            # Reset connection pool
            await self.reset_pool()
    
    async def reset_pool(self):
        engine = get_engine()
        engine.dispose()
        logger.info("Connection pool reset")
```

### 2. Cache Issues

#### Symptom: Cache Inconsistency
```python
# Error: Cached data doesn't match database
AssertionError: Cached value differs from database value
```

**Solution:**
```python
# app/cache/validation.py
class CacheValidator:
    async def validate_cache(
        self,
        key: str,
        db_value: Any
    ):
        cached_value = await self.cache.get(key)
        
        if cached_value != db_value:
            # Log inconsistency
            logger.warning(f"Cache inconsistency for key: {key}")
            
            # Update cache
            await self.cache.set(key, db_value)
            
            # Track incident
            await self.track_inconsistency(key)
```

#### Symptom: Cache Memory Issues
```python
# Error: Redis used memory exceeds threshold
MemoryError: Used memory exceeds maximum memory
```

**Solution:**
```python
# app/cache/memory.py
class CacheMemoryManager:
    async def check_memory(self):
        info = await self.redis.info()
        used_memory = info['used_memory']
        max_memory = info['maxmemory']
        
        if used_memory > max_memory * 0.8:
            # Implement eviction
            await self.evict_least_used()
    
    async def evict_least_used(self):
        # Get least used keys
        keys = await self.redis.zrange(
            'keyspace_hits',
            0,
            100,
            withscores=True
        )
        
        # Remove least used
        for key, _ in keys:
            await self.redis.delete(key)
```

### 3. Task Processing Issues

#### Symptom: Stuck Tasks
```python
# Error: Tasks remain in 'processing' state
TimeoutError: Task processing exceeded maximum time
```

**Solution:**
```python
# app/background/recovery.py
class TaskRecoveryManager:
    async def recover_stuck_tasks(self):
        # Find stuck tasks
        stuck_tasks = await self.find_stuck_tasks()
        
        for task in stuck_tasks:
            # Check if truly stuck
            if await self.is_truly_stuck(task):
                # Reset task
                await self.reset_task(task)
                
                # Requeue if needed
                await self.requeue_if_needed(task)
    
    async def is_truly_stuck(self, task):
        # Check last update time
        last_update = await self.get_last_update(task)
        
        # Check process existence
        process_exists = await self.check_process(task)
        
        return (
            time.time() - last_update > settings.TASK_TIMEOUT
            and not process_exists
        )
```

#### Symptom: Task Queue Buildup
```python
# Error: Too many pending tasks
OverflowError: Task queue exceeds maximum size
```

**Solution:**
```python
# app/background/queue.py
class QueueManager:
    async def manage_queue(self):
        queue_size = await self.get_queue_size()
        
        if queue_size > settings.MAX_QUEUE_SIZE:
            # Implement backpressure
            await self.apply_backpressure()
            
            # Scale workers if possible
            await self.scale_workers()
    
    async def apply_backpressure(self):
        # Temporarily reject new tasks
        await self.set_accept_tasks(False)
        
        # Notify monitoring
        await self.notify_queue_pressure()
```

### 4. WebSocket Issues

#### Symptom: Connection Drops
```python
# Error: WebSocket connection closed unexpectedly
WebSocketDisconnect: code = 1006 (connection closed abnormally)
```

**Solution:**
```python
# app/websocket/connection.py
class WebSocketManager:
    async def handle_connection(
        self,
        websocket: WebSocket,
        client_id: str
    ):
        try:
            await websocket.accept()
            
            # Set keep-alive
            await self.setup_keepalive(websocket)
            
            while True:
                try:
                    data = await websocket.receive_text()
                    await self.process_message(data)
                except WebSocketDisconnect:
                    await self.handle_disconnect(client_id)
                    break
        except Exception as e:
            await self.handle_error(e, client_id)
    
    async def setup_keepalive(self, websocket):
        while True:
            try:
                await asyncio.sleep(30)
                await websocket.send_text('ping')
            except Exception:
                break
```

#### Symptom: Message Queue Overflow
```python
# Error: Too many pending messages
OverflowError: WebSocket message queue full
```

**Solution:**
```python
# app/websocket/messages.py
class MessageManager:
    async def handle_message_overflow(
        self,
        client_id: str
    ):
        # Get queue size
        queue_size = await self.get_queue_size(client_id)
        
        if queue_size > settings.MAX_QUEUE_SIZE:
            # Implement message batching
            await self.batch_messages(client_id)
            
            # Clear old messages if needed
            await self.clear_old_messages(client_id)
```

### 5. Performance Issues

#### Symptom: High Response Times
```python
# Error: Response time exceeds threshold
PerformanceWarning: Response time > 1000ms
```

**Solution:**
```python
# app/monitoring/performance.py
class PerformanceMonitor:
    async def check_performance(
        self,
        endpoint: str,
        response_time: float
    ):
        if response_time > settings.MAX_RESPONSE_TIME:
            # Log incident
            await self.log_performance_issue(
                endpoint,
                response_time
            )
            
            # Check system resources
            await self.check_resources()
            
            # Implement caching if possible
            await self.suggest_caching(endpoint)
```

## Preventive Measures

### 1. Health Checks
```python
# app/health/checks.py
class HealthChecker:
    async def run_health_checks(self):
        try:
            # Check database
            await self.check_database()
            
            # Check cache
            await self.check_cache()
            
            # Check task queue
            await self.check_task_queue()
            
            # Check WebSocket connections
            await self.check_websockets()
        except Exception as e:
            await self.handle_health_check_failure(e)
```

### 2. Monitoring Alerts
```python
# app/monitoring/alerts.py
class AlertManager:
    async def check_thresholds(self):
        # Check system metrics
        metrics = await self.get_system_metrics()
        
        for metric, value in metrics.items():
            if value > self.thresholds[metric]:
                await self.send_alert(
                    metric,
                    value,
                    self.thresholds[metric]
                )
```

This troubleshooting guide provides solutions for common issues and helps maintain system stability during implementation and operation.
