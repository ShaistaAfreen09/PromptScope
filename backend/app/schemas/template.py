from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class TemplateBase(BaseModel):
    name: str = Field(..., description="Prompt template name")
    description: str = Field(..., description="Short explanation of what this prompt template accomplishes")
    category: str = Field(..., description="Software Development, Marketing, Business, etc.")
    prompt_text: str = Field(..., description="The template body instructions")
    system_instruction: Optional[str] = Field(None, description="System persona context directives")
    tags: List[str] = Field(default=[], description="Metadata tags")
    is_private: bool = Field(default=True, description="Private or public template")

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    prompt_text: Optional[str] = None
    system_instruction: Optional[str] = None
    tags: Optional[List[str]] = None
    is_private: Optional[bool] = None

class TemplateResponse(TemplateBase):
    id: uuid.UUID
    user_id: uuid.UUID
    organization_id: Optional[uuid.UUID] = None
    performance_score: float
    usage_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
