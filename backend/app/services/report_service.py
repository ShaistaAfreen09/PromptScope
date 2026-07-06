import csv
import io
import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.app.models.execution import PromptExecution

class ReportService:
    @staticmethod
    async def get_reports_summary(db: AsyncSession, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        """Gathers higher-level summaries of all prompt performance metrics."""
        query = (
            select(PromptExecution)
            .where(PromptExecution.user_id == user_id)
            .options(selectinload(PromptExecution.responses))
            .order_by(PromptExecution.created_at.desc())
        )
        result = await db.execute(query)
        executions = result.scalars().all()
        
        reports = []
        for ex in executions:
            reports.append({
                "execution_id": str(ex.id),
                "timestamp": ex.created_at.isoformat(),
                "models_tested": ex.selected_models,
                "average_latency_ms": ex.average_latency_ms,
                "tokens_consumed": ex.total_tokens,
                "total_cost_usd": float(ex.total_cost_usd),
                "num_responses": len(ex.responses)
            })
        return reports

    @staticmethod
    async def export_telemetry_csv(db: AsyncSession, user_id: uuid.UUID) -> str:
        """
        Gathers complete telemetry archives for an authenticated user and 
        serializes records into a clean, compliant comma-separated CSV string.
        """
        query = (
            select(PromptExecution)
            .where(PromptExecution.user_id == user_id)
            .order_by(PromptExecution.created_at.desc())
        )
        result = await db.execute(query)
        executions = result.scalars().all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow([
            "Execution ID", 
            "Timestamp", 
            "Models Configured", 
            "Avg Latency (ms)", 
            "Tokens Consumed", 
            "Calculated Cost (USD)"
        ])
        
        # Write rows
        for ex in executions:
            writer.writerow([
                str(ex.id),
                ex.created_at.isoformat() + "Z",
                ", ".join(ex.selected_models),
                ex.average_latency_ms,
                ex.total_tokens,
                f"{float(ex.total_cost_usd):.6f}"
            ])
            
        return output.getvalue()
