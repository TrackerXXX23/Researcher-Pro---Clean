import redis
from typing import Optional, Any
import json
from app.core.config import settings

# Initialize Redis connection
redis_client = redis.Redis(
    host=settings.REDIS_URL.split('://')[1].split(':')[0],  # Extract host from REDIS_URL
    port=6379,
    db=0,
    decode_responses=True
)

def get_cache(key: str) -> Optional[Any]:
    """Get value from cache"""
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        print(f"Cache error: {str(e)}")
        return None

def set_cache(key: str, value: Any, expire: int = 3600) -> bool:
    """Set value in cache"""
    try:
        redis_client.setex(
            key,
            expire,
            json.dumps(value)
        )
        return True
    except Exception as e:
        print(f"Cache error: {str(e)}")
        return False

def delete_cache(key: str) -> bool:
    """Delete value from cache"""
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        print(f"Cache error: {str(e)}")
        return False
