from sqlalchemy import Boolean, Column, String, JSON, DateTime
from sqlalchemy.sql import func
from ..db.base_class import Base

class Template(Base):
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    parameters = Column(JSON)
    prompts = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
