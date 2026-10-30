"""Pydantic v2 models for Job Descriptions."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class JobDescriptionCreate(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=150)
    title: str = Field(..., min_length=1, max_length=150)
    raw_text: str = Field(..., min_length=20, description="Full job description text")


class JobDescriptionResponse(BaseModel):
    id: str
    user_id: str
    company_name: str
    title: str
    raw_text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
