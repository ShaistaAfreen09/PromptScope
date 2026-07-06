import uuid
import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.app.models.prompt import Prompt, PromptVersion
from backend.app.schemas.prompt import PromptCreate, PromptUpdate

logger = logging.getLogger(__name__)

class PromptService:
    @staticmethod
    async def get_by_id(db: AsyncSession, prompt_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Prompt]:
        """Resolves single prompt by UUID owned by user with loaded versions."""
        query = (
            select(Prompt)
            .where(Prompt.id == prompt_id, Prompt.user_id == user_id)
            .options(selectinload(Prompt.versions))
        )
        result = await db.execute(query)
        return result.scalars().first()

    @staticmethod
    async def get_multi_by_user(
        db: AsyncSession, 
        user_id: uuid.UUID, 
        category: Optional[str] = None, 
        status: Optional[str] = "active"
    ) -> List[Prompt]:
        """Queries list of prompts owned by user with filter capabilities."""
        filters = [Prompt.user_id == user_id]
        if category:
            filters.append(Prompt.category == category)
        if status:
            filters.append(Prompt.status == status)
            
        query = (
            select(Prompt)
            .where(*filters)
            .options(selectinload(Prompt.versions))
            .order_by(Prompt.updated_at.desc())
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def create(db: AsyncSession, user_id: uuid.UUID, obj_in: PromptCreate) -> Prompt:
        """
        Creates a new prompt entity and automatically initializes Version #1 
        inside the PromptVersion history table.
        """
        prompt = Prompt(
            user_id=user_id,
            title=obj_in.title,
            content=obj_in.content,
            category=obj_in.category,
            status=obj_in.status
        )
        db.add(prompt)
        await db.flush()  # Extract the newly minted prompt.id UUID
        
        # Build first version history card
        first_version = PromptVersion(
            prompt_id=prompt.id,
            version_number=1,
            content=obj_in.content,
            system_instruction=obj_in.system_instruction,
            change_summary="Initial system prompt draft setup."
        )
        db.add(first_version)
        await db.commit()
        
        # Load relationships
        query = select(Prompt).where(Prompt.id == prompt.id).options(selectinload(Prompt.versions))
        result = await db.execute(query)
        return result.scalars().first()

    @staticmethod
    async def update(db: AsyncSession, db_prompt: Prompt, obj_in: PromptUpdate) -> Prompt:
        """
        Updates prompt metadata (title, category, status). If prompt core content 
        or system instructions change, it increments the version counter and appends 
        a new row in the PromptVersion tracking table.
        """
        update_data = obj_in.model_dump(exclude_unset=True)
        content_changed = "content" in update_data and update_data["content"] != db_prompt.content
        sys_changed = "system_instruction" in update_data
        
        # Update model properties
        for field, value in update_data.items():
            if field in ["title", "category", "status", "content"]:
                setattr(db_prompt, field, value)
                
        db_prompt.updated_at = db_prompt.registry = uuid.uuid4() # Force timestamp update
        
        if content_changed or sys_changed:
            # Query maximum version number
            query_versions = select(PromptVersion).where(PromptVersion.prompt_id == db_prompt.id)
            v_result = await db.execute(query_versions)
            versions_list = v_result.scalars().all()
            next_version_num = max([v.version_number for v in versions_list], default=0) + 1
            
            # Insert historical delta snapshot
            new_version = PromptVersion(
                prompt_id=db_prompt.id,
                version_number=next_version_num,
                content=db_prompt.content,
                system_instruction=obj_in.system_instruction,
                change_summary=obj_in.change_summary or f"Updated prompt configuration and inputs to Version {next_version_num}."
            )
            db.add(new_version)
            
        db.add(db_prompt)
        await db.commit()
        
        # Re-resolve prompt
        query_reload = select(Prompt).where(Prompt.id == db_prompt.id).options(selectinload(Prompt.versions))
        res_reload = await db.execute(query_reload)
        return res_reload.scalars().first()

    @staticmethod
    async def delete(db: AsyncSession, db_prompt: Prompt) -> bool:
        """Deletes a prompt and cascade sweeps all related versions/executions."""
        await db.delete(db_prompt)
        await db.commit()
        logger.info(f"Successfully deleted prompt id={db_prompt.id}")
        return True
