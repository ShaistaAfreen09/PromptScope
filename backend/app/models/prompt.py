import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.connection import Base

class Prompt(Base):
    __tablename__ = "prompts"
    
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
        nullable=False,
        index=True
    )
    content: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )
    category: Mapped[str] = mapped_column(
        String(100), 
        default="General", 
        server_default="General",
        nullable=False,
        index=True
    )
    status: Mapped[str] = mapped_column(
        String(50), 
        default="active", 
        server_default="active", 
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
    user: Mapped["User"] = relationship("User", back_populates="prompts")
    versions: Mapped[list["PromptVersion"]] = relationship(
        "PromptVersion", 
        back_populates="prompt", 
        cascade="all, delete-orphan",
        order_by="PromptVersion.version_number.desc()"
    )
    executions: Mapped[list["PromptExecution"]] = relationship(
        "PromptExecution", 
        back_populates="prompt", 
        cascade="all, delete-orphan"
    )

class PromptVersion(Base):
    __tablename__ = "prompt_versions"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4, 
        server_default=text("gen_random_uuid()")
    )
    prompt_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("prompts.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    version_number: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )
    content: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )
    system_instruction: Mapped[str] = mapped_column(
        Text, 
        nullable=True
    )
    change_summary: Mapped[str] = mapped_column(
        String(512), 
        nullable=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow, 
        server_default=text("CURRENT_TIMESTAMP"), 
        nullable=False
    )

    # Relationships
    prompt: Mapped["Prompt"] = relationship("Prompt", back_populates="versions")
