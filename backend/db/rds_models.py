"""SQLAlchemy 2.0 ORM models for AWS RDS PostgreSQL relational database."""

import enum
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String,
    Text,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    JSON,
    Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.db.base import Base


class ApplicationStatus(str, enum.Enum):
    """Application pipeline lifecycle stages."""
    APPLIED = "Applied"
    INTERVIEW = "Interview"
    OFFER = "Offer"
    REJECTED = "Rejected"


class User(Base):
    """User account model for candidates and recruiters."""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    resumes: Mapped[List["Resume"]] = relationship(
        "Resume",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    job_descriptions: Mapped[List["JobDescription"]] = relationship(
        "JobDescription",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    applications: Mapped[List["Application"]] = relationship(
        "Application",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Resume(Base):
    """Stores candidate resumes with raw extracted text and Gemini-parsed profile entities."""
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    raw_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    parsed_profile_json: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="resumes")


class JobDescription(Base):
    """Stores target job descriptions submitted for evaluation."""
    __tablename__ = "job_descriptions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    company_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )
    raw_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="job_descriptions")
    applications: Mapped[List["Application"]] = relationship(
        "Application",
        back_populates="job_description",
        cascade="all, delete-orphan",
    )


class Application(Base):
    """Tracks candidate job application stages (Applied -> Interview -> Offer -> Rejected)."""
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("job_descriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        SQLEnum(ApplicationStatus, name="application_status_enum", native_enum=False),
        default=ApplicationStatus.APPLIED,
        nullable=False,
        index=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="applications")
    job_description: Mapped["JobDescription"] = relationship(
        "JobDescription",
        back_populates="applications",
        lazy="selectin",
    )

    __table_args__ = (
        Index("idx_user_status", "user_id", "status"),
    )
