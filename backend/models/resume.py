"""Pydantic v2 models for Resume text extraction, entity parsing, and responses."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ExperienceItem(BaseModel):
    company: str
    role: str
    duration: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    institution: str
    degree: str
    year: Optional[str] = None


class SkillsBreakdown(BaseModel):
    technical: List[str] = Field(default_factory=list)
    soft: List[str] = Field(default_factory=list)
    tools_and_frameworks: List[str] = Field(default_factory=list)


class ParsedProfileSchema(BaseModel):
    """Structured candidate profile extracted via Google Gemini."""
    candidate_name: str = Field(..., description="Full name of the candidate")
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    professional_summary: str = Field(..., description="Concise professional executive summary")
    skills: SkillsBreakdown = Field(default_factory=SkillsBreakdown)
    experience: List[ExperienceItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)


class ResumeUploadResponse(BaseModel):
    """API response after uploading and parsing a candidate resume."""
    id: str
    user_id: str
    filename: Optional[str] = None
    raw_text_length: int
    parsed_profile: ParsedProfileSchema
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    raw_text: str
    parsed_profile_json: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
