from fastapi import APIRouter, Depends, status, HTTPException
from backend.app.schemas.optimizer import PromptImproveRequest, PromptImproveResponse
from backend.app.services.optimization_service import OptimizationService
from backend.app.core.security import get_current_user
from backend.app.models.user import User

router = APIRouter()

@router.post("/improve", response_model=PromptImproveResponse, status_code=status.HTTP_200_OK)
async def improve_user_prompt(
    obj_in: PromptImproveRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Applies standard prompt engineering structures (role, negative constraints,
    clarity adjustments) to rewrite and return an optimized prompt.
    """
    try:
        response = await OptimizationService.improve_prompt(obj_in)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prompt optimization compiler failed: {str(e)}"
        )
