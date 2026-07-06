import pytest
from httpx import AsyncClient
from fastapi import status
from backend.app.main import app
from backend.app.core.config import settings

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.mark.anyio
async def test_health_endpoint():
    """Verify operational health checks respond with appropriate status payloads."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "status": "healthy",
        "service": "PromptScope API",
        "version": settings.VERSION
    }

@pytest.mark.anyio
async def test_unauthorized_endpoints():
    """Verify routes enforce strict authorization protocols with appropriate errors."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get(f"{settings.API_V1_STR}/prompts")
    
    # Standard security mandates dictate 401 Unauthorized or 403 Forbidden for missing credentials
    assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]

@pytest.mark.anyio
async def test_invalid_request_validation():
    """Verify global exception filters capture and format validation failures beautifully."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Posting empty JSON or malformed payloads to test validation handlers
        response = await ac.post(f"{settings.API_V1_STR}/prompts", json={})
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert "details" in data
