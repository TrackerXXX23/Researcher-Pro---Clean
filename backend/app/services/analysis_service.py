from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.analysis import Analysis
from app.schemas.analysis import AnalysisCreate, AnalysisUpdate

class AnalysisService:
    def get_analysis(self, db: Session, analysis_id: int) -> Optional[Analysis]:
        return db.query(Analysis).filter(Analysis.id == analysis_id).first()

    def get_user_analyses(self, db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Analysis]:
        return db.query(Analysis).filter(Analysis.user_id == user_id).offset(skip).limit(limit).all()

    def create_analysis(self, db: Session, analysis: AnalysisCreate, user_id: int) -> Analysis:
        db_analysis = Analysis(
            **analysis.dict(),
            user_id=user_id
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        return db_analysis

    def update_analysis(self, db: Session, analysis_id: int, analysis: AnalysisUpdate) -> Optional[Analysis]:
        db_analysis = self.get_analysis(db, analysis_id)
        if db_analysis:
            update_data = analysis.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_analysis, field, value)
            db.commit()
            db.refresh(db_analysis)
        return db_analysis

    def delete_analysis(self, db: Session, analysis_id: int) -> bool:
        db_analysis = self.get_analysis(db, analysis_id)
        if db_analysis:
            db.delete(db_analysis)
            db.commit()
            return True
        return False

analysis_service = AnalysisService()
