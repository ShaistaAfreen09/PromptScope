import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, text, Integer, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.connection import Base

class PromptExecution(Base):
    __tablename__ = "prompt_executions"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4, 
        server_default=text("gen_random_uuid()")
    )
    prompt_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("prompts.id", ondelete="SET NULL"), 
        nullable=True, 
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    
    # Store selected models as a JSON array
    selected_models: Mapped[list[str]] = mapped_column(
        JSON, 
        nullable=False
    )
    
    average_latency_ms: Mapped[int] = mapped_column(
        Integer, 
        default=0, 
        nullable=False
    )
    total_tokens: Mapped[int] = mapped_column(
        Integer, 
        default=0, 
        nullable=False
    )
    total_cost_usd: Mapped[float] = mapped_column(
        Numeric(12, 6), 
        default=0.0, 
        nullable=False
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow, 
        server_default=text("CURRENT_TIMESTAMP"), 
        nullable=False,
        index=True
    )

    # Relationships
    prompt: Mapped["Prompt"] = relationship("Prompt", back_populates="executions")
    user: Mapped["User"] = relationship("User", back_populates="executions")
    responses: Mapped[list["AIResponse"]] = relationship(
        "AIResponse", 
        back_populates="execution", 
        cascade="all, delete-orphan"
    )

class AIResponse(Base):
    __tablename__ = "ai_responses"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4, 
        server_default=text("gen_random_uuid()")
    )
    execution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("prompt_executions.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    
    provider: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )
    model_name: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )
    response_text: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )
    response_time_ms: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )
    token_count: Mapped[int] = mapped_column(
        Integer, 
        default=0, 
        nullable=False
    )
    cost: Mapped[float] = mapped_column(
        Numeric(12, 6), 
        default=0.0, 
        nullable=False
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow, 
        server_default=text("CURRENT_TIMESTAMP"), 
        nullable=False
    )

    # Relationships
    execution: Mapped["PromptExecution"] = relationship("PromptExecution", back_populates="responses")
    analytics: Mapped["Analytics"] = relationship(
        "Analytics", 
        back_populates="response", 
        cascade="all, delete-orphan",
        uselist=False
    )

class Analytics(Base):
    __tablename__ = "analytics_reports"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4, 
        server_default=text("gen_random_uuid()")
    )
    response_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("ai_responses.id", ondelete="CASCADE"), 
        unique=True,
        nullable=False, 
        index=True
    )
    
    clarity_score: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )
    specificity_score: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )
    relevance_score: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )
    completeness_score: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )
    creativity_score: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )
    overall_score: Mapped[int] = mapped_column(
        Integer, 
        nullable=False
    )
    feedback_summary: Mapped[str] = mapped_column(
        Text, 
        nullable=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.utcnow, 
        server_default=text("CURRENT_TIMESTAMP"), 
        nullable=False
    )

    # Relationships
    response: Mapped["AIResponse"] = relationship("AIResponse", back_populates="analytics")
