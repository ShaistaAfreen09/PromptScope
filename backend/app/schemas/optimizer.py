from typing import Optional
from pydantic import BaseModel, Field

class PromptImproveRequest(BaseModel):
    prompt_text: str = Field(..., description="Prompt that needs structural optimization")
    system_instruction: Optional[str] = Field(None, description="Current system instructions")
    target_goal: Optional[str] = Field("Clarity, speed, and standard markdown layouts", description="Specific refinement target")

class MetricShifts(BaseModel):
    clarity_change: int = Field(..., description="Change in clarity score (e.g. +15)")
    specificity_change: int = Field(..., description="Change in specificity score (e.g. +20)")
    overall_change: int = Field(..., description="Change in overall quality score (e.g. +18)")

class PromptImproveResponse(BaseModel):
    success: bool = True
    original_prompt: str
    optimized_prompt: str
    explanation: str = Field(..., description="Markdown-styled details of enhancements made")
    metric_shifts: MetricShifts
    latency_ms: int
