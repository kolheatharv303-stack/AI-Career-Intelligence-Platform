"""Asynchronous database engine, session management, and resilient fallback handler."""

import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine
)
from backend.core.config import settings
from backend.db.base import Base
# Import all models so metadata is fully populated
import backend.db.rds_models  # noqa: F401

logger = logging.getLogger("career_intel.db")

# Global engine and session factory
_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None
_is_fallback_active: bool = False


def get_database_url() -> str:
    """Determine the database connection URL based on settings and fallback."""
    global _is_fallback_active
    rds_url = settings.AWS_RDS_POSTGRES_URL
    if rds_url and rds_url.strip() and not rds_url.startswith("postgresql+asyncpg://postgres:YourSecure"):
        _is_fallback_active = False
        return rds_url

    _is_fallback_active = True
    logger.warning(
        "[RDS PostgreSQL Notice] AWS_RDS_POSTGRES_URL not configured. "
        "Engaging resilient asynchronous local fallback (sqlite+aiosqlite)."
    )
    return "sqlite+aiosqlite:///./career_intelligence_dev.db"


def get_engine() -> AsyncEngine:
    """Lazily initialize or return the singleton AsyncEngine."""
    global _engine, _session_factory
    if _engine is None:
        db_url = get_database_url()
        is_sqlite = db_url.startswith("sqlite")

        engine_kwargs = {
            "echo": settings.DEBUG and not is_sqlite,
        }

        if not is_sqlite:
            # PostgreSQL connection pool settings for AWS RDS
            engine_kwargs.update({
                "pool_size": settings.POSTGRES_POOL_SIZE,
                "max_overflow": settings.POSTGRES_MAX_OVERFLOW,
                "pool_timeout": settings.POSTGRES_POOL_TIMEOUT,
                "pool_recycle": settings.POSTGRES_POOL_RECYCLE,
                "pool_pre_ping": True,
            })

        _engine = create_async_engine(db_url, **engine_kwargs)
        _session_factory = async_sessionmaker(
            bind=_engine,
            class_=AsyncSession,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )
    return _engine


async def init_db() -> None:
    """Create tables if they don't exist (primarily for fallback and testing)."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Relational database schema verified and initialized.")


async def close_db() -> None:
    """Dispose of the connection pool gracefully on shutdown."""
    global _engine
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        logger.info("Database connection pool closed.")


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for obtaining an isolated AsyncSession per request."""
    if _session_factory is None:
        get_engine()

    assert _session_factory is not None
    async with _session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def is_using_fallback() -> bool:
    """Check if the system is currently running on the fallback SQLite engine."""
    return _is_fallback_active
