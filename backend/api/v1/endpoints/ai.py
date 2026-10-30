"""AI Intelligence endpoints: Gemini ATS Matching and Azure Cosmos DB Interaction History."""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.deps import (
    get_cosmos,
    get_current_user,
    get_db_session,
    get_gemini
)
from backend.db.rds_models import Resume, User
from backend.models.ai import (
    AIInteractionDocument,
    MatchRequest,
    MatchResponse,
    MatchResultSchema
)
from backend.services.cosmos_service import CosmosService
from backend.services.gemini_service import GeminiService

router = APIRouter(prefix="/ai", tags=["AI Career Intelligence"])


@router.post(
    "/match",
    response_model=MatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Match Resume against Job Description using Gemini and store audit run in Azure Cosmos DB"
)
async def match_resume_with_job(
    request: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    gemini: GeminiService = Depends(get_gemini),
    cosmos: CosmosService = Depends(get_cosmos)
):
    """
    1. Fetches candidate's parsed resume from AWS RDS PostgreSQL.
    2. Calls Google Gemini API using structured JSON schema.
    3. Computes match_score, missing_skills, strengths, suggested_projects, interview questions.
    4. Persists the complete run document into Azure Cosmos DB ('AIInteractions' container).
    5. Returns unified match analysis and token metrics.
    """
    # 1. Fetch resume from RDS
    stmt = (
        select(Resume)
        .where(Resume.id == request.resume_id, Resume.user_id == current_user.id)
    )
    resume = (await db.execute(stmt)).scalar_one_or_none()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID '{request.resume_id}' not found for current user."
        )

    # 2. Invoke Google Gemini with structured JSON output schema
    match_result, tokens_used = await gemini.calculate_match(
        resume_text=resume.raw_text,
        parsed_profile=resume.parsed_profile_json,
        job_description=request.job_description_text
    )

    # 3. Construct Azure Cosmos DB document for 'AIInteractions' container
    interaction_doc = AIInteractionDocument(
        user_id=current_user.id,
        resume_id=resume.id,
        job_id=request.job_id,
        match_score=match_result.match_score,
        missing_skills=match_result.missing_skills,
        matched_skills=match_result.matched_skills,
        recommendations=match_result.suggested_projects,
        generated_questions=match_result.generated_questions,
        tokens_used=tokens_used,
        model_version=gemini._model,
        raw_analysis=match_result.model_dump(),
    )

    # 4. Store in Azure Cosmos DB
    stored_result = await cosmos.record_interaction(interaction_doc)
    stored_success = bool(stored_result)

    return MatchResponse(
        interaction_id=interaction_doc.id,
        user_id=current_user.id,
        resume_id=resume.id,
        analysis=match_result,
        tokens_used=tokens_used,
        stored_in_cosmos=stored_success,
        timestamp=interaction_doc.timestamp,
    )


@router.get(
    "/history",
    response_model=List[Dict[str, Any]],
    summary="Fetch past AI analysis runs from Azure Cosmos DB for the current user"
)
async def get_ai_history(
    limit: int = Query(default=20, ge=1, le=100, description="Max interaction records to fetch"),
    current_user: User = Depends(get_current_user),
    cosmos: CosmosService = Depends(get_cosmos)
):
    """
    Queries the Azure Cosmos DB 'AIInteractions' container partitioned by user_id
    to retrieve audit logs, past match scores, and interview prep history.
    """
    history = await cosmos.fetch_user_history(user_id=current_user.id, limit=limit)
    return history
