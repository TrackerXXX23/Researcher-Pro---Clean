import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from typing import Generator, Dict, Any
import asyncio
from datetime import datetime

from app.db.base import Base
from app.main import app
from app.core.config import settings
from app.models.user import User
from app.models.analysis import Analysis
from app.models.template import Template

# Test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="session")
def engine():
    engine = create_engine(
        SQLALCHEMY_TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(engine):
    """Creates a new database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session) -> Generator:
    """Creates a new FastAPI TestClient."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides = {}
    yield TestClient(app)
    app.dependency_overrides = {}

@pytest.fixture(scope="function")
def test_user(db_session) -> User:
    """Creates a test user."""
    user = User(
        email="test@example.com",
        hashed_password="testpass123",
        full_name="Test User"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def test_template(db_session) -> Template:
    """Creates a test template."""
    template = Template(
        id="test_template_1",
        name="Test Template",
        category="research",
        parameters={"max_tokens": 1000},
        prompts=["Analyze the following:", "Provide insights about:"]
    )
    db_session.add(template)
    db_session.commit()
    db_session.refresh(template)
    return template

@pytest.fixture(scope="function")
def test_analysis(db_session, test_user) -> Analysis:
    """Creates a test analysis."""
    analysis = Analysis(
        user_id=test_user.id,
        query="test analysis query",
        status="completed",
        results={
            "summary": "Test summary",
            "insights": [
                {"title": "Test Insight", "description": "Test Description"}
            ]
        }
    )
    db_session.add(analysis)
    db_session.commit()
    db_session.refresh(analysis)
    return analysis

class MockBackgroundTasks:
    """Mock background tasks for testing."""
    def __init__(self):
        self.tasks = []

    def add_task(self, func, *args, **kwargs):
        self.tasks.append((func, args, kwargs))

@pytest.fixture
def background_tasks():
    """Provides mock background tasks."""
    return MockBackgroundTasks()

def run_async(coro):
    """Helper to run async code in tests."""
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coro)

@pytest.fixture
def mock_perplexity_response() -> Dict[str, Any]:
    """Mock Perplexity API response."""
    return {
        "results": [
            {
                "content": "Test content",
                "relevance": 0.95,
                "citations": ["Source 1", "Source 2"],
                "confidence": 0.9
            }
        ],
        "query_time": 1.5,
        "source_count": 2
    }
