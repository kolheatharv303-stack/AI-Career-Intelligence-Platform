"""Service layer for Azure Cosmos DB AIInteractions container."""

import logging
from typing import Any, Dict, List
from backend.db.cosmos_client import cosmos_manager
from backend.models.ai import AIInteractionDocument

logger = logging.getLogger("career_intel.cosmos_service")


class CosmosService:
    """High-level service interface for storing and querying AI interactions in Azure Cosmos DB."""

    def __init__(self):
        self.manager = cosmos_manager

    async def record_interaction(self, doc: AIInteractionDocument) -> Dict[str, Any]:
        """Persist an AI interaction document into the Azure Cosmos DB 'AIInteractions' container."""
        payload = doc.model_dump()
        result = await self.manager.store_interaction(payload)
        logger.info(
            f"Stored interaction {doc.id} for user {doc.user_id} in Cosmos DB "
            f"(Fallback: {self.manager.is_fallback})"
        )
        return result

    async def fetch_user_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve interaction documents for the specified user partition."""
        records = await self.manager.get_user_interactions(user_id=user_id, limit=limit)
        return records


cosmos_service = CosmosService()
