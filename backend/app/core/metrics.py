from prometheus_client import Counter, Histogram, Gauge, Summary
import time
from typing import Dict, Any

# System metrics
SYSTEM_INFO = Gauge(
    'system_info',
    'System information',
    ['version', 'environment']
)

SYSTEM_MEMORY = Gauge(
    'system_memory_bytes',
    'System memory usage in bytes',
    ['type']
)

# API metrics
API_REQUEST_COUNT = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status']
)

API_REQUEST_DURATION = Histogram(
    'api_request_duration_seconds',
    'API request duration in seconds',
    ['method', 'endpoint']
)

# Analysis metrics
ANALYSIS_STATUS = Counter(
    'analysis_status_total',
    'Analysis status counts',
    ['status']
)

ANALYSIS_DURATION = Histogram(
    'analysis_duration_seconds',
    'Analysis duration in seconds',
    ['type']
)

ANALYSIS_QUEUE_SIZE = Gauge(
    'analysis_queue_size',
    'Number of analyses in queue'
)

# Cache metrics
CACHE_HIT_COUNT = Counter(
    'cache_hits_total',
    'Cache hit count',
    ['cache_type']
)

CACHE_MISS_COUNT = Counter(
    'cache_misses_total',
    'Cache miss count',
    ['cache_type']
)

CACHE_SIZE = Gauge(
    'cache_size_bytes',
    'Cache size in bytes',
    ['cache_type']
)

# Database metrics
DB_CONNECTION_COUNT = Gauge(
    'db_connections',
    'Number of active database connections'
)

DB_QUERY_DURATION = Histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    ['query_type']
)

# WebSocket metrics
WS_CONNECTION_COUNT = Gauge(
    'websocket_connections',
    'Number of active WebSocket connections'
)

WS_MESSAGE_COUNT = Counter(
    'websocket_messages_total',
    'Total WebSocket messages',
    ['direction', 'type']
)

# Background task metrics
TASK_STATUS = Counter(
    'background_task_status_total',
    'Background task status counts',
    ['task_type', 'status']
)

TASK_DURATION = Histogram(
    'background_task_duration_seconds',
    'Background task duration in seconds',
    ['task_type']
)

TASK_QUEUE_SIZE = Gauge(
    'background_task_queue_size',
    'Number of tasks in queue',
    ['queue_name']
)

class MetricsCollector:
    @staticmethod
    def record_request(method: str, endpoint: str, status: int, duration: float):
        """Record API request metrics."""
        API_REQUEST_COUNT.labels(
            method=method,
            endpoint=endpoint,
            status=status
        ).inc()
        
        API_REQUEST_DURATION.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)

    @staticmethod
    def record_analysis(analysis_type: str, status: str, duration: float):
        """Record analysis metrics."""
        ANALYSIS_STATUS.labels(status=status).inc()
        ANALYSIS_DURATION.labels(type=analysis_type).observe(duration)

    @staticmethod
    def record_cache_operation(operation: str, cache_type: str):
        """Record cache operation metrics."""
        if operation == "hit":
            CACHE_HIT_COUNT.labels(cache_type=cache_type).inc()
        elif operation == "miss":
            CACHE_MISS_COUNT.labels(cache_type=cache_type).inc()

    @staticmethod
    def record_db_query(query_type: str, duration: float):
        """Record database query metrics."""
        DB_QUERY_DURATION.labels(query_type=query_type).observe(duration)

    @staticmethod
    def record_websocket_message(direction: str, message_type: str):
        """Record WebSocket message metrics."""
        WS_MESSAGE_COUNT.labels(
            direction=direction,
            type=message_type
        ).inc()

    @staticmethod
    def record_task_execution(
        task_type: str,
        status: str,
        duration: float
    ):
        """Record background task metrics."""
        TASK_STATUS.labels(
            task_type=task_type,
            status=status
        ).inc()
        
        TASK_DURATION.labels(task_type=task_type).observe(duration)

metrics = MetricsCollector()
