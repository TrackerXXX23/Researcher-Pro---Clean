from celery import Task
from sqlalchemy.orm import Session

from app.core.tasks import celery_app
from app.db.base import SessionLocal
from app.services.research_service import get_research_service

class BaseTask(Task):
    abstract = True

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        # Log error and update task status in database
        print(f"Task {task_id} failed: {exc}")
        super().on_failure(exc, task_id, args, kwargs, einfo)

    def on_success(self, retval, task_id, args, kwargs):
        # Update task status in database
        print(f"Task {task_id} completed successfully")
        super().on_success(retval, task_id, args, kwargs)

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        # Close database session
        if hasattr(self, 'db'):
            self.db.close()

@celery_app.task(base=BaseTask)
def process_analysis_task(analysis_id: int) -> dict:
    """
    Process analysis in background.
    """
    db: Session = SessionLocal()
    try:
        research_service = get_research_service(db)
        return research_service.process_analysis(analysis_id)
    finally:
        db.close()

def start_worker():
    """Start Celery worker."""
    argv = [
        'worker',
        '--loglevel=INFO',
        '--pool=solo'  # Use solo pool for simpler setup
    ]
    celery_app.worker_main(argv)

if __name__ == '__main__':
    start_worker()
