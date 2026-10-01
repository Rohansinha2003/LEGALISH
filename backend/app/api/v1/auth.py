"""Auth API — Supabase JWT verification + user management."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models import User
from pydantic import BaseModel

router = APIRouter()
settings = get_settings()
logger = get_logger(__name__)
security = HTTPBearer(auto_error=False)


class TokenPayload(BaseModel):
    sub: str
    email: str | None = None


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> str:
    """
    Verify Supabase JWT and return the user ID.
    In development mode without Supabase configured, accepts a test header.
    """
    if settings.is_development and not settings.SUPABASE_URL:
        # Dev mode: accept x-dev-user-id header or use a fixed dev user
        return await _get_or_create_dev_user(db)

    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required.")

    token = credentials.credentials
    payload = _verify_supabase_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    # Ensure user exists in our DB (sync with Supabase auth)
    await _ensure_user_exists(db, user_id, email)
    return user_id


def _verify_supabase_jwt(token: str) -> dict | None:
    """Verify Supabase JWT using the JWT secret."""
    try:
        from jose import jwt, JWTError
        payload = jwt.decode(
            token,
            settings.SUPABASE_ANON_KEY,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except Exception as e:
        logger.warning("jwt_verification_failed", error=str(e))
        return None


async def _ensure_user_exists(db: AsyncSession, user_id: str, email: str | None):
    """Create user record if it doesn't exist (first login)."""
    try:
        result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        if not user:
            user = User(id=uuid.UUID(user_id), email=email or f"{user_id}@unknown.com")
            db.add(user)
            await db.commit()
    except Exception as e:
        logger.error("user_creation_failed", error=str(e))


async def _get_or_create_dev_user(db: AsyncSession) -> str:
    """Create/return a fixed development user."""
    dev_user_id = "00000000-0000-0000-0000-000000000001"
    try:
        result = await db.execute(select(User).where(User.id == uuid.UUID(dev_user_id)))
        user = result.scalar_one_or_none()
        if not user:
            user = User(id=uuid.UUID(dev_user_id), email="dev@legalsaathi.dev", full_name="Dev User")
            db.add(user)
            await db.commit()
    except Exception:
        pass
    return dev_user_id


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"id": str(user.id), "email": user.email, "full_name": user.full_name}
