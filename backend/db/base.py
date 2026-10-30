"""SQLAlchemy 2.0 Declarative Base and common model mixins."""

from datetime import datetime, timezone
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy 2.0 models."""
    pass


class TimestampMixin:
    """Provides created_at and updated_at datetime timestamps."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
