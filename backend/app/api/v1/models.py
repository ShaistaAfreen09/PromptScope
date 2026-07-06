import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.connection import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.execution import PromptExecutionCreate, PromptExecutionResponse
from backend.app.services.execution_service import ExecutionService

router = APIRouter()

@router.post("", response_model=PromptExecutionResponse, status_code=status.HTTP_201_CREATED)
async def run_multi_model_execution(
    obj_in: PromptExecutionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Dispatches a prompt instruction to a collection of selected generative models.
    Compiles response texts, runs qualitative quality evaluations, and logs costs.
    """
    try:
        execution = await ExecutionService.execute_multi_model(
            db=db, user_id=current_user.id, obj_in=obj_in
        )
        return execution
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute multi-model instruction: {str(e)}"
        )

@router.get("/history", response_model=List[PromptExecutionResponse])
async def list_execution_history(
    limit: int = Query(25, ge=1, le=100, description="Number of execution logs to fetch"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the complete historical list of multi-model prompt test runs 
    and their associated response logs.
    """
    return await ExecutionService.get_history_by_user(
        db=db, user_id=current_user.id, limit=limit
    )

@router.get("/{id}", response_model=PromptExecutionResponse)
async def get_execution_details(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the detailed results of a single prompt execution report by its unique ID.
    """
    execution = await ExecutionService.get_by_id(db=db, execution_id=id, user_id=current_user.id)
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution report not found."
        )
    return execution
