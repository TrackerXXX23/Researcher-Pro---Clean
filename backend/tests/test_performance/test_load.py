import pytest
import asyncio
from typing import List
import aiohttp
import time
from ..conftest import get_test_token

async def make_request(
    session: aiohttp.ClientSession,
    url: str,
    token: str,
    payload: dict = None
) -> dict:
    """Make HTTP request with retry logic."""
    headers = {"Authorization": f"Bearer {token}"}
    method = "POST" if payload else "GET"
    
    for _ in range(3):  # Retry up to 3 times
        try:
            if method == "POST":
                async with session.post(
                    url,
                    headers=headers,
                    json=payload
                ) as response:
                    return await response.json()
            else:
                async with session.get(
                    url,
                    headers=headers
                ) as response:
                    return await response.json()
        except Exception:
            await asyncio.sleep(1)
    
    raise Exception(f"Failed to make request to {url}")

async def test_concurrent_analyses(test_user):
    """Test handling multiple concurrent analyses."""
    # Setup
    token = get_test_token(test_user.id)
    num_concurrent = 10
    base_url = "http://localhost:8000/api/v1"
    
    async with aiohttp.ClientSession() as session:
        # Start analyses
        start_time = time.time()
        tasks = []
        for i in range(num_concurrent):
            task = make_request(
                session,
                f"{base_url}/analysis/start",
                token,
                {
                    "query": f"test query {i}",
                    "parameters": {"max_tokens": 1000}
                }
            )
            tasks.append(task)
        
        # Wait for all analyses to start
        results = await asyncio.gather(*tasks)
        duration = time.time() - start_time
        
        # Verify results
        assert len(results) == num_concurrent
        assert all(r["status"] == "pending" for r in results)
        assert duration < 10  # Should handle 10 concurrent requests in under 10 seconds

async def test_template_load(test_user, test_template):
    """Test template management under load."""
    # Setup
    token = get_test_token(test_user.id)
    num_requests = 50
    base_url = "http://localhost:8000/api/v1"
    
    async with aiohttp.ClientSession() as session:
        # Mix of read and write operations
        start_time = time.time()
        tasks = []
        
        # Create templates
        for i in range(num_requests // 2):
            task = make_request(
                session,
                f"{base_url}/templates/create",
                token,
                {
                    "name": f"Load Test Template {i}",
                    "category": "test",
                    "parameters": {"max_tokens": 1000},
                    "prompts": ["Test prompt"]
                }
            )
            tasks.append(task)
        
        # Get templates
        for _ in range(num_requests // 2):
            task = make_request(
                session,
                f"{base_url}/templates/list",
                token
            )
            tasks.append(task)
        
        # Execute all requests
        results = await asyncio.gather(*tasks)
        duration = time.time() - start_time
        
        # Verify results
        assert len(results) == num_requests
        assert duration < 30  # Should handle 50 mixed requests in under 30 seconds

async def test_websocket_load(test_user):
    """Test WebSocket connections under load."""
    # Setup
    token = get_test_token(test_user.id)
    num_connections = 100
    ws_url = f"ws://localhost:8000/ws?token={token}"
    
    async def websocket_client():
        async with aiohttp.ClientSession() as session:
            async with session.ws_connect(ws_url) as ws:
                # Send ping
                await ws.send_json({"type": "ping"})
                # Wait for pong
                response = await ws.receive_json()
                assert response["type"] == "pong"
                # Keep connection open briefly
                await asyncio.sleep(1)
    
    # Create multiple WebSocket connections
    start_time = time.time()
    tasks = [websocket_client() for _ in range(num_connections)]
    
    # Execute all connections
    await asyncio.gather(*tasks)
    duration = time.time() - start_time
    
    # Verify timing
    assert duration < 60  # Should handle 100 WebSocket connections in under 60 seconds

async def test_research_load(test_user):
    """Test research data collection under load."""
    # Setup
    token = get_test_token(test_user.id)
    num_requests = 20
    base_url = "http://localhost:8000/api/v1"
    
    async with aiohttp.ClientSession() as session:
        # Create research requests
        start_time = time.time()
        tasks = []
        
        for i in range(num_requests):
            task = make_request(
                session,
                f"{base_url}/research/collect",
                token,
                {
                    "query": f"load test query {i}",
                    "parameters": {
                        "max_results": 5,
                        "include_citations": True
                    }
                }
            )
            tasks.append(task)
        
        # Execute all requests
        results = await asyncio.gather(*tasks)
        duration = time.time() - start_time
        
        # Verify results
        assert len(results) == num_requests
        assert all("results" in r for r in results)
        assert duration < 40  # Should handle 20 research requests in under 40 seconds
