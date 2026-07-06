import logging
import sys
import json
from datetime import datetime
from typing import Any, Dict
from backend.app.core.config import settings

class StructuredJSONFormatter(logging.Formatter):
    """
    JSON formatter for structured logging in production.
    Ensures easy integration with Google Cloud Logging / Datadog.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcfromtimestamp(record.created).isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "filename": record.filename,
            "line_number": record.lineno,
            "func_name": record.funcName,
        }
        
        # Include extra attributes if passed
        if hasattr(record, "extra") and isinstance(record.extra, dict):
            for key, val in record.extra.items():
                if key not in log_data:
                    log_data[key] = val
                    
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_data)

def setup_logging() -> None:
    """Configures centralized logging system based on environment."""
    root_logger = logging.getLogger()
    
    # Clear existing handlers
    root_logger.handlers = []
    
    # Configure console handler
    console_handler = logging.StreamHandler(sys.stdout)
    
    if settings.ENV == "production":
        console_handler.setFormatter(StructuredJSONFormatter())
        root_logger.setLevel(logging.INFO)
    else:
        # User-friendly format for local debugging
        friendly_format = logging.Formatter(
            "[%(asctime)s] %(levelname)-8s in %(name)s (%(filename)s:%(lineno)d): %(message)s"
        )
        console_handler.setFormatter(friendly_format)
        root_logger.setLevel(logging.DEBUG)
        
    root_logger.addHandler(console_handler)
    
    # Silence third-party logs a bit
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
