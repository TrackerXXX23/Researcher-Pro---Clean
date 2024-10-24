from functools import wraps
import time
import asyncio
from typing import Callable, Any
from .metrics import metrics
from .cache import cache
import logging

logger = logging.getLogger(__name__)

def measure_performance(operation_type: str):
    """Decorator to measure operation performance."""
    def decorator(func: Callable):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                metrics.record_task_execution(
                    operation_type,
                    "success",
                    duration
                )
                return result
            except Exception as e:
                duration = time.time() - start_time
                metrics.record_task_execution(
                    operation_type,
                    "failed",
                    duration
                )
                logger.error(
                    f"Error in {operation_type}: {str(e)}",
                    exc_info=True
                )
                raise

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                metrics.record_task_execution(
                    operation_type,
                    "success",
                    duration
                )
                return result
            except Exception as e:
                duration = time.time() - start_time
                metrics.record_task_execution(
                    operation_type,
                    "failed",
                    duration
                )
                logger.error(
                    f"Error in {operation_type}: {str(e)}",
                    exc_info=True
                )
                raise

        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

def measure_db_query(query_type: str):
    """Decorator to measure database query performance."""
    def decorator(func: Callable):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                metrics.record_db_query(query_type, duration)
                return result
            except Exception as e:
                logger.error(
                    f"Database error in {query_type}: {str(e)}",
                    exc_info=True
                )
                raise

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                metrics.record_db_query(query_type, duration)
                return result
            except Exception as e:
                logger.error(
                    f"Database error in {query_type}: {str(e)}",
                    exc_info=True
                )
                raise

        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

def cache_with_metrics(cache_type: str, expire: int = 3600):
    """Decorator to add cache metrics."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            try:
                # Try to get from cache
                cached_result = await cache.get(cache_key)
                if cached_result is not None:
                    metrics.record_cache_operation("hit", cache_type)
                    return cached_result
                
                metrics.record_cache_operation("miss", cache_type)
                
                # Execute function
                result = await func(*args, **kwargs)
                
                # Cache result
                await cache.set(cache_key, result, expire=expire)
                return result
                
            except Exception as e:
                logger.error(
                    f"Cache error in {cache_type}: {str(e)}",
                    exc_info=True
                )
                # If cache fails, just execute the function
                return await func(*args, **kwargs)
                
        return wrapper
    return decorator
