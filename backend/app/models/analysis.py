from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class Analysis(Base):
    """Analysis model"""
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    research_topic = Column(String)
    parameters = Column(JSON)
    status = Column(String)  # pending, researching, analyzing, completed, failed
    progress = Column(Float)  # 0.0 to 1.0
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("user.id"))

    # Relationships
    user = relationship("User", back_populates="analyses")
