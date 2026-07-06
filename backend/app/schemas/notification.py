from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class NotificationBase(BaseModel):
    title: str = Field(..., description="Short heading of the system alert")
    message: str = Field(..., description="Content details")
    type: str = Field("info", description="Alert category (report, api_key, usage, team, security)")

class NotificationCreate(NotificationBase):
    user_id: uuid.UUID

class NotificationUpdate(BaseModel):
    is_read: bool

class NotificationResponse(NotificationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
