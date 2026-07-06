from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.connection import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.services.report_service import ReportService

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def list_reports_summaries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns high-level metric summaries of all recorded multi-model test runs.
    """
    return await ReportService.get_reports_summary(db=db, user_id=current_user.id)

@router.post("/export")
async def export_reports_telemetry(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Gathers user's entire prompt telemetry archives and downloads it 
    as a clean CSV attachment.
    """
    try:
        csv_data = await ReportService.export_telemetry_csv(db=db, user_id=current_user.id)
        
        filename = f"promptscope_telemetry_{current_user.id}.csv"
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        
        return Response(
            content=csv_data, 
            media_type="text/csv", 
            headers=headers
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate telemetry export file: {str(e)}"
        )
