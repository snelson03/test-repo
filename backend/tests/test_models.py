import pytest
from datetime import datetime
from pydantic import ValidationError
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from models.users import User, UserCreate, UserUpdate


class TestUserModel:
    """Test cases for the User model."""

    def test_user_creation_with_all_fields(self):
        """Test creating a user with all required fields."""
        user = User(
            id=1,
            username="testuser",
            email="test@example.com",
            full_name="Test User",
            password="testpassword123",
            is_active=True,
            is_admin=False,
            created_at=datetime.now(),
        )

        assert user.id == 1
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.password == "testpassword123"
        assert user.is_active is True
        assert user.is_admin is False
        assert user.created_at is not None

    def test_user_creation_with_minimal_fields(self):
        """Test creating a user with only required fields."""
        user = User(
            username="testuser",
            email="test@example.com",
            full_name="Test User",
            password="testpassword123",
        )

        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.password == "testpassword123"
        assert user.is_active is True  # Default value
        assert user.is_admin is False  # Default value
        assert user.id is None  # Default value
        assert user.created_at is None  # Default value

    def test_user_creation_missing_required_field(self):
        """Test that creating a user without required fields raises ValidationError."""
        with pytest.raises(ValidationError):
            User(
                username="testuser",
                email="test@example.com",
                # missing full_name and password
            )

    def test_user_creation_invalid_email(self):
        """Test that invalid email format raises ValidationError."""
        with pytest.raises(ValidationError):
            User(
                username="testuser",
                email="invalid-email",  # Invalid email format
                full_name="Test User",
                password="testpassword123",
            )


class TestUserCreateModel:
    """Test cases for the UserCreate model."""

    def test_user_create_with_all_fields(self):
        """Test creating a UserCreate with all required fields."""
        user_create = UserCreate(
            username="testuser",
            email="test@example.com",
            full_name="Test User",
            password="testpassword123",
        )

        assert user_create.username == "testuser"
        assert user_create.email == "test@example.com"
        assert user_create.full_name == "Test User"
        assert user_create.password == "testpassword123"

    def test_user_create_missing_required_field(self):
        """Test that creating a UserCreate without required fields raises ValidationError."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="test@example.com",
                # missing full_name and password
            )


class TestUserUpdateModel:
    """Test cases for the UserUpdate model."""

    def test_user_update_with_all_fields(self):
        """Test creating a UserUpdate with all fields."""
        user_update = UserUpdate(
            email="newemail@example.com",
            full_name="New Full Name",
            password="newpassword123",
            is_active=False,
            is_admin=True,
        )

        assert user_update.email == "newemail@example.com"
        assert user_update.full_name == "New Full Name"
        assert user_update.password == "newpassword123"
        assert user_update.is_active is False
        assert user_update.is_admin is True

    def test_user_update_with_no_fields(self):
        """Test creating a UserUpdate with no fields (all optional)."""
        user_update = UserUpdate()

        assert user_update.email is None
        assert user_update.full_name is None
        assert user_update.password is None
        assert user_update.is_active is None
        assert user_update.is_admin is None

    def test_user_update_with_partial_fields(self):
        """Test creating a UserUpdate with only some fields."""
        user_update = UserUpdate(email="newemail@example.com", is_admin=True)

        assert user_update.email == "newemail@example.com"
        assert user_update.full_name is None
        assert user_update.password is None
        assert user_update.is_active is None
        assert user_update.is_admin is True
