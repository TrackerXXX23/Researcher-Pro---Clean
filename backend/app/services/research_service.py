from typing import Optional, List, Dict, Any
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.user import User
from app.core.cache import get_cache, set_cache
from app.services.ai_service import analyze_with_perplexity, analyze_with_openai
from app.api.v1.websockets import notify_analysis_update

class ResearchService:
    def __init__(self, db: Session):
        self.db = db

    async def create_analysis(self, user: User, query: str) -> Analysis:
        """Create a new analysis request."""
        analysis = Analysis(
            user_id=user.id,
            query=query,
            status="pending"
        )
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        
        # Notify user of analysis creation
        await notify_analysis_update(user.id, analysis.id, "pending")
        
        return analysis

    async def get_analysis(self, analysis_id: int) -> Optional[Analysis]:
        """Get analysis by ID."""
        cache_key = f"analysis:{analysis_id}"
        cached = get_cache(cache_key)
        if cached:
            return cached

        analysis = self.db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if analysis:
            set_cache(cache_key, analysis)
        return analysis

    async def list_analyses(
        self, user: User, skip: int = 0, limit: int = 100
    ) -> List[Analysis]:
        """List analyses for a user."""
        return (
            self.db.query(Analysis)
            .filter(Analysis.user_id == user.id)
            .order_by(Analysis.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    async def process_analysis(self, analysis_id: int) -> Dict[str, Any]:
        """Process an analysis request."""
        analysis = await self.get_analysis(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        try:
            # Update status to processing
            analysis.status = "processing"
            self.db.commit()
            await notify_analysis_update(analysis.user_id, analysis.id, "processing")

            # Try Perplexity API first
            try:
                results = await analyze_with_perplexity(analysis.query)
            except Exception as e:
                # Fallback to OpenAI if Perplexity fails
                results = await analyze_with_openai(analysis.query)

            # Update analysis with results
            analysis.results = results
            analysis.status = "completed"
            analysis.completed_at = datetime.utcnow()
            self.db.commit()
            
            # Notify user of completion
            await notify_analysis_update(
                analysis.user_id,
                analysis.id,
                "completed",
                {"results": results}
            )

            return results
        except Exception as e:
            # Update analysis with error
            analysis.status = "failed"
            analysis.error = str(e)
            self.db.commit()
            
            # Notify user of failure
            await notify_analysis_update(
                analysis.user_id,
                analysis.id,
                "failed",
                {"error": str(e)}
            )
            
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {str(e)}"
            )

def get_research_service(db: Session) -> ResearchService:
    return ResearchService(db)
