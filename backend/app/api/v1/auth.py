from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.connection import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse

router = APIRouter()

@router.post("/sync", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def sync_firebase_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Synchronizes and registers user metadata from their Firebase ID Token.
    Returns the fully hydrated Postgres SQL user record.
    """
    # get_current_user dependency automatically auto-provisions and returns
    # the user record upon verifying valid JWT credentials.
    return current_user
