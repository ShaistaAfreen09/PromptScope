import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.connection import Base

class Report(Base):
    __tablename__ = "reports"
    
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
    title: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    report_type: Mapped[str] = mapped_column(
        String(100), # prompt_performance, model_benchmark, usage_analytics
        nullable=False
    )
    format: Mapped[str] = mapped_column(
        String(20), # pdf, csv, json
        nullable=False
    )
    data: Mapped[dict] = mapped_column(
        JSON,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow, 
        server_default=text("CURRENT_TIMESTAMP"), 
        nullable=False
    )
