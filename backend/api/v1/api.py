"""V1 API Router assembly."""

from fastapi import APIRouter
from backend.api.v1.endpoints import (
    auth,
    resumes,
    ai,
    applications
)
from backend.services.firebase_service import firebase_service
from backend.db.session import is_using_fallback as is_rds_fallback
from backend.db.cosmos_client import cosmos_manager
from backend.services.gemini_service import gemini_service

api_router = APIRouter()

# Core Domain Routers
api_router.include_router(auth.router)
api_router.include_router(resumes.router)
api_router.include_router(ai.router)
api_router.include_router(applications.router)


@api_router.get("/cloud/status", tags=["Cloud Infrastructure"])
async def get_cloud_infrastructure_status():
    """Returns the operational status of all multi-cloud integrations."""
    return {
        "aws_rds_postgresql": {
            "service": "AWS RDS PostgreSQL (SQLAlchemy 2.0 + asyncpg)",
            "status": "connected" if not is_rds_fallback() else "fallback_active (SQLite async)",
            "is_fallback": is_rds_fallback(),
        },
        "azure_cosmos_db": {
            "service": "Azure Cosmos DB (SQL/Core API)",
            "container": "AIInteractions",
            "status": "connected" if not cosmos_manager.is_fallback else "fallback_active (Local Store)",
            "is_fallback": cosmos_manager.is_fallback,
        },
        "google_firebase": {
            "service": "Google Firebase Admin SDK (Firestore & Realtime Database)",
            "status": "connected" if not firebase_service.is_fallback else "fallback_active (Simulated Bus)",
            "is_fallback": firebase_service.is_fallback,
            "recent_broadcast_count": len(firebase_service.get_recent_events()),
        },
        "google_gemini": {
            "service": "Google Gemini API (google-genai SDK)",
            "model": gemini_service._model,
            "status": "connected" if gemini_service.is_available else "fallback_active (Heuristic Matcher)",
            "is_fallback": not gemini_service.is_available,
        }
    }


@api_router.get("/firebase/events", tags=["Cloud Infrastructure"])
async def get_recent_firebase_events(limit: int = 20):
    """View the live broadcast queue from Firebase Admin SDK."""
    return firebase_service.get_recent_events(limit=limit)
