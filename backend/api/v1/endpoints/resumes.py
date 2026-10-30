"""Resume management endpoints: upload, text extraction, Gemini entity parsing, and RDS persistence."""

from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.deps import get_current_user, get_db_session, get_gemini
from backend.db.rds_models import Resume, User
from backend.models.resume import (
    ParsedProfileSchema,
    ResumeResponse,
    ResumeUploadResponse
)
from backend.services.gemini_service import GeminiService
from backend.services.text_extractor import extract_text_from_upload

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post(
    "/upload",
    response_model=ResumeUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload resume (PDF/TXT), extract text, parse entities with Gemini, and save to AWS RDS"
)
async def upload_resume(
    file: UploadFile = File(..., description="PDF or TXT resume file"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    gemini: GeminiService = Depends(get_gemini)
):
    """
    1. Extracts raw text from uploaded PDF/TXT stream.
    2. Sends text to Google Gemini API using structured JSON schema.
    3. Saves raw_text and parsed_profile_json into AWS RDS PostgreSQL.
    4. Returns structured resume entity.
    """
    # 1. Text extraction
    raw_text = await extract_text_from_upload(file)

    if len(raw_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Resume text is too brief to analyze. Please provide a complete resume."
        )

    # 2. Invoke Google Gemini for structured parsing
    parsed_profile, tokens_used = await gemini.parse_resume(raw_text)

    # 3. Save into AWS RDS PostgreSQL
    resume_record = Resume(
        user_id=current_user.id,
        raw_text=raw_text,
        parsed_profile_json=parsed_profile.model_dump(),
    )
    db.add(resume_record)
    await db.flush()
    await db.refresh(resume_record)

    return ResumeUploadResponse(
        id=resume_record.id,
        user_id=resume_record.user_id,
        filename=file.filename,
        raw_text_length=len(raw_text),
        parsed_profile=parsed_profile,
        created_at=resume_record.created_at,
    )


@router.get(
    "",
    response_model=List[ResumeResponse],
    summary="List all resumes for the authenticated user"
)
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Fetch candidate's stored resumes from AWS RDS."""
    stmt = (
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
    )
    result = await db.execute(stmt)
    resumes = result.scalars().all()
    return [ResumeResponse.model_validate(r) for r in resumes]


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
    summary="Get single resume details by ID"
)
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Fetch a specific resume by ID ensuring ownership."""
    stmt = (
        select(Resume)
        .where(Resume.id == resume_id, Resume.user_id == current_user.id)
    )
    resume = (await db.execute(stmt)).scalar_one_or_none()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume '{resume_id}' not found."
        )
    return ResumeResponse.model_validate(resume)
