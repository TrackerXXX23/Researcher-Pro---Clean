from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel

class ReportBase(BaseModel):
    title: str
    content: Dict[str, Any]
    analysis_id: int

class ReportCreate(ReportBase):
    pass

class ReportUpdate(ReportBase):
    pass

class ReportInDBBase(ReportBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Report(ReportInDBBase):
    pass
