from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from sqlalchemy.orm import Session
from models.buildings import (
    BuildingCreate,
    BuildingUpdate,
    BuildingResponse,
    Building as BuildingModel,
)
from models.rooms import Room as RoomModel, RoomResponse
from utils.auth import get_current_active_user, require_admin
from models.users import User as UserModel
from db import get_db

router = APIRouter()


@router.get("", response_model=List[BuildingResponse])
async def get_all_buildings(
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get all buildings (accessible to all authenticated users)"""
    buildings = db.query(BuildingModel).all()
    return buildings


@router.get("/{building_id}", response_model=BuildingResponse)
async def get_building(
    building_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get a specific building by ID (accessible to all authenticated users)"""
    building = db.query(BuildingModel).filter(BuildingModel.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    return building


@router.post("", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
async def create_building(
    building_data: BuildingCreate,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new building (admin only)"""
    # Check if building with same name already exists
    existing_building = (
        db.query(BuildingModel).filter(BuildingModel.name == building_data.name).first()
    )
    if existing_building:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Building with this name already exists",
        )

    new_building = BuildingModel(
        name=building_data.name,
        address=building_data.address,
        number_of_floors=building_data.number_of_floors,
    )

    db.add(new_building)
    db.commit()
    db.refresh(new_building)
    return new_building


@router.put("/{building_id}", response_model=BuildingResponse)
async def update_building(
    building_id: int,
    building_data: BuildingUpdate,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a building (admin only)"""
    building = db.query(BuildingModel).filter(BuildingModel.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")

    # Check for duplicate name if being updated
    if building_data.name and building_data.name != building.name:
        existing_building = (
            db.query(BuildingModel)
            .filter(BuildingModel.name == building_data.name)
            .first()
        )
        if existing_building:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Building with this name already exists",
            )
        building.name = building_data.name

    if building_data.address is not None:
        building.address = building_data.address

    if building_data.number_of_floors is not None:
        building.number_of_floors = building_data.number_of_floors

    db.commit()
    db.refresh(building)
    return building


@router.delete("/{building_id}")
async def delete_building(
    building_id: int,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a building (admin only) - This will also delete all rooms in the building"""
    building = db.query(BuildingModel).filter(BuildingModel.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")

    db.delete(building)
    db.commit()
    return {"message": "Building deleted successfully"}


@router.get("/{building_id}/rooms", response_model=List[RoomResponse])
async def get_building_rooms(
    building_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get all rooms in a building (accessible to all authenticated users)"""
    # Verify building exists
    building = db.query(BuildingModel).filter(BuildingModel.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")

    rooms = db.query(RoomModel).filter(RoomModel.building_id == building_id).all()
    return rooms
