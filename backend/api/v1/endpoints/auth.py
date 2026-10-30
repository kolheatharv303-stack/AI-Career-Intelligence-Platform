"""Authentication endpoints: User registration and login with Bearer JWT tokens."""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.config import settings
from backend.core.security import (
    create_access_token,
    get_password_hash,
    verify_password
)
from backend.db.rds_models import User
from backend.models.user import (
    Token,
    UserCreate,
    UserLogin,
    UserResponse
)
from backend.api.deps import get_current_user, get_db_session

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account"
)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db_session)
):
    """Register a new candidate/user, hash password with bcrypt, and store in AWS RDS PostgreSQL."""
    # Check if user already exists
    stmt = select(User).where(User.email == user_in.email.lower())
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists in the system."
        )

    # Hash password with bcrypt
    hashed_pwd = get_password_hash(user_in.password)

    # Create user in RDS
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
    )
    db.add(new_user)
    await db.flush()
    await db.refresh(new_user)

    # Generate Bearer JWT
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=new_user.id,
        claims={"email": new_user.email, "name": new_user.full_name},
        expires_delta=expires_delta
    )

    user_resp = UserResponse.model_validate(new_user)
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=int(expires_delta.total_seconds()),
        user=user_resp,
    )


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate user and obtain Bearer JWT"
)
async def login(
    login_in: UserLogin,
    db: AsyncSession = Depends(get_db_session)
):
    """Authenticate email & password against AWS RDS PostgreSQL and return JWT."""
    stmt = select(User).where(User.email == login_in.email.lower())
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        claims={"email": user.email, "name": user.full_name},
        expires_delta=expires_delta
    )

    user_resp = UserResponse.model_validate(user)
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=int(expires_delta.total_seconds()),
        user=user_resp,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Fetch current authenticated user profile"
)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Get the profile of the currently authenticated user from the Bearer token."""
    return UserResponse.model_validate(current_user)
