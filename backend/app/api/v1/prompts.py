import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.connection import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.prompt import PromptCreate, PromptUpdate, PromptResponse
from backend.app.services.prompt_service import PromptService

router = APIRouter()

@router.post("", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    obj_in: PromptCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new core Prompt entity and automatically snapshots Version 1 
    in the related prompt_versions table.
    """
    return await PromptService.create(db=db, user_id=current_user.id, obj_in=obj_in)

@router.get("", response_model=List[PromptResponse])
async def list_prompts(
    category: Optional[str] = Query(None, description="Filter prompts by category"),
    status: Optional[str] = Query("active", description="Filter prompts by status (active, archived)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists all prompts owned by the currently authenticated user.
    Supports filtering by active status or custom tags/categories.
    """
    return await PromptService.get_multi_by_user(
        db=db, user_id=current_user.id, category=category, status=status
    )

@router.get("/{id}", response_model=PromptResponse)
async def get_prompt_details(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves complete details of a prompt by UUID, including its entire 
    nested list of historical revisions/versions.
    """
    prompt = await PromptService.get_by_id(db=db, prompt_id=id, user_id=current_user.id)
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found or you do not have permission to view it."
        )
    return prompt

@router.put("/{id}", response_model=PromptResponse)
async def update_prompt(
    id: uuid.UUID,
    obj_in: PromptUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Modifies prompt configurations. If content has changed, this automatically 
    increments the version and records a change tracking summary.
    """
    prompt = await PromptService.get_by_id(db=db, prompt_id=id, user_id=current_user.id)
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found or you do not have permission to update it."
        )
    return await PromptService.update(db=db, db_prompt=prompt, obj_in=obj_in)

@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_prompt(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently deletes a prompt entity and cascade sweeps all historical versions 
    and associated pipeline execution logs from the database.
    """
    prompt = await PromptService.get_by_id(db=db, prompt_id=id, user_id=current_user.id)
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found or you do not have permission to delete it."
        )
    await PromptService.delete(db=db, db_prompt=prompt)
    return {"message": "Prompt successfully deleted", "id": str(id)}
