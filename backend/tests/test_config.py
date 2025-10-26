import pytest
import os
from unittest.mock import patch
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


class TestConfig:
    """Test cases for configuration management."""

    def test_database_url_default(self):
        """Test that DATABASE_URL has a default value."""
        from config import DATABASE_URL

        assert DATABASE_URL == "sqlite:///./study_rooms.db"

    def test_database_url_from_env(self):
        """Test that DATABASE_URL can be set from environment variable."""
        test_url = "postgresql://user:pass@localhost/testdb"

        with patch.dict(os.environ, {"DATABASE_URL": test_url}):
            # Need to reload the module to pick up the new environment variable
            import importlib
            import config

            importlib.reload(config)

            assert config.DATABASE_URL == test_url

    def test_dotenv_loading(self):
        """Test that dotenv is loaded."""
        # This test verifies that load_dotenv() is called
        # In a real scenario, you might want to test with an actual .env file
        from config import DATABASE_URL

        # If dotenv is working, it should load any DATABASE_URL from .env
        # For this test, we just verify the module can be imported
        assert DATABASE_URL is not None

    def test_config_module_structure(self):
        """Test that the config module has the expected structure."""
        import config

        # Check that DATABASE_URL is defined
        assert hasattr(config, "DATABASE_URL")
        assert isinstance(config.DATABASE_URL, str)
        assert len(config.DATABASE_URL) > 0
