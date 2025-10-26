from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class User(BaseModel):
    id: Optional[int] = None
    username: str
    email: str
    full_name: str
    password: str
    is_active: bool = True
    is_admin: bool = False
    created_at: Optional[datetime] = None


class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
