import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("backend.middleware")

class ProcessTimeAndRateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds custom headers tracking API processing latency,
    records runtime telemetry, and outlines structure for rate limiting checks.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        
        # Here we could implement an IP or User Token based rate limit checker
        # utilizing a Redis cache or in-memory dictionary.
        # e.g., if rate_limit_exceeded(request.client.host): return 429
        
        response = await call_next(request)
        
        process_time_ms = int((time.time() - start_time) * 1000)
        response.headers["X-Process-Time-Ms"] = str(process_time_ms)
        
        # Log slow requests for production optimization
        if process_time_ms > 1500:
            logger.warning(
                f"Slow Request Detected: {request.method} {request.url.path} "
                f"completed in {process_time_ms}ms"
            )
            
        return response
