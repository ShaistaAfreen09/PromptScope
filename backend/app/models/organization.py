import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.connection import Base

class Organization(Base):
    __tablename__ = "organizations"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4, 
        server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    slug: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        nullable=False,
        index=True
    )
    plan_tier: Mapped[str] = mapped_column(
        String(50), 
        default="enterprise_trial", 
        server_default="enterprise_trial", 
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

    # Relationships
    members: Mapped[list["TeamMember"]] = relationship(
        "TeamMember", 
        back_populates="organization", 
        cascade="all, delete-orphan"
    )
    templates: Mapped[list["PromptTemplateModel"]] = relationship(
        "PromptTemplateModel", 
        back_populates="organization",
        cascade="all, delete"
    )
