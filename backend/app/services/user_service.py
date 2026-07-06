import uuid
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.models.user import User
from backend.app.schemas.user import UserUpdate, UserCreate

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
        """Resolves user profile by primary UUID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    @staticmethod
    async def get_by_firebase_uid(db: AsyncSession, firebase_uid: str) -> Optional[User]:
        """Resolves user profile by foreign Firebase unique identifier."""
        result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
        return result.scalars().first()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Resolves user profile by email address."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    @staticmethod
    async def create(db: AsyncSession, obj_in: UserCreate) -> User:
        """Provisions a new User profile record."""
        user = User(
            firebase_uid=obj_in.firebase_uid,
            email=obj_in.email,
            full_name=obj_in.full_name,
            avatar_url=obj_in.avatar_url,
            organization=obj_in.organization,
            role=obj_in.role
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info(f"Successfully provisioned User profile id={user.id} email={user.email}")
        return user

    @staticmethod
    async def update(db: AsyncSession, db_user: User, obj_in: UserUpdate) -> User:
        """Modifies and synchronizes attributes of an existing User profile."""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
            
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        logger.info(f"Successfully updated User profile id={db_user.id}")
        return db_user
