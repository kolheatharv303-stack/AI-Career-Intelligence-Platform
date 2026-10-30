"""Google Firebase Admin SDK integration for real-time event broadcasting.

Handles:
1. Real-time application stage updates (Applied -> Interview -> Offer -> Rejected).
2. Firestore and/or Realtime Database push notifications.
3. In-memory resilient event dispatching fallback for local development.
"""

import asyncio
import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from backend.core.config import settings

logger = logging.getLogger("career_intel.firebase")


class FirebaseService:
    """Manages Firebase Admin SDK connection and real-time event broadcasting."""

    def __init__(self):
        self._app = None
        self._firestore_db = None
        self._rtdb = None
        self._is_fallback: bool = True
        # In-memory recent events broadcast log for development inspection & websockets
        self._recent_events: List[Dict[str, Any]] = []

    async def initialize(self) -> None:
        """Initialize Firebase Admin SDK with credentials or activate fallback mode."""
        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if cred_path and os.path.exists(cred_path):
            try:
                import firebase_admin
                from firebase_admin import credentials, firestore, db

                if not firebase_admin._apps:
                    cred = credentials.Certificate(cred_path)
                    options = {}
                    if settings.FIREBASE_DATABASE_URL:
                        options["databaseURL"] = settings.FIREBASE_DATABASE_URL
                    self._app = firebase_admin.initialize_app(cred, options)
                else:
                    self._app = firebase_admin.get_app()

                self._firestore_db = firestore.client()
                if settings.FIREBASE_DATABASE_URL:
                    self._rtdb = db
                self._is_fallback = False
                logger.info("Successfully initialized Firebase Admin SDK (Firestore & Realtime Database).")
                return
            except Exception as e:
                logger.warning(f"Firebase Admin SDK initialization failed: {e}. Switching to simulated fallback.")

        self._is_fallback = True
        logger.info("[Firebase Notice] Firebase running in simulated local real-time event mode.")

    @property
    def is_fallback(self) -> bool:
        return self._is_fallback

    async def broadcast_status_change(
        self,
        application_id: str,
        user_id: str,
        job_id: str,
        old_status: str,
        new_status: str,
        company_name: Optional[str] = None,
        job_title: Optional[str] = None,
        note: Optional[str] = None
    ) -> Dict[str, Any]:
        """Broadcast an application stage update event to Firebase and record in history."""
        timestamp = datetime.now(timezone.utc).isoformat()
        event_payload = {
            "event_type": "APPLICATION_STAGE_CHANGED",
            "application_id": str(application_id),
            "user_id": str(user_id),
            "job_id": str(job_id),
            "company_name": company_name or "Target Company",
            "job_title": job_title or "Role",
            "old_status": old_status,
            "new_status": new_status,
            "note": note,
            "timestamp": timestamp,
            "delivered_via": "firebase_admin_sdk" if not self._is_fallback else "simulated_local_bus"
        }

        # 1. Real Firebase Admin Push
        if not self._is_fallback:
            try:
                # Push to Firestore collection 'application_events'
                if self._firestore_db:
                    # Run in executor to keep async loop non-blocking
                    loop = asyncio.get_event_loop()
                    doc_ref = self._firestore_db.collection("application_events").document()
                    await loop.run_in_executor(None, doc_ref.set, event_payload)

                # Push to Realtime Database /users/{user_id}/notifications
                if self._rtdb:
                    loop = asyncio.get_event_loop()
                    ref = self._rtdb.reference(f"users/{user_id}/status_events")
                    await loop.run_in_executor(None, ref.push, event_payload)

                logger.info(f"Broadcasted status change for application {application_id} to Firebase.")
            except Exception as e:
                logger.error(f"Error broadcasting to Firebase: {e}")

        # 2. Append to recent events cache (FIFO 100 max)
        self._recent_events.insert(0, event_payload)
        if len(self._recent_events) > 100:
            self._recent_events.pop()

        return event_payload

    def get_recent_events(self, user_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve recent broadcast events for auditing or developer UI."""
        if user_id:
            return [e for e in self._recent_events if e.get("user_id") == user_id][:limit]
        return self._recent_events[:limit]


# Singleton instance
firebase_service = FirebaseService()
