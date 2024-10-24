# Phase 3: Background Tasks Implementation

## Overview
Implement the background task system for handling long-running operations like AI analysis and data processing.

## Components

### 1. Task Queue System
```python
# app/background/queue.py
from redis import Redis
from typing import Dict, Any

class TaskQueue:
    def __init__(self):
        self.redis = Redis.from_url(settings.REDIS_URL)
    
    async def enqueue(
        self,
        task_type: str,
        task_data: Dict[str, Any]
    ) -> str:
        """
        Add task to queue
        """
        try:
            task_id = generate_task_id()
            await self.redis.lpush(
                f"tasks:{task_type}",
                json.dumps({
                    "id": task_id,
                    "data": task_data,
                    "status": "pending",
                    "created_at": datetime.utcnow().isoformat()
                })
            )
            return task_id
        except Exception as e:
            await self._handle_error(e)
    
    async def get_next_task(
        self,
        task_type: str
    ) -> Dict[str, Any]:
        """
        Get next task from queue
        """
        try:
            task = await self.redis.rpop(f"tasks:{task_type}")
            if task:
                return json.loads(task)
            return None
        except Exception as e:
            await self._handle_error(e)
```

### 2. Task Workers
```python
# app/background/workers.py
class AnalysisWorker:
    def __init__(self):
        self.queue = TaskQueue()
        self.ai_service = AIService()
    
    async def process_task(self, task: Dict[str, Any]):
        """
        Process analysis task
        """
        try:
            # 1. Update status
            await self._update_status(task["id"], "processing")
            
            # 2. Perform analysis
            result = await self.ai_service.analyze(
                task["data"]["analysis_id"]
            )
            
            # 3. Generate report
            report = await self._generate_report(result)
            
            # 4. Update status
            await self._update_status(
                task["id"],
                "completed",
                {"report_id": report.id}
            )
            
            # 5. Send notification
            await self._notify_completion(task["id"])
        except Exception as e:
            await self._handle_error(task["id"], e)
```

### 3. Progress Tracking
```python
# app/background/progress.py
class ProgressTracker:
    def __init__(self):
        self.redis = Redis.from_url(settings.REDIS_URL)
    
    async def update_progress(
        self,
        task_id: str,
        progress: float,
        status: str = None,
        metadata: Dict[str, Any] = None
    ):
        """
        Update task progress
        """
        try:
            await self.redis.hset(
                f"progress:{task_id}",
                mapping={
                    "progress": progress,
                    "status": status or "processing",
                    "metadata": json.dumps(metadata or {}),
                    "updated_at": datetime.utcnow().isoformat()
                }
            )
            
            # Notify progress update
            await self._notify_progress(task_id, progress, status)
        except Exception as e:
            logger.error(f"Error updating progress: {str(e)}")
    
    async def get_progress(
        self,
        task_id: str
    ) -> Dict[str, Any]:
        """
        Get task progress
        """
        try:
            progress = await self.redis.hgetall(f"progress:{task_id}")
            if progress:
                return {
                    "progress": float(progress[b"progress"]),
                    "status": progress[b"status"].decode(),
                    "metadata": json.loads(progress[b"metadata"]),
                    "updated_at": progress[b"updated_at"].decode()
                }
            return None
        except Exception as e:
            logger.error(f"Error getting progress: {str(e)}")
            return None
```

### 4. Task Scheduler
```python
# app/background/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

class TaskScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.queue = TaskQueue()
    
    async def start(self):
        """
        Start the scheduler
        """
        # Add scheduled tasks
        self.scheduler.add_job(
            self._process_pending_tasks,
            'interval',
            minutes=1
        )
        
        self.scheduler.add_job(
            self._cleanup_old_tasks,
            'cron',
            hour=0
        )
        
        self.scheduler.start()
    
    async def _process_pending_tasks(self):
        """
        Process pending tasks
        """
        try:
            tasks = await self.queue.get_pending_tasks()
            for task in tasks:
                await self._process_task(task)
        except Exception as e:
            logger.error(f"Error processing pending tasks: {str(e)}")
    
    async def _cleanup_old_tasks(self):
        """
        Clean up old tasks
        """
        try:
            threshold = datetime.utcnow() - timedelta(days=7)
            await self.queue.cleanup_old_tasks(threshold)
        except Exception as e:
            logger.error(f"Error cleaning up old tasks: {str(e)}")
```

### 5. Task Recovery
```python
# app/background/recovery.py
class TaskRecovery:
    def __init__(self):
        self.queue = TaskQueue()
        self.progress_tracker = ProgressTracker()
    
    async def recover_stuck_tasks(self):
        """
        Recover stuck tasks
        """
        try:
            # Find stuck tasks
            stuck_tasks = await self._find_stuck_tasks()
            
            for task in stuck_tasks:
                # Attempt recovery
                await self._recover_task(task)
        except Exception as e:
            logger.error(f"Error recovering tasks: {str(e)}")
    
    async def _recover_task(self, task: Dict[str, Any]):
        """
        Recover a single task
        """
        try:
            # 1. Check task state
            current_state = await self._get_task_state(task["id"])
            
            # 2. Determine recovery action
            action = await self._determine_recovery_action(
                task,
                current_state
            )
            
            # 3. Execute recovery
            await self._execute_recovery(task["id"], action)
            
            # 4. Log recovery
            await self._log_recovery(task["id"], action)
        except Exception as e:
            logger.error(f"Error recovering task {task['id']}: {str(e)}")
```

## Success Criteria

1. Task queue system implemented and tested
2. Workers processing tasks correctly
3. Progress tracking working
4. Task scheduler running
5. Recovery system handling failures
6. Proper error handling and logging

## Next Steps

1. Implement caching layer
2. Add monitoring and alerting
3. Set up performance optimization
4. Add comprehensive testing
5. Update documentation
