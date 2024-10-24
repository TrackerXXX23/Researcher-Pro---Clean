import pytest
from app.services.ai_service import AIService
from app.models.analysis import Analysis

def test_start_analysis(db_session, test_user, background_tasks):
    """Test starting a new analysis."""
    async def test():
        # Setup
        ai_service = AIService(db_session)
        
        # Execute
        result = await ai_service.start_analysis(
            query="test analysis",
            user_id=test_user.id,
            background_tasks=background_tasks
        )
        
        # Verify
        assert result["status"] == "pending"
        assert "analysis_id" in result
        
        # Check database
        analysis = db_session.query(Analysis).filter(
            Analysis.id == result["analysis_id"]
        ).first()
        assert analysis is not None
        assert analysis.status == "pending"
        assert analysis.query == "test analysis"
        assert analysis.user_id == test_user.id
        
        # Verify background task was queued
        assert len(background_tasks.tasks) == 1
        task_func, task_args, _ = background_tasks.tasks[0]
        assert task_func == ai_service._process_analysis
        assert task_args[0] == result["analysis_id"]
    
    run_async(test())

def test_get_analysis_status(db_session, test_analysis):
    """Test getting analysis status."""
    async def test():
        # Setup
        ai_service = AIService(db_session)
        
        # Execute
        result = await ai_service.get_analysis_status(test_analysis.id)
        
        # Verify
        assert result["analysis_id"] == test_analysis.id
        assert result["status"] == "completed"
        assert result["results"] == test_analysis.results
        assert result["error"] is None
    
    run_async(test())

def test_process_analysis(db_session, test_user, mock_perplexity_response, monkeypatch):
    """Test processing an analysis."""
    async def mock_analyze_with_perplexity(_):
        return mock_perplexity_response

    async def test():
        # Setup
        ai_service = AIService(db_session)
        monkeypatch.setattr(
            ai_service,
            "_analyze_with_perplexity",
            mock_analyze_with_perplexity
        )
        
        # Create initial analysis
        analysis = Analysis(
            user_id=test_user.id,
            query="test query",
            status="pending"
        )
        db_session.add(analysis)
        db_session.commit()
        
        # Execute
        await ai_service._process_analysis(analysis.id)
        
        # Verify
        db_session.refresh(analysis)
        assert analysis.status == "completed"
        assert analysis.results == mock_perplexity_response
        assert analysis.error is None
    
    run_async(test())

def test_process_analysis_error(db_session, test_user, monkeypatch):
    """Test handling errors during analysis processing."""
    async def mock_analyze_with_perplexity(_):
        raise Exception("Test error")

    async def test():
        # Setup
        ai_service = AIService(db_session)
        monkeypatch.setattr(
            ai_service,
            "_analyze_with_perplexity",
            mock_analyze_with_perplexity
        )
        
        # Create initial analysis
        analysis = Analysis(
            user_id=test_user.id,
            query="test query",
            status="pending"
        )
        db_session.add(analysis)
        db_session.commit()
        
        # Execute
        await ai_service._process_analysis(analysis.id)
        
        # Verify
        db_session.refresh(analysis)
        assert analysis.status == "failed"
        assert analysis.error == "Test error"
    
    run_async(test())
