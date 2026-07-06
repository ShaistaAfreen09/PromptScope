import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    organization: Optional[str] = None
    role: str = "user"

class UserCreate(UserBase):
    firebase_uid: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None

class UserResponse(UserBase):
    id: uuid.UUID
    firebase_uid: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
