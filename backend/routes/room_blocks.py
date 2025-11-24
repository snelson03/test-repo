from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timezone
from models.room_blocks import (
    RoomBlockCreate,
    RoomBlockUpdate,
    RoomBlockResponse,
    RoomBlock as RoomBlockModel,
)
from models.rooms import Room as RoomModel
from utils.auth import (
    get_current_active_user,
    require_faculty,
    require_faculty_or_admin,
)
from models.users import User as UserModel
from db import get_db

router = APIRouter()


@router.post("", response_model=RoomBlockResponse, status_code=status.HTTP_201_CREATED)
async def create_room_block(
    block_data: RoomBlockCreate,
    current_user: UserModel = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    """Create a room block/reservation (faculty only)"""
    # Verify room exists
    room = db.query(RoomModel).filter(RoomModel.id == block_data.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Validate time range
    if block_data.start_time >= block_data.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time",
        )

    # Check if the time is in the past
    # Make start_time timezone-aware if it's not
    start_time = block_data.start_time
    end_time = block_data.end_time
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
    if end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)
    if start_time < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create blocks in the past",
        )

    # Check for overlapping blocks for the same room
    overlapping_blocks = (
        db.query(RoomBlockModel)
        .filter(
            RoomBlockModel.room_id == block_data.room_id,
            RoomBlockModel.is_active == True,
            or_(
                # New block starts during existing block
                and_(
                    RoomBlockModel.start_time <= block_data.start_time,
                    RoomBlockModel.end_time > block_data.start_time,
                ),
                # New block ends during existing block
                and_(
                    RoomBlockModel.start_time < block_data.end_time,
                    RoomBlockModel.end_time >= block_data.end_time,
                ),
                # New block completely contains existing block
                and_(
                    RoomBlockModel.start_time >= block_data.start_time,
                    RoomBlockModel.end_time <= block_data.end_time,
                ),
                # Existing block completely contains new block
                and_(
                    RoomBlockModel.start_time <= block_data.start_time,
                    RoomBlockModel.end_time >= block_data.end_time,
                ),
            ),
        )
        .first()
    )

    if overlapping_blocks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is already blocked during this time period",
        )

    # Create the block
    new_block = RoomBlockModel(
        room_id=block_data.room_id,
        faculty_id=current_user.id,
        start_time=start_time,
        end_time=end_time,
        reason=block_data.reason,
        is_active=True,
    )

    db.add(new_block)
    db.commit()
    db.refresh(new_block)
    return new_block


@router.get("", response_model=List[RoomBlockResponse])
async def get_room_blocks(
    room_id: Optional[int] = None,
    faculty_id: Optional[int] = None,
    active_only: Optional[bool] = True,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get room blocks (accessible to all authenticated users)
    Faculty can see their own blocks, admins can see all blocks
    """
    query = db.query(RoomBlockModel)

    # Filter by room if specified
    if room_id is not None:
        # Verify room exists
        room = db.query(RoomModel).filter(RoomModel.id == room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        query = query.filter(RoomBlockModel.room_id == room_id)

    # Filter by faculty if specified
    if faculty_id is not None:
        # Verify faculty exists
        faculty = db.query(UserModel).filter(UserModel.id == faculty_id).first()
        if not faculty:
            raise HTTPException(status_code=404, detail="Faculty member not found")
        query = query.filter(RoomBlockModel.faculty_id == faculty_id)

    # If not admin, only show own blocks
    if not current_user.is_admin:
        if faculty_id is not None and faculty_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own room blocks",
            )
        query = query.filter(RoomBlockModel.faculty_id == current_user.id)

    # Filter by active status
    if active_only:
        query = query.filter(RoomBlockModel.is_active == True)

    blocks = query.order_by(RoomBlockModel.start_time).all()
    return blocks


@router.get("/{block_id}", response_model=RoomBlockResponse)
async def get_room_block(
    block_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get a specific room block by ID"""
    block = db.query(RoomBlockModel).filter(RoomBlockModel.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Room block not found")

    # Check permissions: faculty can only see their own blocks, admins can see all
    if not current_user.is_admin and block.faculty_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own room blocks",
        )

    return block


@router.put("/{block_id}", response_model=RoomBlockResponse)
async def update_room_block(
    block_id: int,
    block_data: RoomBlockUpdate,
    current_user: UserModel = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    """Update a room block (faculty can update their own, admins can update any)"""
    block = db.query(RoomBlockModel).filter(RoomBlockModel.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Room block not found")

    # Check permissions: faculty can only update their own blocks
    if not current_user.is_admin and block.faculty_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own room blocks",
        )

    # Verify room exists if being updated
    if block_data.room_id and block_data.room_id != block.room_id:
        room = db.query(RoomModel).filter(RoomModel.id == block_data.room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")

    # Validate time range if being updated
    start_time = block_data.start_time if block_data.start_time else block.start_time
    end_time = block_data.end_time if block_data.end_time else block.end_time

    if start_time >= end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time",
        )

    # Check for overlapping blocks (excluding current block)
    if block_data.start_time or block_data.end_time or block_data.room_id:
        room_id = block_data.room_id if block_data.room_id else block.room_id
        overlapping_blocks = (
            db.query(RoomBlockModel)
            .filter(
                RoomBlockModel.room_id == room_id,
                RoomBlockModel.id != block_id,
                RoomBlockModel.is_active == True,
                or_(
                    and_(
                        RoomBlockModel.start_time <= start_time,
                        RoomBlockModel.end_time > start_time,
                    ),
                    and_(
                        RoomBlockModel.start_time < end_time,
                        RoomBlockModel.end_time >= end_time,
                    ),
                    and_(
                        RoomBlockModel.start_time >= start_time,
                        RoomBlockModel.end_time <= end_time,
                    ),
                    and_(
                        RoomBlockModel.start_time <= start_time,
                        RoomBlockModel.end_time >= end_time,
                    ),
                ),
            )
            .first()
        )

        if overlapping_blocks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room is already blocked during this time period",
            )

    # Update fields
    if block_data.room_id is not None:
        block.room_id = block_data.room_id
    if block_data.start_time is not None:
        block.start_time = block_data.start_time
    if block_data.end_time is not None:
        block.end_time = block_data.end_time
    if block_data.reason is not None:
        block.reason = block_data.reason
    if block_data.is_active is not None:
        block.is_active = block_data.is_active

    db.commit()
    db.refresh(block)
    return block


@router.delete("/{block_id}")
async def delete_room_block(
    block_id: int,
    current_user: UserModel = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    """Delete a room block (faculty can delete their own, admins can delete any)"""
    block = db.query(RoomBlockModel).filter(RoomBlockModel.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Room block not found")

    # Check permissions: faculty can only delete their own blocks
    if not current_user.is_admin and block.faculty_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own room blocks",
        )

    db.delete(block)
    db.commit()
    return {"message": "Room block deleted successfully"}


@router.get("/room/{room_id}/availability", response_model=List[RoomBlockResponse])
async def get_room_availability(
    room_id: int,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get active blocks for a specific room within a time range"""
    # Verify room exists
    room = db.query(RoomModel).filter(RoomModel.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    query = db.query(RoomBlockModel).filter(
        RoomBlockModel.room_id == room_id, RoomBlockModel.is_active == True
    )

    # Filter by time range if provided
    if start_time:
        query = query.filter(RoomBlockModel.end_time > start_time)
    if end_time:
        query = query.filter(RoomBlockModel.start_time < end_time)

    blocks = query.order_by(RoomBlockModel.start_time).all()
    return blocks
