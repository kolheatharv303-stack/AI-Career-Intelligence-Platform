"""Production-grade FastAPI Backend for AI Career Intelligence Platform.

Architected with:
- AWS RDS PostgreSQL: SQLAlchemy 2.0 (asyncio) + asyncpg
- Azure Cosmos DB: Distributed NoSQL SQL/Core API (AIInteractions container)
- Google Firebase Admin SDK: Real-time application stage broadcast
- Google Gemini API: Structured JSON output ATS matching and resume parsing
- JWT Authentication: PyJWT + Passlib bcrypt
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import settings
from backend.core.exceptions import DomainException
from backend.db.session import init_db, close_db
from backend.db.cosmos_client import cosmos_manager
from backend.services.firebase_service import firebase_service
from backend.api.v1.api import api_router
from backend.api.v1.endpoints import (
    auth,
    resumes,
    ai,
    applications
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s"
)
logger = logging.getLogger("career_intel.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager for clean startup initialization and graceful shutdown."""
    logger.info("Initializing AI Career Intelligence Platform Cloud Services...")

    # 1. Initialize AWS RDS PostgreSQL relational engine
    try:
        await init_db()
        logger.info("RDS PostgreSQL engine ready.")
    except Exception as e:
        logger.error(f"Failed to initialize database engine: {e}")

    # 2. Initialize Azure Cosmos DB client & container
    try:
        await cosmos_manager.initialize()
    except Exception as e:
        logger.error(f"Failed to initialize Azure Cosmos DB: {e}")

    # 3. Initialize Google Firebase Admin SDK
    try:
        await firebase_service.initialize()
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")

    logger.info(f"{settings.PROJECT_NAME} v{settings.VERSION} online and accepting traffic.")

    yield

    # Shutdown sequence
    logger.info("Commencing graceful shutdown sequence...")
    await close_db()
    await cosmos_manager.close()
    logger.info("All database connection pools and cloud clients closed.")


# Instantiate FastAPI Application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-grade Multi-Cloud AI Career Intelligence Platform backend. "
        "Separates transactional relational workflows (AWS RDS PostgreSQL), "
        "unstructured LLM audit records (Azure Cosmos DB), "
        "real-time event broadcasting (Google Firebase Admin SDK), "
        "and generative career intelligence (Google Gemini API)."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure Cross-Origin Resource Sharing (CORS) Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Domain Exception Handlers
@app.exception_handler(DomainException)
async def domain_exception_handler(request: Request, exc: DomainException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message, "error_type": exc.__class__.__name__},
    )


# Mount versioned API router (/api/v1/...)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Direct root route aliases for exact prompt compliance:
# /auth/*, /resumes/*, /ai/*, /applications/*
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(ai.router)
app.include_router(applications.router)


@app.get("/health", tags=["Health & Diagnostics"])
async def health_check():
    """System health check and uptime diagnostic."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["Health & Diagnostics"])
async def root():
    """Root platform entry point."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "documentation": "/docs",
        "openapi_schema": "/openapi.json",
        "api_v1": settings.API_V1_PREFIX,
        "cloud_services": {
            "relational_db": "AWS RDS PostgreSQL (SQLAlchemy 2.0)",
            "document_nosql": "Azure Cosmos DB (AIInteractions)",
            "realtime_events": "Google Firebase Admin SDK",
            "generative_ai": f"Google Gemini ({settings.GEMINI_MODEL})",
            "auth": "PyJWT + Passlib bcrypt",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
