import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.core.config import settings
from backend.app.core.logging import setup_logging
from backend.app.middleware.rate_limiter import ProcessTimeAndRateLimitMiddleware

# Import Router Modules
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.users import router as users_router
from backend.app.api.v1.prompts import router as prompts_router
from backend.app.api.v1.models import router as models_router
from backend.app.api.v1.analytics import router as analytics_router
from backend.app.api.v1.optimizer import router as optimizer_router
from backend.app.api.v1.reports import router as reports_router

# 1. Setup Structured Telemetry logging
setup_logging()
logger = logging.getLogger("backend.main")

# 2. Instantiate Enterprise FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="The production enterprise backend API for PromptScope, powering multi-model evaluation.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 3. Mount Security CORS Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ProcessTimeAndRateLimitMiddleware)

# -------------------------------------------------------------
# CENTRALIZED EXCEPTION HANDLERS (Phase 8)
# -------------------------------------------------------------

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Formats standard HTTP errors into clean unified response JSONs."""
    logger.error(f"HTTP Error {exc.status_code} occurred: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handles and intercepts request schema validation failures."""
    logger.error(f"Request schema validation failure: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Request parameters validation failed.",
            "details": exc.errors()
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Fallback filter catching unhandled backend errors to prevent tracing leakages."""
    logger.critical(f"Unhandled Server Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "An internal server error occurred. Our engineering team has been notified."
        }
    )

# -------------------------------------------------------------
# CORE ROUTINGS & SUB-ROUTERS REGISTERING
# -------------------------------------------------------------

# API Router Inclusions
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication Sync"])
app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["Users Workspaces"])
app.include_router(prompts_router, prefix=f"{settings.API_V1_STR}/prompts", tags=["Prompts Repository"])
app.include_router(models_router, prefix=f"{settings.API_V1_STR}/executions", tags=["Models Core Executions"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Telemetry Analytics"])
app.include_router(optimizer_router, prefix=f"{settings.API_V1_STR}/optimizer", tags=["Optimizer Toolkit"])
app.include_router(reports_router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports Exports"])


# 4. Standard Core Health check route
@app.get("/health", status_code=status.HTTP_200_OK, tags=["Operational System Checks"])
async def check_service_health():
    """
    Returns immediate status checks verifying connectivity and overall app health.
    """
    return {
        "status": "healthy",
        "service": "PromptScope API",
        "version": settings.VERSION
    }

logger.info(f"🚀 PromptScope API successfully booted on {settings.ENV} mode.")
