import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_

from backend.app.models.prompt import Prompt
from backend.app.models.execution import PromptExecution, AIResponse, Analytics
from backend.app.schemas.analytics import (
    AnalyticsDashboardResponse, DashboardStats, ModelPerformanceMetrics, DailyUsageMetric
)

class AnalyticsService:
    @staticmethod
    async def get_dashboard_data(db: AsyncSession, user_id: uuid.UUID) -> AnalyticsDashboardResponse:
        """
        Gathers complete analytical dashboard statistics, including total runs, 
        costs, model latencies, and qualitative quality rating distributions.
        """
        # 1. Gather Prompt Counts
        p_count_query = select(func.count(Prompt.id)).where(Prompt.user_id == user_id)
        p_count_res = await db.execute(p_count_query)
        total_prompts = p_count_res.scalar() or 0
        
        # 2. Gather Execution Counts & Totals
        exec_stats_query = (
            select(
                func.count(PromptExecution.id).label("count"),
                func.sum(PromptExecution.total_tokens).label("tokens"),
                func.sum(PromptExecution.total_cost_usd).label("cost"),
                func.avg(PromptExecution.average_latency_ms).label("latency")
            )
            .where(PromptExecution.user_id == user_id)
        )
        exec_stats_res = await db.execute(exec_stats_query)
        exec_row = exec_stats_res.first()
        
        total_executions = exec_row.count if exec_row and exec_row.count else 0
        total_tokens = int(exec_row.tokens) if exec_row and exec_row.tokens else 0
        total_cost_usd = float(exec_row.cost) if exec_row and exec_row.cost else 0.0
        avg_latency_ms = int(exec_row.latency) if exec_row and exec_row.latency else 0
        
        # 3. Calculate Overall Scores
        avg_score_query = (
            select(func.avg(Analytics.overall_score))
            .join(AIResponse, Analytics.response_id == AIResponse.id)
            .join(PromptExecution, AIResponse.execution_id == PromptExecution.id)
            .where(PromptExecution.user_id == user_id)
        )
        avg_score_res = await db.execute(avg_score_query)
        average_score = float(avg_score_res.scalar() or 0.0)
        
        summary = DashboardStats(
            total_prompts=total_prompts,
            total_executions=total_executions,
            total_tokens=total_tokens,
            total_cost_usd=total_cost_usd,
            average_score=average_score,
            avg_latency_ms=avg_latency_ms
        )
        
        # 4. Model-By-Model breakdown metrics
        model_metrics_query = (
            select(
                AIResponse.model_name,
                AIResponse.provider,
                func.avg(AIResponse.response_time_ms).label("latency"),
                func.avg(Analytics.clarity_score).label("clarity"),
                func.avg(Analytics.overall_score).label("overall"),
                func.count(AIResponse.id).label("count"),
                func.sum(AIResponse.cost).label("cost")
            )
            .join(Analytics, Analytics.response_id == AIResponse.id)
            .join(PromptExecution, AIResponse.execution_id == PromptExecution.id)
            .where(PromptExecution.user_id == user_id)
            .group_by(AIResponse.model_name, AIResponse.provider)
        )
        model_metrics_res = await db.execute(model_metrics_query)
        model_performance: List[ModelPerformanceMetrics] = []
        
        for row in model_metrics_res.all():
            model_performance.append(ModelPerformanceMetrics(
                model_name=row.model_name,
                provider=row.provider,
                avg_latency_ms=int(row.latency or 0),
                avg_clarity_score=float(row.clarity or 0.0),
                avg_overall_score=float(row.overall or 0.0),
                total_executions=row.count,
                total_cost_usd=float(row.cost or 0.0)
            ))
            
        # If no metrics recorded yet, provide mock guidelines for UI seeding
        if not model_performance:
            model_performance = [
                ModelPerformanceMetrics(
                    model_name="Gemini 3.5 Flash", provider="Google", 
                    avg_latency_ms=180, avg_clarity_score=85.0, avg_overall_score=88.0, 
                    total_executions=0, total_cost_usd=0.0
                ),
                ModelPerformanceMetrics(
                    model_name="GPT-4o (Omni)", provider="OpenAI", 
                    avg_latency_ms=450, avg_clarity_score=92.0, avg_overall_score=94.0, 
                    total_executions=0, total_cost_usd=0.0
                )
            ]
            
        # 5. Compile Daily Timeline usage trends (last 7 days)
        daily_usage: List[DailyUsageMetric] = []
        for i in range(6, -1, -1):
            target_date = (datetime.utcnow() - timedelta(days=i)).date()
            start_dt = datetime.combine(target_date, datetime.min.time())
            end_dt = datetime.combine(target_date, datetime.max.time())
            
            day_query = (
                select(
                    func.count(PromptExecution.id).label("count"),
                    func.sum(PromptExecution.total_tokens).label("tokens"),
                    func.sum(PromptExecution.total_cost_usd).label("cost")
                )
                .where(
                    and_(
                        PromptExecution.user_id == user_id,
                        PromptExecution.created_at >= start_dt,
                        PromptExecution.created_at <= end_dt
                    )
                )
            )
            day_res = await db.execute(day_query)
            day_row = day_res.first()
            
            daily_usage.append(DailyUsageMetric(
                date=target_date.strftime("%Y-%m-%d"),
                executions_count=day_row.count if day_row and day_row.count else 0,
                tokens_consumed=int(day_row.tokens) if day_row and day_row.tokens else 0,
                cost_usd=float(day_row.cost) if day_row and day_row.cost else 0.0
            ))
            
        # 6. Category distributions counts
        cat_query = (
            select(Prompt.category, func.count(Prompt.id))
            .where(Prompt.user_id == user_id)
            .group_by(Prompt.category)
        )
        cat_res = await db.execute(cat_query)
        category_distribution = {row[0]: row[1] for row in cat_res.all()}
        
        if not category_distribution:
            category_distribution = {"Research": 0, "Programming": 0, "General": 0}
            
        return AnalyticsDashboardResponse(
            summary=summary,
            model_performance=model_performance,
            daily_usage=daily_usage,
            category_distribution=category_distribution
        )
