import pytest
from app.services.research_service import ResearchService

def test_validate_parameters(db_session):
    """Test research parameters validation."""
    # Setup
    research_service = ResearchService(db_session)
    
    # Test with empty parameters
    validated = research_service._validate_parameters({})
    assert validated["max_results"] == 10
    assert validated["include_citations"] is True
    assert validated["depth"] == "comprehensive"
    
    # Test with custom parameters
    custom_params = {
        "max_results": 5,
        "include_citations": False,
        "depth": "basic"
    }
    validated = research_service._validate_parameters(custom_params)
    assert validated["max_results"] == 5
    assert validated["include_citations"] is False
    assert validated["depth"] == "basic"

def test_process_data(db_session):
    """Test processing of raw research data."""
    # Setup
    research_service = ResearchService(db_session)
    raw_data = {
        "results": [
            {
                "content": "Test content",
                "relevance": 0.9,
                "citations": ["Source 1"],
                "confidence": 0.85
            }
        ],
        "query_time": 1.2,
        "source_count": 1
    }
    
    # Process data
    processed = research_service._process_data(raw_data)
    
    # Verify structure
    assert "timestamp" in processed
    assert "results" in processed
    assert "metadata" in processed
    
    # Verify results
    assert len(processed["results"]) == 1
    result = processed["results"][0]
    assert result["content"] == "Test content"
    assert result["relevance"] == 0.9
    assert result["citations"] == ["Source 1"]
    assert result["confidence"] == 0.85
    
    # Verify metadata
    assert processed["metadata"]["total_results"] == 1
    assert processed["metadata"]["query_time"] == 1.2
    assert processed["metadata"]["source_count"] == 1

def test_collect_data(db_session, mock_perplexity_response, monkeypatch):
    """Test complete data collection process."""
    async def mock_collect_from_perplexity(_, __):
        return mock_perplexity_response

    async def test():
        # Setup
        research_service = ResearchService(db_session)
        monkeypatch.setattr(
            research_service,
            "_collect_from_perplexity",
            mock_collect_from_perplexity
        )
        
        # Execute
        result = await research_service.collect_data(
            query="test query",
            parameters={"max_results": 5}
        )
        
        # Verify
        assert "timestamp" in result
        assert "results" in result
        assert len(result["results"]) == len(mock_perplexity_response["results"])
        assert "metadata" in result
    
    run_async(test())

def test_collect_data_error(db_session, monkeypatch):
    """Test error handling in data collection."""
    async def mock_collect_from_perplexity(_, __):
        raise Exception("API Error")

    async def test():
        # Setup
        research_service = ResearchService(db_session)
        monkeypatch.setattr(
            research_service,
            "_collect_from_perplexity",
            mock_collect_from_perplexity
        )
        
        # Execute and verify error handling
        with pytest.raises(Exception) as exc_info:
            await research_service.collect_data(
                query="test query",
                parameters={}
            )
        assert "Research data collection failed" in str(exc_info.value)
    
    run_async(test())
