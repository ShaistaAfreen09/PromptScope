import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.connection import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4, 
        server_default=text("gen_random_uuid()")
    )
    firebase_uid: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        nullable=False, 
        index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        nullable=False, 
        index=True
    )
    full_name: Mapped[str] = mapped_column(
        String(255), 
        nullable=True
    )
    avatar_url: Mapped[str] = mapped_column(
        String(1024), 
        nullable=True
    )
    organization: Mapped[str] = mapped_column(
        String(255), 
        nullable=True
    )
    role: Mapped[str] = mapped_column(
        String(50), 
        default="user", 
        server_default="user", 
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
    prompts: Mapped[list["Prompt"]] = relationship(
        "Prompt", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    executions: Mapped[list["PromptExecution"]] = relationship(
        "PromptExecution", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
