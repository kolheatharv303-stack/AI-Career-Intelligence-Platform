"""Pydantic v2 schemas for Gemini AI Matching and Azure Cosmos DB AIInteractions."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, Field


class MatchRequest(BaseModel):
    """Payload for POST /ai/match."""
    resume_id: str = Field(..., description="UUID of existing parsed resume in PostgreSQL RDS")
    job_description_text: str = Field(..., min_length=20, description="Full job description text to match against")
    job_id: Optional[str] = Field(None, description="Optional associated RDS JobDescription ID")
    company_name: Optional[str] = Field(None, description="Optional target company name")
    job_title: Optional[str] = Field(None, description="Optional target job title")


class SuggestedProject(BaseModel):
    title: str = Field(..., description="Project title to bridge missing skills")
    description: str = Field(..., description="Architecture, features, and implementation plan")
    skills_addressed: List[str] = Field(default_factory=list, description="Target missing skills addressed by this project")


class InterviewQuestion(BaseModel):
    question: str = Field(..., description="Targeted technical or behavioral interview question")
    category: str = Field(..., description="Category, e.g. System Design, Behavioral, Algorithm, Domain")
    rationale: str = Field(..., description="Why this question is critical given the resume vs job gap")
    sample_answer_guideline: str = Field(..., description="Guideline for the candidate to ace this question")


class MatchResultSchema(BaseModel):
    """Structured response schema enforced when calling Google Gemini."""
    match_score: int = Field(..., ge=0, le=100, description="ATS match percentage score from 0 to 100")
    matched_skills: List[str] = Field(default_factory=list, description="Skills present in both resume and job requirements")
    missing_skills: List[str] = Field(default_factory=list, description="Skills required by the job but absent from resume")
    strengths: List[str] = Field(default_factory=list, description="Top competitive advantages found in candidate background")
    gaps_summary: str = Field(..., description="Detailed executive assessment of experience or qualification gaps")
    suggested_projects: List[SuggestedProject] = Field(default_factory=list, description="Portfolio projects to fill skill gaps")
    generated_questions: List[InterviewQuestion] = Field(default_factory=list, description="Tailored interview preparation questions")


class TokenUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class AIInteractionDocument(BaseModel):
    """Document schema stored in Azure Cosmos DB 'AIInteractions' container."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    resume_id: str
    job_id: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    match_score: int
    missing_skills: List[str]
    matched_skills: List[str]
    recommendations: List[SuggestedProject]
    generated_questions: List[InterviewQuestion]
    tokens_used: int
    model_version: str = "gemini-2.5-flash"
    raw_analysis: Optional[Dict[str, Any]] = None


class MatchResponse(BaseModel):
    """Full API response for POST /ai/match."""
    interaction_id: str
    user_id: str
    resume_id: str
    analysis: MatchResultSchema
    tokens_used: int
    stored_in_cosmos: bool
    timestamp: str
