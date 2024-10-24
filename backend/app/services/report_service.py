from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..models.analysis import Analysis
from datetime import datetime
import json

class ReportService:
    def __init__(self, db: Session):
        self.db = db

    async def generate_report(
        self,
        analysis_id: int,
        template_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a report from analysis results"""
        # Get analysis results
        analysis = self.db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            raise ValueError(f"Analysis {analysis_id} not found")
        
        if analysis.status != "completed":
            raise ValueError(f"Analysis {analysis_id} is not completed")

        # Generate report structure
        report = {
            "id": f"report_{analysis_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "analysis_id": analysis_id,
            "generated_at": datetime.utcnow().isoformat(),
            "query": analysis.query,
            "summary": await self._generate_summary(analysis.results),
            "key_findings": await self._extract_key_findings(analysis.results),
            "detailed_analysis": await self._generate_detailed_analysis(analysis.results),
            "metadata": {
                "template_id": template_id,
                "analysis_completed_at": analysis.completed_at.isoformat() if analysis.completed_at else None,
                "version": "1.0"
            }
        }

        return report

    async def _generate_summary(self, results: Dict[str, Any]) -> str:
        """Generate a concise summary of the analysis results"""
        if not results or "main_points" not in results:
            return "No summary available"
            
        # Extract and combine main points
        main_points = results.get("main_points", [])
        return " ".join(main_points)

    async def _extract_key_findings(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract key findings from the analysis results"""
        findings = []
        
        if not results:
            return findings

        # Extract insights
        if "insights" in results:
            for insight in results["insights"]:
                findings.append({
                    "title": insight.get("title", "Untitled Finding"),
                    "description": insight.get("description", ""),
                    "confidence": insight.get("confidence", 0.0),
                    "supporting_data": insight.get("supporting_data", [])
                })

        return findings

    async def _generate_detailed_analysis(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed analysis from the results"""
        detailed = {
            "sections": [],
            "charts": [],
            "tables": []
        }
        
        if not results:
            return detailed

        # Process sections
        if "sections" in results:
            detailed["sections"] = results["sections"]

        # Process visualization data
        if "visualization_data" in results:
            viz_data = results["visualization_data"]
            
            # Process charts
            if "charts" in viz_data:
                detailed["charts"] = viz_data["charts"]
            
            # Process tables
            if "tables" in viz_data:
                detailed["tables"] = viz_data["tables"]

        return detailed
