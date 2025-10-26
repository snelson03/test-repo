import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


class TestIntegration:
    """Integration tests for the entire application."""

    def test_full_user_lifecycle(self, client):
        """Test the complete user lifecycle: create, read, update, delete."""
        # 1. Create a user
        user_data = {
            "username": "integrationuser",
            "email": "integration@example.com",
            "full_name": "Integration Test User",
            "password": "integrationpassword123",
        }

        create_response = client.post("/api/v1/users/users", json=user_data)
        assert create_response.status_code == 200
        user_id = create_response.json()["id"]

        # 2. Read the user
        get_response = client.get(f"/api/v1/users/users/{user_id}")
        assert get_response.status_code == 200
        assert get_response.json()["username"] == user_data["username"]

        # 3. Update the user
        update_data = {
            "email": "updated@example.com",
            "full_name": "Updated Integration User",
            "is_admin": True,
        }

        update_response = client.put(f"/api/v1/users/users/{user_id}", json=update_data)
        assert update_response.status_code == 200
        assert update_response.json()["email"] == update_data["email"]
        assert update_response.json()["is_admin"] is True

        # 4. Verify the update
        get_updated_response = client.get(f"/api/v1/users/users/{user_id}")
        assert get_updated_response.status_code == 200
        assert get_updated_response.json()["email"] == update_data["email"]
        assert get_updated_response.json()["is_admin"] is True

        # 5. Delete the user
        delete_response = client.delete(f"/api/v1/users/users/{user_id}")
        assert delete_response.status_code == 200

        # 6. Verify the user is deleted
        get_deleted_response = client.get(f"/api/v1/users/users/{user_id}")
        assert get_deleted_response.status_code == 404

    def test_multiple_users_management(self, client):
        """Test managing multiple users."""
        # Create multiple users
        users_data = [
            {
                "username": "user1",
                "email": "user1@example.com",
                "full_name": "User One",
                "password": "password1",
            },
            {
                "username": "user2",
                "email": "user2@example.com",
                "full_name": "User Two",
                "password": "password2",
            },
            {
                "username": "user3",
                "email": "user3@example.com",
                "full_name": "User Three",
                "password": "password3",
            },
        ]

        user_ids = []
        for user_data in users_data:
            response = client.post("/api/v1/users/users", json=user_data)
            assert response.status_code == 200
            user_ids.append(response.json()["id"])

        # Get all users
        get_all_response = client.get("/api/v1/users/users")
        assert get_all_response.status_code == 200
        assert len(get_all_response.json()) == 3

        # Get all users via admin endpoint
        admin_response = client.get("/api/v1/users/admin/users")
        assert admin_response.status_code == 200
        assert len(admin_response.json()) == 3

        # Update one user to be admin
        admin_update_response = client.put(
            f"/api/v1/users/users/{user_ids[0]}", json={"is_admin": True}
        )
        assert admin_update_response.status_code == 200
        assert admin_update_response.json()["is_admin"] is True

        # Deactivate one user
        deactivate_response = client.put(
            f"/api/v1/users/users/{user_ids[1]}", json={"is_active": False}
        )
        assert deactivate_response.status_code == 200
        assert deactivate_response.json()["is_active"] is False

        # Delete one user
        delete_response = client.delete(f"/api/v1/users/users/{user_ids[2]}")
        assert delete_response.status_code == 200

        # Verify final state
        final_response = client.get("/api/v1/users/users")
        assert final_response.status_code == 200
        assert len(final_response.json()) == 2  # One deleted

    def test_error_handling_consistency(self, client):
        """Test that error handling is consistent across endpoints."""
        # Test 404 errors
        endpoints_that_should_404 = [
            "/api/v1/users/users/999",
            "PUT /api/v1/users/users/999",
            "DELETE /api/v1/users/users/999",
        ]

        # Test non-existent user GET
        response = client.get("/api/v1/users/users/999")
        assert response.status_code == 404

        # Test non-existent user PUT
        response = client.put(
            "/api/v1/users/users/999", json={"email": "test@example.com"}
        )
        assert response.status_code == 404

        # Test non-existent user DELETE
        response = client.delete("/api/v1/users/users/999")
        assert response.status_code == 404

    def test_data_validation_consistency(self, client):
        """Test that data validation is consistent."""
        # Test invalid user creation (missing required fields)
        invalid_user_data = {
            "username": "testuser"
            # Missing email, full_name, password
        }

        response = client.post("/api/v1/users/users", json=invalid_user_data)
        assert response.status_code == 422  # Validation error

        # Test duplicate username
        user_data = {
            "username": "duplicateuser",
            "email": "duplicate@example.com",
            "full_name": "Duplicate User",
            "password": "password123",
        }

        # Create first user
        client.post("/api/v1/users/users", json=user_data)

        # Try to create second user with same username
        user_data["email"] = "different@example.com"
        response = client.post("/api/v1/users/users", json=user_data)
        assert response.status_code == 400
        assert "Username already exists" in response.json()["detail"]
