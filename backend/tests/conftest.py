import pytest
from fastapi.testclient import TestClient
from datetime import datetime
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app
from routes.users import users_db, next_user_id


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    return TestClient(app)


@pytest.fixture
def sample_user():
    """Create a sample user in the database."""
    from models.users import User

    user = User(
        id=1,
        username="sampleuser",
        email="sample@example.com",
        full_name="Sample User",
        password="samplepassword123",
        is_active=True,
        is_admin=False,
        created_at=datetime.now(),
    )
    return user


@pytest.fixture(autouse=True)
def clean_database():
    """Clean the in-memory database before each test."""
    global next_user_id
    users_db.clear()
    next_user_id = 1
    yield
    users_db.clear()
    next_user_id = 1
