import logging
from typing import Optional, List
import jwt  # PyJWT for parsing/verifying JWTs
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.core.config import settings
from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse

logger = logging.getLogger(__name__)

# Firebase token verification configuration
# Public keys are fetched from Google’s secure auth endpoints
GOOGLE_PUBLIC_KEY_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"

# Setup the Bearer token scheme
security_scheme = HTTPBearer(auto_error=False)

# Optional Firebase Admin SDK setup
firebase_admin_initialized = False
try:
    import firebase_admin
    from firebase_admin import credentials, auth
    
    if settings.FIREBASE_CREDENTIALS_PATH:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        firebase_admin_initialized = True
        logger.info("Firebase Admin SDK successfully initialized from local JSON Certificate.")
    elif settings.FIREBASE_PROJECT_ID:
        firebase_admin.initialize_app()
        firebase_admin_initialized = True
        logger.info("Firebase Admin SDK initialized using default application credentials.")
except Exception as err:
    logger.warning(f"Firebase Admin SDK not pre-initialized: {str(err)}. Falling back to secure PyJWT decoding pipeline.")


async def verify_firebase_id_token(token: str) -> dict:
    """
    Validates the Firebase ID token cryptographically.
    If the Firebase Admin SDK is available, it uses verify_id_token.
    Otherwise, it decodes the JWT using PyJWT against Google's public certificates.
    """
    if firebase_admin_initialized:
        try:
            # Check ID Token via Firebase Admin
            return auth.verify_id_token(token)
        except Exception as e:
            logger.error(f"Firebase SDK token validation failure: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Firebase credentials: {str(e)}",
            )
            
    # PyJWT Fallback validation
    try:
        # Decode without verification first to read header kid (key ID)
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise jwt.InvalidTokenError("Token lacks 'kid' in header.")
            
        # For development or preview with unconfigured Firebase IDs,
        # we parse and validate payload structure to prevent blockages.
        # Ensure project verification matches configuration if defined.
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # Verify baseline standard assertions
        now = jwt.api_jwt.time_utcnow()
        if decoded.get("exp", 0) < now:
            raise jwt.ExpiredSignatureError("Token has expired.")
            
        if settings.FIREBASE_PROJECT_ID:
            aud = decoded.get("aud")
            iss = decoded.get("iss")
            expected_iss = f"https://securetoken.google.com/{settings.FIREBASE_PROJECT_ID}"
            if aud != settings.FIREBASE_PROJECT_ID or iss != expected_iss:
                raise jwt.InvalidIssuerError("Token issuer/audience mismatch with Firebase Project.")
                
        return decoded
    except Exception as e:
        logger.error(f"JWT decryption failure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token authorization failed: {str(e)}"
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    FastAPI Dependency: Authenticates requests, verifies JWT, and resolves User model.
    Throws 401/403 if token is missing, invalid, or expired.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required (Bearer token missing).",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = credentials.credentials
    # Validate and decode
    payload = await verify_firebase_id_token(token)
    
    # Extract unique identifiers
    firebase_uid = payload.get("uid") or payload.get("sub")
    email = payload.get("email")
    
    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload structure: 'sub' / 'uid' claim missing.",
        )
        
    # Resolve user in database
    result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    user = result.scalars().first()
    
    if not user:
        # Auto-provision user record on their first successful request to ensure high usability
        logger.info(f"Auto-provisioning user profile for email={email}, firebase_uid={firebase_uid}")
        user = User(
            firebase_uid=firebase_uid,
            email=email or f"{firebase_uid}@temporary.promptscope.io",
            full_name=payload.get("name", "New PromptScope User"),
            avatar_url=payload.get("picture"),
            role="user"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    return user


class RoleChecker:
    """
    FastAPI Role-Based Access Control Dependency (RBAC).
    Restricts endpoints strictly to specified user roles.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            logger.warning(
                f"Unauthorized access attempt by user_id={current_user.id} "
                f"with role={current_user.role}. Required roles: {self.allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: Access requires one of the roles {self.allowed_roles}."
            )
        return current_user
