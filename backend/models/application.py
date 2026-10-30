"""Pydantic v2 models for Application stage tracking."""

import enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from backend.models.job import JobDescriptionResponse


class ApplicationStatusEnum(str, enum.Enum):
    APPLIED = "Applied"
    INTERVIEW = "Interview"
    OFFER = "Offer"
    REJECTED = "Rejected"


class ApplicationCreate(BaseModel):
    job_id: str
    status: ApplicationStatusEnum = ApplicationStatusEnum.APPLIED


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatusEnum = Field(..., description="Target application stage")
    note: Optional[str] = Field(None, description="Optional transition note or interviewer feedback")


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    status: ApplicationStatusEnum
    updated_at: datetime
    job_description: Optional[JobDescriptionResponse] = None

    model_config = ConfigDict(from_attributes=True)
