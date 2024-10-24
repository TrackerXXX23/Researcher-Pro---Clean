from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class AnalysisBase(BaseModel):
    """Base Analysis model"""
    title: str
    description: str
    research_topic: str
    parameters: Optional[Dict[str, Any]] = None

class AnalysisCreate(AnalysisBase):
    """Analysis creation model"""
    pass

class AnalysisUpdate(BaseModel):
    """Analysis update model"""
    title: Optional[str] = None
    description: Optional[str] = None
    research_topic: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    progress: Optional[float] = None

class Analysis(AnalysisBase):
    """Complete Analysis model"""
    id: int
    status: str  # pending, researching, analyzing, completed, failed
    progress: float  # 0.0 to 1.0
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        orm_mode = True
