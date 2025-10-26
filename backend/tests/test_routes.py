import pytest
from fastapi.testclient import TestClient
from datetime import datetime
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from models.users import User


class TestUserRoutes:
    """Test cases for user routes."""

    def test_get_users_empty(self, client):
        """Test getting users when database is empty."""
        response = client.get("/api/v1/users/users")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_user_success(self, client, sample_user_data):
        """Test creating a user successfully."""
        response = client.post("/api/v1/users/users", json=sample_user_data)
        assert response.status_code == 200

        data = response.json()
        assert data["username"] == sample_user_data["username"]
        assert data["email"] == sample_user_data["email"]
        assert data["full_name"] == sample_user_data["full_name"]
        assert data["password"] == sample_user_data["password"]
        assert data["is_active"] is True
        assert data["is_admin"] is False
        assert data["id"] == 1
        assert "created_at" in data

    def test_create_user_duplicate_username(self, client, sample_user_data):
        """Test creating a user with duplicate username."""
        # Create first user
        client.post("/api/v1/users/users", json=sample_user_data)

        # Try to create second user with same username
        response = client.post("/api/v1/users/users", json=sample_user_data)
        assert response.status_code == 400
        assert "Username already exists" in response.json()["detail"]

    def test_create_user_duplicate_email(self, client, sample_user_data):
        """Test creating a user with duplicate email."""
        # Create first user
        client.post("/api/v1/users/users", json=sample_user_data)

        # Try to create second user with same email but different username
        sample_user_data["username"] = "differentuser"
        response = client.post("/api/v1/users/users", json=sample_user_data)
        assert response.status_code == 400
        assert "Email already exists" in response.json()["detail"]

    def test_get_user_by_id_success(self, client, sample_user_data):
        """Test getting a user by ID successfully."""
        # Create a user
        create_response = client.post("/api/v1/users/users", json=sample_user_data)
        user_id = create_response.json()["id"]

        # Get the user
        response = client.get(f"/api/v1/users/users/{user_id}")
        assert response.status_code == 200

        data = response.json()
        assert data["username"] == sample_user_data["username"]
        assert data["email"] == sample_user_data["email"]

    def test_get_user_by_id_not_found(self, client):
        """Test getting a user by ID that doesn't exist."""
        response = client.get("/api/v1/users/users/999")
        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]

    def test_update_user_success(self, client, sample_user_data):
        """Test updating a user successfully."""
        # Create a user
        create_response = client.post("/api/v1/users/users", json=sample_user_data)
        user_id = create_response.json()["id"]

        # Update the user
        update_data = {
            "email": "newemail@example.com",
            "full_name": "New Full Name",
            "is_admin": True,
        }
        response = client.put(f"/api/v1/users/users/{user_id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["email"] == update_data["email"]
        assert data["full_name"] == update_data["full_name"]
        assert data["is_admin"] is True
        assert data["username"] == sample_user_data["username"]  # Should not change

    def test_update_user_not_found(self, client):
        """Test updating a user that doesn't exist."""
        update_data = {"email": "newemail@example.com"}
        response = client.put("/api/v1/users/users/999", json=update_data)
        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]

    def test_update_user_duplicate_email(self, client, sample_user_data):
        """Test updating a user with duplicate email."""
        # Create two users
        user1_data = sample_user_data.copy()
        user1_data["username"] = "user1"
        user1_data["email"] = "user1@example.com"

        user2_data = sample_user_data.copy()
        user2_data["username"] = "user2"
        user2_data["email"] = "user2@example.com"

        client.post("/api/v1/users/users", json=user1_data)
        create_response = client.post("/api/v1/users/users", json=user2_data)
        user2_id = create_response.json()["id"]

        # Try to update user2 with user1's email
        update_data = {"email": "user1@example.com"}
        response = client.put(f"/api/v1/users/users/{user2_id}", json=update_data)
        assert response.status_code == 400
        assert "Email already exists" in response.json()["detail"]

    def test_delete_user_success(self, client, sample_user_data):
        """Test deleting a user successfully."""
        # Create a user
        create_response = client.post("/api/v1/users/users", json=sample_user_data)
        user_id = create_response.json()["id"]

        # Delete the user
        response = client.delete(f"/api/v1/users/users/{user_id}")
        assert response.status_code == 200
        assert "User deleted successfully" in response.json()["message"]

        # Verify user is deleted
        get_response = client.get(f"/api/v1/users/users/{user_id}")
        assert get_response.status_code == 404

    def test_delete_user_not_found(self, client):
        """Test deleting a user that doesn't exist."""
        response = client.delete("/api/v1/users/users/999")
        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]


class TestAdminRoutes:
    """Test cases for admin routes."""

    def test_get_all_users_admin(self, client, sample_user_data):
        """Test getting all users via admin endpoint."""
        # Create a user
        client.post("/api/v1/users/users", json=sample_user_data)

        # Get all users via admin endpoint
        response = client.get("/api/v1/users/admin/users")
        assert response.status_code == 200

        data = response.json()
        assert len(data) == 1
        assert data[0]["username"] == sample_user_data["username"]

    def test_get_all_users_admin_empty(self, client):
        """Test getting all users via admin endpoint when empty."""
        response = client.get("/api/v1/users/admin/users")
        assert response.status_code == 200
        assert response.json() == []
