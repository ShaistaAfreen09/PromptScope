from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class APIKeyBase(BaseModel):
    provider: str = Field(..., description="Provider name (openai, anthropic, gemini)")
    masked_key: str = Field(..., description="Masked key representation, e.g., sk-*************8Hd2")

class APIKeyCreate(BaseModel):
    provider: str = Field(..., description="AI Provider name")
    raw_key: str = Field(..., description="Raw secret API Key before encryption and database storage")

class APIKeyUpdate(BaseModel):
    is_active: Optional[bool] = None
    raw_key: Optional[str] = None

class APIKeyResponse(APIKeyBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_active: bool
    last_validated_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
