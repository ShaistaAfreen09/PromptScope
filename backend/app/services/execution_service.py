import uuid
import asyncio
import random
import logging
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.app.models.execution import PromptExecution, AIResponse, Analytics
from backend.app.schemas.execution import PromptExecutionCreate

logger = logging.getLogger(__name__)

# Core Model Metadata Table for pricing and context metrics
MODEL_PRICING = {
    "gemini-3.5-flash": {"provider": "Google", "name": "Gemini 3.5 Flash", "input_million": 0.075, "output_million": 0.30},
    "gemini-3.5-pro": {"provider": "Google", "name": "Gemini 3.5 Pro", "input_million": 1.25, "output_million": 5.00},
    "gpt-4o": {"provider": "OpenAI", "name": "GPT-4o (Omni)", "input_million": 5.00, "output_million": 15.00},
    "claude-3-5-sonnet": {"provider": "Anthropic", "name": "Claude 3.5 Sonnet", "input_million": 3.00, "output_million": 15.00}
}

class ExecutionService:
    @staticmethod
    async def get_by_id(db: AsyncSession, execution_id: uuid.UUID, user_id: uuid.UUID) -> Optional[PromptExecution]:
        """Resolves execution report by UUID owned by user."""
        query = (
            select(PromptExecution)
            .where(PromptExecution.id == execution_id, PromptExecution.user_id == user_id)
            .options(
                selectinload(PromptExecution.responses).selectinload(AIResponse.analytics)
            )
        )
        result = await db.execute(query)
        return result.scalars().first()

    @staticmethod
    async def get_history_by_user(
        db: AsyncSession, 
        user_id: uuid.UUID, 
        limit: int = 50
    ) -> List[PromptExecution]:
        """Queries telemetry archives for an authenticated user."""
        query = (
            select(PromptExecution)
            .where(PromptExecution.user_id == user_id)
            .options(
                selectinload(PromptExecution.responses).selectinload(AIResponse.analytics)
            )
            .order_by(PromptExecution.created_at.desc())
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def execute_multi_model(
        db: AsyncSession, 
        user_id: uuid.UUID, 
        obj_in: PromptExecutionCreate
    ) -> PromptExecution:
        """
        Orchestrates parallel model executions, processes quality ratings,
        and saves execution headers, responses, and metrics.
        """
        start_time_all = datetime.utcnow()
        
        # Instantiate Execution Header
        execution = PromptExecution(
            user_id=user_id,
            prompt_id=obj_in.prompt_id,
            selected_models=obj_in.selected_models,
            average_latency_ms=0,
            total_tokens=0,
            total_cost_usd=0.0
        )
        db.add(execution)
        await db.flush()  # Resolve execution.id
        
        # Dispatch model tasks concurrently to prevent blocking
        tasks = [
            ExecutionService._execute_single_model_async(
                execution.id, 
                model_id, 
                obj_in.prompt_text, 
                obj_in.system_instruction
            )
            for model_id in obj_in.selected_models
        ]
        
        responses_list = await asyncio.gather(*tasks)
        
        # Sum statistics
        total_latency = 0
        total_tokens = 0
        total_cost = 0.0
        
        for response, analytics in responses_list:
            db.add(response)
            await db.flush() # Resolve response.id
            
            analytics.response_id = response.id
            db.add(analytics)
            
            total_latency += response.response_time_ms
            total_tokens += response.token_count
            total_cost += float(response.cost)
            
        # Update header stats
        num_responses = len(responses_list)
        execution.average_latency_ms = int(total_latency / num_responses) if num_responses > 0 else 0
        execution.total_tokens = total_tokens
        execution.total_cost_usd = total_cost
        
        db.add(execution)
        await db.commit()
        
        # Query fully populated execution entity with relations
        query = (
            select(PromptExecution)
            .where(PromptExecution.id == execution.id)
            .options(
                selectinload(PromptExecution.responses).selectinload(AIResponse.analytics)
            )
        )
        reload_res = await db.execute(query)
        return reload_res.scalars().first()

    @staticmethod
    async def _execute_single_model_async(
        execution_id: uuid.UUID, 
        model_id: str, 
        prompt_text: str, 
        system_instruction: Optional[str]
    ) -> tuple[AIResponse, Analytics]:
        """
        Simulates concurrent call to an LLM provider and analyzes its output qualities.
        Employs different styles, costs, and latent profiles reflecting real personalities.
        """
        # Yield thread to simulate external I/O API wait times
        simulated_delay = random.uniform(0.3, 1.2)
        await asyncio.sleep(simulated_delay)
        
        latency_ms = int(simulated_delay * 1000)
        
        pricing = MODEL_PRICING.get(model_id, {
            "provider": "Custom", 
            "name": model_id, 
            "input_million": 0.1, 
            "output_million": 0.2
        })
        
        # Content Generator matching provider specifications
        response_text = ""
        if pricing["provider"] == "Google":
            response_text = f"### ⚡ Native Execution Output ({pricing['name']} Response)\n\n" \
                            f"I have successfully compiled your prompt: *\"{prompt_text[:60]}...\"*\n\n" \
                            f"**1. Operational Summary:**\n" \
                            f"* Mapped instruction token densities accurately.\n" \
                            f"* Systemic boundaries align perfectly with core directives.\n" \
                            f"* Formatted inside a clean Markdown code layout to reduce parsing errors.\n\n" \
                            f"Ready for deployment staging!"
        elif pricing["provider"] == "OpenAI":
            response_text = f"### 🌟 Core Executive Analysis (GPT-4o Style Response)\n\n" \
                            f"Thank you for your prompt relative to: **\"{prompt_text[:50]}...\"**\n\n" \
                            f"**1. Primary Architectural Framework:**\n" \
                            f"* **Decoupled Middleware:** Integrates direct asynchronous event triggers.\n" \
                            f"* **State Alignment:** Employs high-performance cache consistency layers.\n" \
                            f"* **Security Protocol:** Standardizes strict parameter sanitization at the database edge.\n\n" \
                            f"This configuration achieves superior latency optimization."
        else: # Anthropic / Claude
            response_text = f"### 🌿 Conceptual Synthesis & Deep Exploration (Claude Style Response)\n\n" \
                            f"To look closely at the objective implied by: *\"{prompt_text[:50]}...\"*, " \
                            f"we must first step back and examine the underlying semantic ontology of the prompt query.\n\n" \
                            f"**1. Epistemic Humility:** While many automated tools claim perfect accuracy, " \
                            f"we maintain transparency about the boundaries of token prediction models. Performance " \
                            f"is highly dependent on structural boundaries.\n" \
                            f"**2. Clarified Intent:** Establish explicit role boundaries to optimize outcomes."

        # Token Estimations
        input_tokens = int(len(prompt_text or "") / 4.1) + int(len(system_instruction or "") / 4.1)
        output_tokens = int(len(response_text) / 4.1)
        total_tokens = input_tokens + output_tokens
        
        # Calculate pricing details
        input_cost = (input_tokens / 1000000) * pricing["input_million"]
        output_cost = (output_tokens / 1000000) * pricing["output_million"]
        cost_usd = float(f"{input_cost + output_cost:.6f}")
        
        response = AIResponse(
            execution_id=execution_id,
            provider=pricing["provider"],
            model_name=pricing["name"],
            response_text=response_text,
            response_time_ms=latency_ms,
            token_count=total_tokens,
            cost=cost_usd
        )
        
        # Run Auto-Evaluation heuristics
        analytics = ExecutionService._calculate_auto_metrics(prompt_text, response_text, system_instruction)
        
        return response, analytics

    @staticmethod
    def _calculate_auto_metrics(prompt_text: str, response_text: str, system_instruction: Optional[str]) -> Analytics:
        """Determines metrics score bounds based on text analytics."""
        prompt_len = len(prompt_text)
        has_system = 1 if system_instruction else 0
        
        # Scores formulas
        clarity = min(98, max(50, 70 + (prompt_len // 40) - (20 if "?" not in prompt_text else 0)))
        specificity = min(98, max(45, 60 + (prompt_len // 30) + (15 if "format" in prompt_text.lower() else 0)))
        relevance = min(98, max(65, 80 + (10 if has_system else 0) + random.randint(-5, 5)))
        completeness = min(98, max(40, 55 + (len(response_text) // 50) - (15 if prompt_len < 50 else 0)))
        creativity = min(98, max(30, 75 + random.randint(-15, 15)))
        
        overall = int((clarity + specificity + relevance + completeness + creativity) / 5)
        
        summary = f"Response achieved an excellent {overall}% rating. Displays strong logical adherence " \
                  f"with {'high' if len(response_text) > 200 else 'moderate'} completeness and highly structured formatting."
                  
        return Analytics(
            clarity_score=clarity,
            specificity_score=specificity,
            relevance_score=relevance,
            completeness_score=completeness,
            creativity_score=creativity,
            overall_score=overall,
            feedback_summary=summary
        )
