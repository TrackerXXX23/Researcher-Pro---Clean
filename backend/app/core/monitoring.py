from prometheus_client import Counter, Histogram, Gauge
import time
from functools import wraps
from typing import Callable
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Metrics
REQUEST_COUNT = Counter(
    'request_total',
    'Total request count',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'request_latency_seconds',
    'Request latency in seconds',
    ['method', 'endpoint']
)

ACTIVE_REQUESTS = Gauge(
    'active_requests',
    'Number of active requests'
)

ANALYSIS_COUNT = Counter(
    'analysis_total',
    'Total analysis count',
    ['status']
)

ANALYSIS_DURATION = Histogram(
    'analysis_duration_seconds',
    'Analysis duration in seconds'
)

WEBSOCKET_CONNECTIONS = Gauge(
    'websocket_connections',
    'Number of active WebSocket connections'
)

def monitor_request(endpoint: str):
    """Decorator to monitor request metrics."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            method = "GET"  # Default to GET
            if hasattr(args[0], "method"):
                method = args[0].method
            
            start_time = time.time()
            ACTIVE_REQUESTS.inc()
            
            try:
                response = await func(*args, **kwargs)
                status = getattr(response, "status_code", 200)
                REQUEST_COUNT.labels(
                    method=method,
                    endpoint=endpoint,
                    status=status
                ).inc()
                return response
            except Exception as e:
                REQUEST_COUNT.labels(
                    method=method,
                    endpoint=endpoint,
                    status=500
                ).inc()
                logger.error(f"Error in {endpoint}: {str(e)}")
                raise
            finally:
                duration = time.time() - start_time
                REQUEST_LATENCY.labels(
                    method=method,
                    endpoint=endpoint
                ).observe(duration)
                ACTIVE_REQUESTS.dec()
        
        return wrapper
    return decorator

def monitor_analysis():
    """Decorator to monitor analysis metrics."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                ANALYSIS_COUNT.labels(
                    status="success"
                ).inc()
                return result
            except Exception as e:
                ANALYSIS_COUNT.labels(
                    status="failed"
                ).inc()
                logger.error(f"Analysis error: {str(e)}")
                raise
            finally:
                duration = time.time() - start_time
                ANALYSIS_DURATION.observe(duration)
        
        return wrapper
    return decorator

def monitor_websocket():
    """Decorator to monitor WebSocket connections."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            WEBSOCKET_CONNECTIONS.inc()
            
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                WEBSOCKET_CONNECTIONS.dec()
        
        return wrapper
    return decorator
