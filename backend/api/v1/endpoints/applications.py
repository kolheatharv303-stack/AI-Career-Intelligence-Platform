"""Application tracking endpoints: Stage lifecycle updates and Firebase Real-Time Event Dispatch."""

from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.deps import (
    get_current_user,
    get_db_session,
    get_firebase
)
from backend.db.rds_models import Application, ApplicationStatus, JobDescription, User
from backend.models.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate
)
from backend.models.job import JobDescriptionCreate, JobDescriptionResponse
from backend.services.firebase_service import FirebaseService

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new job application tracking record"
)
async def create_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Link candidate to a job description with initial 'Applied' status."""
    # Verify job description exists
    stmt = select(JobDescription).where(JobDescription.id == app_in.job_id)
    job = (await db.execute(stmt)).scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"JobDescription '{app_in.job_id}' does not exist."
        )

    new_app = Application(
        user_id=current_user.id,
        job_id=app_in.job_id,
        status=ApplicationStatus(app_in.status.value),
    )
    db.add(new_app)
    await db.flush()
    await db.refresh(new_app)

    return ApplicationResponse.model_validate(new_app)


@router.get(
    "",
    response_model=List[ApplicationResponse],
    summary="List all applications for the authenticated user"
)
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Retrieve all candidate job applications and stages from AWS RDS."""
    stmt = (
        select(Application)
        .where(Application.user_id == current_user.id)
        .order_by(Application.updated_at.desc())
    )
    result = await db.execute(stmt)
    apps = result.scalars().all()
    return [ApplicationResponse.model_validate(a) for a in apps]


@router.patch(
    "/{application_id}/status",
    response_model=ApplicationResponse,
    summary="Update application stage in RDS and broadcast real-time event to Google Firebase"
)
async def update_application_status(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    firebase: FirebaseService = Depends(get_firebase)
):
    """
    1. Validates and loads application from AWS RDS PostgreSQL.
    2. Updates status (Enum['Applied', 'Interview', 'Offer', 'Rejected']) and updated_at.
    3. Triggers Google Firebase Admin real-time event broadcast to Firestore / Realtime Database.
    4. Commits RDS transaction and returns updated record.
    """
    stmt = (
        select(Application)
        .where(
            Application.id == application_id,
            Application.user_id == current_user.id
        )
    )
    application = (await db.execute(stmt)).scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' not found for current user."
        )

    old_status = application.status.value
    target_status = status_update.status.value

    # Update RDS record
    application.status = ApplicationStatus(target_status)
    application.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(application)

    # Fetch job context for event payload
    company_name = application.job_description.company_name if application.job_description else "Company"
    job_title = application.job_description.title if application.job_description else "Position"

    # Trigger Google Firebase real-time broadcast
    await firebase.broadcast_status_change(
        application_id=application.id,
        user_id=current_user.id,
        job_id=application.job_id,
        old_status=old_status,
        new_status=target_status,
        company_name=company_name,
        job_title=job_title,
        note=status_update.note,
    )

    return ApplicationResponse.model_validate(application)


# Additional helper route for creating Job Descriptions
@router.post(
    "/jobs",
    response_model=JobDescriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a new Job Description into AWS RDS"
)
async def create_job_description(
    job_in: JobDescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Store target Job Description in AWS RDS PostgreSQL."""
    job = JobDescription(
        user_id=current_user.id,
        company_name=job_in.company_name,
        title=job_in.title,
        raw_text=job_in.raw_text,
    )
    db.add(job)
    await db.flush()
    await db.refresh(job)
    return JobDescriptionResponse.model_validate(job)
