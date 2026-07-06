import uuid
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from backend.app.database.connection import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.models.execution import PromptExecution, AIResponse, Analytics
from backend.app.schemas.analytics import AnalyticsDashboardResponse, DashboardStats
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
async def get_dashboard_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Gathers high-level telemetry and financial metrics for the active user,
    including cumulative costs, tokens, and quality score timelines.
    """
    return await AnalyticsService.get_dashboard_data(db=db, user_id=current_user.id)

@router.get("/prompt/{id}")
async def get_prompt_level_analytics(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves execution performance metrics isolated to a specific Prompt entity,
    including average scores and cost graphs.
    """
    # Verify prompt exists and belongs to user
    from backend.app.models.prompt import Prompt
    p_check = await db.execute(select(Prompt).where(Prompt.id == id, Prompt.user_id == current_user.id))
    prompt = p_check.scalars().first()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found or you do not have permission to view its analytics."
        )
        
    # Aggregate prompt stats
    stats_query = (
        select(
            func.count(PromptExecution.id).label("count"),
            func.sum(PromptExecution.total_tokens).label("tokens"),
            func.sum(PromptExecution.total_cost_usd).label("cost"),
            func.avg(PromptExecution.average_latency_ms).label("latency")
        )
        .where(PromptExecution.prompt_id == id)
    )
    stats_res = await db.execute(stats_query)
    row = stats_res.first()
    
    # Calculate average scores
    avg_scores_query = (
        select(
            func.avg(Analytics.clarity_score).label("clarity"),
            func.avg(Analytics.specificity_score).label("specificity"),
            func.avg(Analytics.relevance_score).label("relevance"),
            func.avg(Analytics.overall_score).label("overall")
        )
        .join(AIResponse, Analytics.response_id == AIResponse.id)
        .join(PromptExecution, AIResponse.execution_id == PromptExecution.id)
        .where(PromptExecution.prompt_id == id)
    )
    scores_res = await db.execute(avg_scores_query)
    scores_row = scores_res.first()
    
    return {
        "prompt_id": str(id),
        "prompt_title": prompt.title,
        "executions_count": row.count if row and row.count else 0,
        "total_tokens": int(row.tokens) if row and row.tokens else 0,
        "total_cost_usd": float(row.cost) if row and row.cost else 0.0,
        "avg_latency_ms": int(row.latency) if row and row.latency else 0,
        "average_quality_scores": {
            "clarity": float(scores_row.clarity or 0.0),
            "specificity": float(scores_row.specificity or 0.0),
            "relevance": float(scores_row.relevance or 0.0),
            "overall": float(scores_row.overall or 0.0)
        }
    }
