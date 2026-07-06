import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class PromptVersionResponse(BaseModel):
    id: uuid.UUID
    prompt_id: uuid.UUID
    version_number: int
    content: str
    system_instruction: Optional[str] = None
    change_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PromptBase(BaseModel):
    title: str = Field(..., max_length=255)
    content: str
    category: str = Field("General", max_length=100)
    status: str = Field("active", max_length=50)

class PromptCreate(PromptBase):
    system_instruction: Optional[str] = None

class PromptUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    system_instruction: Optional[str] = None
    change_summary: Optional[str] = Field("Optimized and adjusted parameter structures", max_length=512)

class PromptResponse(PromptBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    versions: Optional[List[PromptVersionResponse]] = []

    class Config:
        from_attributes = True
