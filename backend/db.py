from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from config import DATABASE_URL
from typing import Generator

# Database URL
DATABASE_URL = DATABASE_URL

# Create engine
engine = create_engine(DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Metadata for table creation
metadata = MetaData()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session.
    This will be used in FastAPI endpoints to get database access.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Create all tables in the database.
    Call this function when starting the application.
    """
    # TODO: Import all model classes here when they are created
    # from models import Room, User, Reservation  # Uncomment when models are created

    # Create all tables
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """
    Drop all tables in the database.
    Use with caution - this will delete all data!
    """
    Base.metadata.drop_all(bind=engine)
