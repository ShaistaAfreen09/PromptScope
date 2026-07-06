from backend.app.database.connection import Base
from backend.app.models.user import User
from backend.app.models.prompt import Prompt, PromptVersion
from backend.app.models.execution import PromptExecution, AIResponse, Analytics
from backend.app.models.organization import Organization
from backend.app.models.team_member import TeamMember
from backend.app.models.api_key import APIKey
from backend.app.models.report import Report
from backend.app.models.template import PromptTemplateModel
from backend.app.models.notification import Notification
from backend.app.models.activity_log import ActivityLog

# Export all models for easier imports and Alembic migrations detection
__all__ = [
    "Base",
    "User",
    "Prompt",
    "PromptVersion",
    "PromptExecution",
    "AIResponse",
    "Analytics",
    "Organization",
    "TeamMember",
    "APIKey",
    "Report",
    "PromptTemplateModel",
    "Notification",
    "ActivityLog"
]

