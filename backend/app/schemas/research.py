from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel

class ResearchBase(BaseModel):
    query: str
    parameters: Optional[Dict[str, Any]] = None

class ResearchCreate(ResearchBase):
    pass

class ResearchUpdate(ResearchBase):
    pass

class ResearchInDBBase(ResearchBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Research(ResearchInDBBase):
    pass
