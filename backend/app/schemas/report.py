from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class ReportBase(BaseModel):
    title: str = Field(..., description="Report name/title")
    report_type: str = Field(..., description="Type (prompt_performance, model_benchmark, usage_analytics)")
    format: str = Field(..., description="Format (pdf, csv, json)")

class ReportCreate(ReportBase):
    data: Dict[str, Any] = Field(..., description="Raw or aggregated JSON data block")

class ReportResponse(ReportBase):
    id: uuid.UUID
    user_id: uuid.UUID
    data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
