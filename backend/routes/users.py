from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from models.users import User, UserCreate, UserUpdate

router = APIRouter()

# In-memory storage for demo purposes
users_db = []
next_user_id = 1


@router.get("/users", response_model=List[User])
async def get_users():
    """Get all users"""
    return users_db


@router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    """Get a specific user by ID"""
    for user in users_db:
        if user.id == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")


@router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    global next_user_id

    # Check if username or email already exists
    for user in users_db:
        if user.username == user_data.username:
            raise HTTPException(status_code=400, detail="Username already exists")
        if user.email == user_data.email:
            raise HTTPException(status_code=400, detail="Email already exists")

    # Create new user
    new_user = User(
        id=next_user_id,
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        is_active=True,
        created_at=datetime.now(),
    )

    users_db.append(new_user)
    next_user_id += 1

    return new_user


@router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, user_data: UserUpdate):
    """Update a user"""
    for i, user in enumerate(users_db):
        if user.id == user_id:
            # Check for duplicate username/email if being updated
            if user_data.username:
                for other_user in users_db:
                    if (
                        other_user.id != user_id
                        and other_user.username == user_data.username
                    ):
                        raise HTTPException(
                            status_code=400, detail="Username already exists"
                        )
            if user_data.email:
                for other_user in users_db:
                    if other_user.id != user_id and other_user.email == user_data.email:
                        raise HTTPException(
                            status_code=400, detail="Email already exists"
                        )

            # Update user
            updated_user = user.copy(update=user_data.dict(exclude_unset=True))
            users_db[i] = updated_user
            return updated_user

    raise HTTPException(status_code=404, detail="User not found")


@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    """Delete a user"""
    for i, user in enumerate(users_db):
        if user.id == user_id:
            del users_db[i]
            return {"message": "User deleted successfully"}

    raise HTTPException(status_code=404, detail="User not found")
