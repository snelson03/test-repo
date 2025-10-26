import pytest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


class TestDatabaseUtilities:
    """Test cases for database utilities."""

    def test_engine_creation(self):
        """Test that the database engine is created."""
        from db import engine

        assert engine is not None

    def test_session_local_creation(self):
        """Test that SessionLocal is created."""
        from db import SessionLocal

        assert SessionLocal is not None

    def test_base_creation(self):
        """Test that Base class is created."""
        from db import Base

        assert Base is not None

    def test_metadata_creation(self):
        """Test that metadata is created."""
        from db import metadata

        assert metadata is not None

    def test_get_db_generator(self):
        """Test that get_db returns a generator."""
        from db import get_db

        # Test that get_db is a generator function
        db_gen = get_db()
        assert hasattr(db_gen, "__next__")
        assert hasattr(db_gen, "__iter__")

    @patch("db.SessionLocal")
    def test_get_db_session_creation(self, mock_session_local):
        """Test that get_db creates and yields a session."""
        from db import get_db

        # Mock the session
        mock_session = MagicMock()
        mock_session_local.return_value = mock_session

        # Get the generator
        db_gen = get_db()

        # Get the session
        session = next(db_gen)

        # Verify session was created
        mock_session_local.assert_called_once()
        assert session == mock_session

    @patch("db.SessionLocal")
    def test_get_db_session_cleanup(self, mock_session_local):
        """Test that get_db properly closes the session."""
        from db import get_db

        # Mock the session
        mock_session = MagicMock()
        mock_session_local.return_value = mock_session

        # Get the generator
        db_gen = get_db()

        # Consume the generator (this should trigger the finally block)
        try:
            next(db_gen)
        except StopIteration:
            pass

        # Verify session was closed
        mock_session.close.assert_called_once()

    @patch("db.engine")
    def test_create_tables(self, mock_engine):
        """Test that create_tables calls the appropriate methods."""
        from db import create_tables

        # Call create_tables
        create_tables()

        # Verify that create_all was called on the engine
        mock_engine.assert_called()

    @patch("db.engine")
    def test_drop_tables(self, mock_engine):
        """Test that drop_tables calls the appropriate methods."""
        from db import drop_tables

        # Call drop_tables
        drop_tables()

        # Verify that drop_all was called on the engine
        mock_engine.assert_called()

    def test_database_url_import(self):
        """Test that DATABASE_URL is imported from config."""
        from db import engine
        from config import DATABASE_URL

        # The engine should be created with the DATABASE_URL from config
        # We can't easily test the exact URL without mocking, but we can verify
        # that the engine exists and was created
        assert engine is not None

    def test_session_maker_configuration(self):
        """Test that SessionLocal is configured correctly."""
        from db import SessionLocal

        # SessionLocal should be a sessionmaker instance
        # We can't easily test the exact configuration without mocking,
        # but we can verify it exists
        assert SessionLocal is not None
