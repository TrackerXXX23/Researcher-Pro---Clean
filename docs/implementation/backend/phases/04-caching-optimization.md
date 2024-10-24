# Phase 4: Caching and Performance Optimization

## Overview
Implement caching strategies and performance optimizations for improved system efficiency.

## Components

### 1. Cache Manager
```python
# app/cache/manager.py
from typing import Any, Optional
from redis import Redis
import json

class CacheManager:
    def __init__(self):
        self.redis = Redis.from_url(settings.REDIS_URL)
    
    async def get(
        self,
        key: str,
        namespace: str = None
    ) -> Optional[Any]:
        """
        Get value from cache
        """
        try:
            full_key = self._get_full_key(key, namespace)
            value = await self.redis.get(full_key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.error(f"Cache get error: {str(e)}")
            return None
    
    async def set(
        self,
        key: str,
        value: Any,
        namespace: str = None,
        ttl: int = None
    ):
        """
        Set value in cache
        """
        try:
            full_key = self._get_full_key(key, namespace)
            await self.redis.set(
                full_key,
                json.dumps(value),
                ex=ttl
            )
        except Exception as e:
            logger.error(f"Cache set error: {str(e)}")
    
    def _get_full_key(
        self,
        key: str,
        namespace: str = None
    ) -> str:
        """
        Generate full cache key
        """
        if namespace:
            return f"{namespace}:{key}"
        return key
```

### 2. Result Caching
```python
# app/cache/results.py
class ResultCache:
    def __init__(self):
        self.cache = CacheManager()
        self.namespace = "results"
    
    async def get_analysis_result(
        self,
        analysis_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get cached analysis result
        """
        return await self.cache.get(
            analysis_id,
            self.namespace
        )
    
    async def cache_analysis_result(
        self,
        analysis_id: str,
        result: Dict[str, Any],
        ttl: int = 3600  # 1 hour
    ):
        """
        Cache analysis result
        """
        await self.cache.set(
            analysis_id,
            result,
            self.namespace,
            ttl
        )
```

### 3. Query Optimization
```python
# app/db/optimization.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

class QueryOptimizer:
    def __init__(self):
        self.engine = create_engine(settings.DATABASE_URL)
        self.Session = sessionmaker(bind=self.engine)
    
    async def optimize_queries(self):
        """
        Optimize database queries
        """
        try:
            with self.Session() as session:
                # Update table statistics
                await session.execute(text("ANALYZE"))
                
                # Update indexes
                await self._update_indexes(session)
                
                # Clean up dead tuples
                await session.execute(text("VACUUM ANALYZE"))
        except Exception as e:
            logger.error(f"Query optimization error: {str(e)}")
    
    async def _update_indexes(self, session):
        """
        Update database indexes
        """
        try:
            # Get index usage statistics
            stats = await session.execute(text("""
                SELECT schemaname, tablename, indexname, idx_scan
                FROM pg_stat_user_indexes
                ORDER BY idx_scan ASC
            """))
            
            # Analyze and update indexes based on usage
            for stat in stats:
                if stat.idx_scan < 100:  # Low usage threshold
                    await self._analyze_index_usage(
                        session,
                        stat.schemaname,
                        stat.tablename,
                        stat.indexname
                    )
        except Exception as e:
            logger.error(f"Index update error: {str(e)}")
```

### 4. Connection Pooling
```python
# app/db/pool.py
from sqlalchemy.engine import create_engine
from sqlalchemy.pool import QueuePool

class ConnectionPool:
    def __init__(self):
        self.engine = create_engine(
            settings.DATABASE_URL,
            poolclass=QueuePool,
            pool_size=20,
            max_overflow=10,
            pool_timeout=30,
            pool_recycle=1800
        )
    
    async def get_connection(self):
        """
        Get database connection from pool
        """
        try:
            return self.engine.connect()
        except Exception as e:
            logger.error(f"Connection pool error: {str(e)}")
            raise
```

### 5. Response Compression
```python
# app/core/compression.py
from fastapi import Response
from gzip import compress
import json

class CompressionMiddleware:
    async def __call__(
        self,
        request: Request,
        call_next
    ) -> Response:
        response = await call_next(request)
        
        if self._should_compress(request, response):
            return await self._compress_response(response)
        
        return response
    
    def _should_compress(
        self,
        request: Request,
        response: Response
    ) -> bool:
        """
        Check if response should be compressed
        """
        return (
            "gzip" in request.headers.get("Accept-Encoding", "").lower()
            and response.headers.get("Content-Type", "").startswith("application/json")
            and len(response.body) > 500  # Minimum size for compression
        )
    
    async def _compress_response(
        self,
        response: Response
    ) -> Response:
        """
        Compress response data
        """
        body = await response.body()
        compressed = compress(body)
        
        return Response(
            content=compressed,
            media_type=response.media_type,
            headers={
                **response.headers,
                "Content-Encoding": "gzip",
                "Content-Length": str(len(compressed))
            }
        )
```

### 6. Performance Monitoring
```python
# app/monitoring/performance.py
from prometheus_client import Counter, Histogram
import time

class PerformanceMonitor:
    def __init__(self):
        self.request_duration = Histogram(
            'request_duration_seconds',
            'Request duration in seconds',
            ['method', 'endpoint']
        )
        self.cache_hits = Counter(
            'cache_hits_total',
            'Cache hit count',
            ['cache_type']
        )
        self.cache_misses = Counter(
            'cache_misses_total',
            'Cache miss count',
            ['cache_type']
        )
    
    async def track_request(
        self,
        method: str,
        endpoint: str,
        duration: float
    ):
        """
        Track request duration
        """
        self.request_duration.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)
    
    async def track_cache(
        self,
        cache_type: str,
        hit: bool
    ):
        """
        Track cache hits/misses
        """
        if hit:
            self.cache_hits.labels(
                cache_type=cache_type
            ).inc()
        else:
            self.cache_misses.labels(
                cache_type=cache_type
            ).inc()
```

## Success Criteria

1. Caching system implemented and working
2. Query optimization improving performance
3. Connection pooling handling load
4. Response compression reducing bandwidth
5. Performance monitoring providing insights
6. System showing measurable improvements

## Next Steps

1. Implement comprehensive testing
2. Add monitoring and alerting
3. Update documentation
4. Fine-tune configurations
5. Set up performance benchmarks
