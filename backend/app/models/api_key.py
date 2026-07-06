import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, text, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.connection import Base

class APIKey(Base):
    __tablename__ = "api_keys"
    
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
    provider: Mapped[str] = mapped_column(
        String(100), # openai, anthropic, gemini, etc.
        nullable=False
    )
    encrypted_key: Mapped[str] = mapped_column(
        String(512), 
        nullable=False
    )
    masked_key: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True, 
        server_default=text("true"), 
        nullable=False
    )
    last_validated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow, 
        server_default=text("CURRENT_TIMESTAMP"), 
        nullable=False
    )
