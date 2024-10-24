import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import asyncio
from ..conftest import run_async
from app.main import app
from app.core.security import create_access_token

def get_test_token(user_id: int) -> str:
    """Create a test JWT token."""
    return create_access_token(user_id)

async def test_complete_analysis_flow(
    client: TestClient,
    db_session: Session,
    test_user,
    test_template,
    mock_perplexity_response
):
    """Test complete analysis flow from start to report generation."""
    # Setup
    token = get_test_token(test_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Start Analysis
    response = client.post(
        "/api/v1/analysis/start",
        headers=headers,
        json={
            "query": "test analysis",
            "template_id": test_template.id
        }
    )
    assert response.status_code == 200
    analysis_data = response.json()
    analysis_id = analysis_data["analysis_id"]

    # 2. Check Analysis Status
    for _ in range(5):  # Poll status a few times
        response = client.get(
            f"/api/v1/analysis/status/{analysis_id}",
            headers=headers
        )
        assert response.status_code == 200
        status_data = response.json()
        if status_data["status"] in ["completed", "failed"]:
            break
        await asyncio.sleep(1)
    
    assert status_data["status"] == "completed"

    # 3. Generate Report
    response = client.get(
        f"/api/v1/reports/{analysis_id}",
        headers=headers
    )
    assert response.status_code == 200
    report_data = response.json()
    assert report_data["analysis_id"] == analysis_id
    assert "summary" in report_data
    assert "key_findings" in report_data

async def test_template_management(
    client: TestClient,
    db_session: Session,
    test_user
):
    """Test template CRUD operations."""
    # Setup
    token = get_test_token(test_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Template
    template_data = {
        "name": "Test Template",
        "category": "research",
        "parameters": {"max_tokens": 1000},
        "prompts": ["Test prompt"]
    }
    response = client.post(
        "/api/v1/templates/create",
        headers=headers,
        json=template_data
    )
    assert response.status_code == 200
    created_template = response.json()
    template_id = created_template["id"]

    # 2. Get Template
    response = client.get(
        f"/api/v1/templates/{template_id}",
        headers=headers
    )
    assert response.status_code == 200
    template = response.json()
    assert template["name"] == template_data["name"]

    # 3. Update Template
    update_data = {
        "name": "Updated Template",
        "parameters": {"max_tokens": 2000}
    }
    response = client.put(
        f"/api/v1/templates/{template_id}",
        headers=headers,
        json=update_data
    )
    assert response.status_code == 200
    updated_template = response.json()
    assert updated_template["name"] == update_data["name"]

    # 4. List Templates
    response = client.get(
        "/api/v1/templates/list",
        headers=headers
    )
    assert response.status_code == 200
    templates = response.json()
    assert len(templates) > 0
    assert any(t["id"] == template_id for t in templates)

async def test_research_data_collection(
    client: TestClient,
    db_session: Session,
    test_user,
    mock_perplexity_response
):
    """Test research data collection."""
    # Setup
    token = get_test_token(test_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # Collect Research Data
    response = client.post(
        "/api/v1/research/collect",
        headers=headers,
        json={
            "query": "test research",
            "parameters": {
                "max_results": 5,
                "include_citations": True
            }
        }
    )
    assert response.status_code == 200
    research_data = response.json()
    assert "results" in research_data
    assert "metadata" in research_data
    assert len(research_data["results"]) > 0

async def test_websocket_connection(
    client: TestClient,
    test_user
):
    """Test WebSocket connection and updates."""
    # Setup
    token = get_test_token(test_user.id)
    
    # Connect to WebSocket
    with client.websocket_connect(
        f"/ws?token={token}"
    ) as websocket:
        # Send ping
        websocket.send_json({"type": "ping"})
        
        # Receive pong
        response = websocket.receive_json()
        assert response["type"] == "pong"
