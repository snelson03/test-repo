from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from sqlalchemy.orm import Session
from models.rooms import (
    RoomCreate,
    RoomUpdate,
    RoomResponse,
    RoomAvailabilityUpdate,
    Room as RoomModel,
)
from models.buildings import Building as BuildingModel
from utils.auth import get_current_active_user, require_admin
from models.users import User as UserModel
from db import get_db

router = APIRouter()


@router.get("", response_model=List[RoomResponse])
async def get_all_rooms(
    building_id: Optional[int] = None,
    is_available: Optional[bool] = None,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get all rooms (accessible to all authenticated users)
    Can filter by building_id and/or availability status
    """
    query = db.query(RoomModel)

    if building_id is not None:
        # Verify building exists
        building = (
            db.query(BuildingModel).filter(BuildingModel.id == building_id).first()
        )
        if not building:
            raise HTTPException(status_code=404, detail="Building not found")
        query = query.filter(RoomModel.building_id == building_id)

    if is_available is not None:
        query = query.filter(RoomModel.is_available == is_available)

    rooms = query.all()
    return rooms


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get a specific room by ID (accessible to all authenticated users)"""
    room = db.query(RoomModel).filter(RoomModel.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_data: RoomCreate,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new room (admin only)"""
    # Verify building exists
    building = (
        db.query(BuildingModel)
        .filter(BuildingModel.id == room_data.building_id)
        .first()
    )
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")

    # Check if room with same number in same building already exists
    existing_room = (
        db.query(RoomModel)
        .filter(
            RoomModel.building_id == room_data.building_id,
            RoomModel.room_number == room_data.room_number,
        )
        .first()
    )
    if existing_room:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room with this number already exists in this building",
        )

    # Check if sensor_id is unique if provided
    if room_data.sensor_id:
        existing_sensor = (
            db.query(RoomModel)
            .filter(RoomModel.sensor_id == room_data.sensor_id)
            .first()
        )
        if existing_sensor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sensor ID already in use",
            )

    new_room = RoomModel(
        building_id=room_data.building_id,
        room_number=room_data.room_number,
        floor_number=room_data.floor_number,
        is_available=room_data.is_available,
        sensor_id=room_data.sensor_id,
    )

    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room


@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: int,
    room_data: RoomUpdate,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a room (admin only)"""
    room = db.query(RoomModel).filter(RoomModel.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Verify building exists if being updated
    if room_data.building_id and room_data.building_id != room.building_id:
        building = (
            db.query(BuildingModel)
            .filter(BuildingModel.id == room_data.building_id)
            .first()
        )
        if not building:
            raise HTTPException(status_code=404, detail="Building not found")
        room.building_id = room_data.building_id

    # Check for duplicate room number if being updated
    if room_data.room_number and room_data.room_number != room.room_number:
        existing_room = (
            db.query(RoomModel)
            .filter(
                RoomModel.building_id == room.building_id,
                RoomModel.room_number == room_data.room_number,
            )
            .first()
        )
        if existing_room:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room with this number already exists in this building",
            )
        room.room_number = room_data.room_number

    if room_data.floor_number is not None:
        room.floor_number = room_data.floor_number

    if room_data.is_available is not None:
        room.is_available = room_data.is_available

    # Check if sensor_id is unique if being updated
    if room_data.sensor_id and room_data.sensor_id != room.sensor_id:
        existing_sensor = (
            db.query(RoomModel)
            .filter(RoomModel.sensor_id == room_data.sensor_id)
            .first()
        )
        if existing_sensor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sensor ID already in use",
            )
        room.sensor_id = room_data.sensor_id

    db.commit()
    db.refresh(room)
    return room


@router.patch("/{room_id}/availability", response_model=RoomResponse)
async def update_room_availability(
    room_id: int,
    availability_data: RoomAvailabilityUpdate,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update room availability (accessible to all authenticated users)
    This endpoint can be used by sensors to update room availability
    """
    room = db.query(RoomModel).filter(RoomModel.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    room.is_available = availability_data.is_available
    db.commit()
    db.refresh(room)
    return room


@router.patch("/sensor/{sensor_id}/availability", response_model=RoomResponse)
async def update_room_availability_by_sensor(
    sensor_id: str,
    availability_data: RoomAvailabilityUpdate,
    db: Session = Depends(get_db),
):
    """Update room availability by sensor ID (no authentication required)
    This endpoint is specifically for sensors to update room status
    """
    room = db.query(RoomModel).filter(RoomModel.sensor_id == sensor_id).first()
    if not room:
        raise HTTPException(
            status_code=404, detail="Room with this sensor ID not found"
        )

    room.is_available = availability_data.is_available
    db.commit()
    db.refresh(room)
    return room


@router.delete("/{room_id}")
async def delete_room(
    room_id: int,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a room (admin only)"""
    room = db.query(RoomModel).filter(RoomModel.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}
