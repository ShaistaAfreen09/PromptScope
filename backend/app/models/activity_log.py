import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.connection import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4, 
        server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    action: Mapped[str] = mapped_column(
        String(255), # prompt_create, prompt_optimize, report_generate, api_key_added, etc.
        nullable=False
    )
    description: Mapped[str] = mapped_column(
        String(1024), 
        nullable=False
    )
    ip_address: Mapped[str] = mapped_column(
        String(45), # supports both IPv4 and IPv6
        nullable=True
    )
    metadata_json: Mapped[dict] = mapped_column(
        JSON,
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow, 
        server_default=text("CURRENT_TIMESTAMP"), 
        nullable=False
    )
