"""FastAPI dependency injection providers."""

import logging
from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.config import settings
from backend.core.security import decode_access_token
from backend.db.session import get_db_session
from backend.db.rds_models import User
from backend.services.gemini_service import GeminiService, gemini_service
from backend.services.firebase_service import FirebaseService, firebase_service
from backend.services.cosmos_service import CosmosService, cosmos_service

logger = logging.getLogger("career_intel.deps")

# OAuth2 scheme for Bearer token extraction
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login",
    auto_error=False,
)


async def get_current_user(
    db: AsyncSession = Depends(get_db_session),
    token: str | None = Depends(oauth2_scheme)
) -> User:
    """Validate Bearer JWT access token and load corresponding User from RDS."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        # Check if there is an authorization header with Bearer token
        raise credentials_exception

    try:
        payload = decode_access_token(token)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except Exception as e:
        logger.warning(f"JWT validation failed: {e}")
        raise credentials_exception

    # Query user from PostgreSQL RDS
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user


async def get_current_user_optional(
    db: AsyncSession = Depends(get_db_session),
    token: str | None = Depends(oauth2_scheme)
) -> User | None:
    """Optional user authentication helper for public/exploratory endpoints."""
    if not token:
        return None
    try:
        return await get_current_user(db, token)
    except HTTPException:
        return None


def get_gemini() -> GeminiService:
    return gemini_service


def get_firebase() -> FirebaseService:
    return firebase_service


def get_cosmos() -> CosmosService:
    return cosmos_service
