from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "researcher_pro",
    broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/1",
    backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/2"
)

celery_app.conf.task_routes = {
    "app.worker.analyze_research": "research",
    "app.worker.generate_report": "reports"
}

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
