from datetime import datetime
from typing import Optional, Dict, Any, List

from pydantic import BaseModel

class TemplateBase(BaseModel):
    name: str
    category: str
    parameters: Optional[Dict[str, Any]] = None
    prompts: Optional[List[str]] = None

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(TemplateBase):
    pass

class TemplateInDBBase(TemplateBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Template(TemplateInDBBase):
    pass
