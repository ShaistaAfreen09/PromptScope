from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class OrganizationBase(BaseModel):
    name: str = Field(..., description="Organization/Workspace Name")
    slug: str = Field(..., description="Unique URL friendly identifier")

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: uuid.UUID
    plan_tier: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TeamMemberBase(BaseModel):
    organization_id: uuid.UUID
    user_id: uuid.UUID
    role: str = Field("member", description="Owner, Admin, Member")

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberResponse(TeamMemberBase):
    id: uuid.UUID
    joined_at: datetime

    class Config:
        from_attributes = True
