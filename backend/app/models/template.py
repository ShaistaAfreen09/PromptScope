import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, text, ForeignKey, JSON, Integer, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.connection import Base

class PromptTemplateModel(Base):
    __tablename__ = "prompt_templates"
    
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
    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    name: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    description: Mapped[str] = mapped_column(
        String(1024), 
        nullable=False
    )
    category: Mapped[str] = mapped_column(
        String(100), # Software Development, Marketing, Business, etc.
        nullable=False,
        index=True
    )
    prompt_text: Mapped[str] = mapped_column(
        text, 
        nullable=False
    )
    system_instruction: Mapped[str] = mapped_column(
        String(2048),
        nullable=True
    )
    tags: Mapped[list] = mapped_column(
        JSON, # list of strings
        nullable=False
    )
    performance_score: Mapped[float] = mapped_column(
        Float, 
        default=0.0, 
        server_default=text("0.0"), 
        nullable=False
    )
    usage_count: Mapped[int] = mapped_column(
        Integer, 
        default=0, 
        server_default=text("0"), 
        nullable=False
    )
    is_private: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow, 
        server_default=text("CURRENT_TIMESTAMP"), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow, 
        server_default=text("CURRENT_TIMESTAMP"), 
        onupdate=datetime.utcnow, 
        nullable=False
    )

    # Relationship to organization
    organization: Mapped["Organization"] = relationship(
        "Organization", 
        back_populates="templates"
    )
