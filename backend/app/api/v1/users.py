from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.connection import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse, UserUpdate
from backend.app.services.user_service import UserService

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile details.
    Protected by Firebase token authorization.
    """
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_my_profile(
    obj_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates the authenticated user's organization, display name, avatar, or settings.
    Saves changes to the Postgres SQL backend.
    """
    updated_user = await UserService.update(db=db, db_user=current_user, obj_in=obj_in)
    return updated_user
