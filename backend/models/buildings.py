from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from db import Base


# SQLAlchemy Model
class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=True)
    number_of_floors = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to rooms
    rooms = relationship(
        "Room", back_populates="building", cascade="all, delete-orphan"
    )


# Pydantic Models for API
class BuildingBase(BaseModel):
    name: str
    address: Optional[str] = None
    number_of_floors: Optional[int] = None


class BuildingCreate(BuildingBase):
    pass


class BuildingUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    number_of_floors: Optional[int] = None


class BuildingResponse(BuildingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
