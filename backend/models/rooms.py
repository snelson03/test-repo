from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from db import Base


# SQLAlchemy Model
class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(
        Integer, ForeignKey("buildings.id"), nullable=False, index=True
    )
    room_number = Column(String, nullable=False)
    floor_number = Column(Integer, nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    sensor_id = Column(
        String, nullable=True, unique=True, index=True
    )  # For sensor tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to building
    building = relationship("Building", back_populates="rooms")
    # Relationship to room blocks
    blocks = relationship("RoomBlock", back_populates="room")


# Pydantic Models for API
class RoomBase(BaseModel):
    building_id: int
    room_number: str
    floor_number: Optional[int] = None
    is_available: bool = True
    sensor_id: Optional[str] = None


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    building_id: Optional[int] = None
    room_number: Optional[str] = None
    floor_number: Optional[int] = None
    is_available: Optional[bool] = None
    sensor_id: Optional[str] = None


class RoomResponse(RoomBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RoomAvailabilityUpdate(BaseModel):
    """Model for updating room availability (used by sensors)"""

    is_available: bool
