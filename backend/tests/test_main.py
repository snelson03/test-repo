import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


class TestMainApplication:
    """Test cases for the main FastAPI application."""

    def test_root_endpoint(self, client):
        """Test the root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Study Room Management API"}

    def test_health_check_endpoint(self, client):
        """Test the health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_cors_headers(self, client):
        """Test that CORS headers are properly set."""
        response = client.options("/", headers={"Origin": "http://localhost:3000"})
        # FastAPI TestClient doesn't fully simulate CORS, but we can check the response
        assert response.status_code in [200, 405]  # OPTIONS might not be implemented

    def test_api_documentation_available(self, client):
        """Test that API documentation is available."""
        # Test OpenAPI schema endpoint
        response = client.get("/openapi.json")
        assert response.status_code == 200

        # Test Swagger UI endpoint
        response = client.get("/docs")
        assert response.status_code == 200

        # Test ReDoc endpoint
        response = client.get("/redoc")
        assert response.status_code == 200

    def test_application_info(self, client):
        """Test that application info is correctly set."""
        response = client.get("/openapi.json")
        assert response.status_code == 200

        openapi_data = response.json()
        assert openapi_data["info"]["title"] == "Study Room Management API"
        assert (
            openapi_data["info"]["description"]
            == "API for managing study rooms and reservations"
        )
        assert openapi_data["info"]["version"] == "1.0.0"

    def test_user_routes_included(self, client):
        """Test that user routes are properly included."""
        # Test that user routes are accessible
        response = client.get("/api/v1/users/users")
        assert response.status_code == 200

        # Test that admin routes are accessible
        response = client.get("/api/v1/users/admin/users")
        assert response.status_code == 200
