from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from sqlalchemy.orm import Session
from models.users import UserResponse, UserUpdate, User as UserModel
from utils.auth import (
    get_current_active_user,
    require_admin,
    get_password_hash,
    get_user_by_email,
)
from db import get_db

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user: UserModel = Depends(get_current_active_user)):
    """Get current authenticated user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update current authenticated user"""
    # Check if email is being changed and if it already exists
    if user_data.email and user_data.email != current_user.email:
        existing_user = get_user_by_email(db, email=user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        current_user.email = user_data.email

    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name

    if user_data.password is not None:
        current_user.hashed_password = get_password_hash(user_data.password)

    # Regular users cannot change their admin status or active status
    # Only admins can do that (see admin endpoints)

    db.commit()
    db.refresh(current_user)
    return current_user


# Admin-only endpoints
@router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users_admin(
    current_user: UserModel = Depends(require_admin), db: Session = Depends(get_db)
):
    """Get all users (admin only) - includes inactive users"""
    return db.query(UserModel).all()


@router.get("/admin/users/{user_id}", response_model=UserResponse)
async def get_user_admin(
    user_id: int,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get a specific user by ID (admin only)"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: int,
    user_data: UserUpdate,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a user (admin only)"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check for duplicate email if being updated
    if user_data.email and user_data.email != user.email:
        existing_user = get_user_by_email(db, email=user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        user.email = user_data.email

    if user_data.full_name is not None:
        user.full_name = user_data.full_name

    if user_data.password is not None:
        user.hashed_password = get_password_hash(user_data.password)

    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    if user_data.is_admin is not None:
        user.is_admin = user_data.is_admin

    if user_data.is_faculty is not None:
        user.is_faculty = user_data.is_faculty

    db.commit()
    db.refresh(user)
    return user


@router.delete("/admin/users/{user_id}")
async def delete_user_admin(
    user_id: int,
    current_user: UserModel = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a user (admin only)"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
