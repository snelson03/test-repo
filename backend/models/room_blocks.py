from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from db import Base


# SQLAlchemy Model
class RoomBlock(Base):
    __tablename__ = "room_blocks"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    reason = Column(String, nullable=True)  # Optional reason for blocking
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    room = relationship("Room", back_populates="blocks")
    faculty = relationship("User", back_populates="room_blocks")


# Pydantic Models for API
class RoomBlockBase(BaseModel):
    room_id: int
    start_time: datetime
    end_time: datetime
    reason: Optional[str] = None


class RoomBlockCreate(RoomBlockBase):
    pass


class RoomBlockUpdate(BaseModel):
    room_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reason: Optional[str] = None
    is_active: Optional[bool] = None


class RoomBlockResponse(RoomBlockBase):
    id: int
    faculty_id: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
