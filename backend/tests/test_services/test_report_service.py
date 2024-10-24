import pytest
from app.services.report_service import ReportService

def test_generate_report(db_session, test_analysis):
    """Test report generation."""
    async def test():
        # Setup
        report_service = ReportService(db_session)
        
        # Execute
        report = await report_service.generate_report(test_analysis.id)
        
        # Verify
        assert report["analysis_id"] == test_analysis.id
        assert "generated_at" in report
        assert report["query"] == test_analysis.query
        assert "summary" in report
        assert "key_findings" in report
        assert "detailed_analysis" in report
        assert "metadata" in report
    
    run_async(test())

def test_generate_summary(db_session):
    """Test summary generation."""
    async def test():
        # Setup
        report_service = ReportService(db_session)
        results = {
            "main_points": [
                "Point 1",
                "Point 2",
                "Point 3"
            ]
        }
        
        # Execute
        summary = await report_service._generate_summary(results)
        
        # Verify
        assert "Point 1" in summary
        assert "Point 2" in summary
        assert "Point 3" in summary
    
    run_async(test())

def test_extract_key_findings(db_session):
    """Test key findings extraction."""
    async def test():
        # Setup
        report_service = ReportService(db_session)
        results = {
            "insights": [
                {
                    "title": "Finding 1",
                    "description": "Description 1",
                    "confidence": 0.9,
                    "supporting_data": ["Data 1"]
                },
                {
                    "title": "Finding 2",
                    "description": "Description 2",
                    "confidence": 0.8,
                    "supporting_data": ["Data 2"]
                }
            ]
        }
        
        # Execute
        findings = await report_service._extract_key_findings(results)
        
        # Verify
        assert len(findings) == 2
        assert findings[0]["title"] == "Finding 1"
        assert findings[0]["confidence"] == 0.9
        assert findings[1]["title"] == "Finding 2"
        assert findings[1]["confidence"] == 0.8
    
    run_async(test())

def test_generate_detailed_analysis(db_session):
    """Test detailed analysis generation."""
    async def test():
        # Setup
        report_service = ReportService(db_session)
        results = {
            "sections": [
                {"title": "Section 1", "content": "Content 1"},
                {"title": "Section 2", "content": "Content 2"}
            ],
            "visualization_data": {
                "charts": [{"type": "bar", "data": {}}],
                "tables": [{"headers": [], "rows": []}]
            }
        }
        
        # Execute
        detailed = await report_service._generate_detailed_analysis(results)
        
        # Verify
        assert len(detailed["sections"]) == 2
        assert len(detailed["charts"]) == 1
        assert len(detailed["tables"]) == 1
    
    run_async(test())

def test_generate_report_invalid_analysis(db_session):
    """Test report generation with invalid analysis."""
    async def test():
        # Setup
        report_service = ReportService(db_session)
        
        # Execute and verify error handling
        with pytest.raises(ValueError) as exc_info:
            await report_service.generate_report(999)
        assert "Analysis 999 not found" in str(exc_info.value)
    
    run_async(test())

def test_generate_report_incomplete_analysis(db_session, test_analysis):
    """Test report generation with incomplete analysis."""
    async def test():
        # Setup
        report_service = ReportService(db_session)
        test_analysis.status = "processing"
        db_session.commit()
        
        # Execute and verify error handling
        with pytest.raises(ValueError) as exc_info:
            await report_service.generate_report(test_analysis.id)
        assert "is not completed" in str(exc_info.value)
    
    run_async(test())
