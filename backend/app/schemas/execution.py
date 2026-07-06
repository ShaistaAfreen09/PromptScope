import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class AnalyticsResponse(BaseModel):
    id: uuid.UUID
    clarity_score: int
    specificity_score: int
    relevance_score: int
    completeness_score: int
    creativity_score: int
    overall_score: int
    feedback_summary: Optional[str] = None

    class Config:
        from_attributes = True

class AIResponseResponse(BaseModel):
    id: uuid.UUID
    provider: str
    model_name: str
    response_text: str
    response_time_ms: int
    token_count: int
    cost: float
    analytics: Optional[AnalyticsResponse] = None

    class Config:
        from_attributes = True

class PromptExecutionCreate(BaseModel):
    prompt_id: Optional[uuid.UUID] = None
    selected_models: List[str] = Field(..., min_items=1)
    prompt_text: str
    system_instruction: Optional[str] = None
    category: str = "General"

class PromptExecutionResponse(BaseModel):
    id: uuid.UUID
    prompt_id: Optional[uuid.UUID] = None
    user_id: uuid.UUID
    selected_models: List[str]
    average_latency_ms: int
    total_tokens: int
    total_cost_usd: float
    created_at: datetime
    responses: List[AIResponseResponse] = []

    class Config:
        from_attributes = True
