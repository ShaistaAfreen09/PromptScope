from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class ActivityLogBase(BaseModel):
    action: str = Field(..., description="The event identifier, e.g. prompt_create")
    description: str = Field(..., description="Human readable description")

class ActivityLogCreate(ActivityLogBase):
    user_id: uuid.UUID
    ip_address: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class ActivityLogResponse(ActivityLogBase):
    id: uuid.UUID
    user_id: uuid.UUID
    ip_address: Optional[str]
    metadata_json: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True
