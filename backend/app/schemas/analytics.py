from typing import List, Dict, Any
from pydantic import BaseModel

class ModelPerformanceMetrics(BaseModel):
    model_name: str
    provider: str
    avg_latency_ms: int
    avg_clarity_score: float
    avg_overall_score: float
    total_executions: int
    total_cost_usd: float

class DailyUsageMetric(BaseModel):
    date: str
    executions_count: int
    tokens_consumed: int
    cost_usd: float

class DashboardStats(BaseModel):
    total_prompts: int
    total_executions: int
    total_tokens: int
    total_cost_usd: float
    average_score: float
    avg_latency_ms: int

class AnalyticsDashboardResponse(BaseModel):
    summary: DashboardStats
    model_performance: List[ModelPerformanceMetrics]
    daily_usage: List[DailyUsageMetric]
    category_distribution: Dict[str, int]
