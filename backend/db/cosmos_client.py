"""Azure Cosmos DB (SQL/Core API) client and asynchronous operations handler.

Manages the 'AIInteractions' container for unstructured LLM logs, audit history,
match analysis results, and tokens used.
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from backend.core.config import settings

logger = logging.getLogger("career_intel.cosmos")


class CosmosDBManager:
    """Manages Azure Cosmos DB client connection, container lifecycle, and queries."""

    def __init__(self):
        self._client = None
        self._database = None
        self._container = None
        self._is_fallback: bool = True
        # In-memory resilient store for local development without Azure credentials
        self._fallback_store: Dict[str, List[Dict[str, Any]]] = {}

    async def initialize(self) -> None:
        """Initialize Cosmos DB client or activate fallback if unconfigured."""
        if (
            settings.AZURE_COSMOS_ENDPOINT
            and settings.AZURE_COSMOS_KEY
            and not settings.AZURE_COSMOS_KEY.startswith("your-primary-cosmos-db")
        ):
            try:
                # Lazy import azure-cosmos if available
                from azure.cosmos.aio import CosmosClient
                from azure.cosmos.partition_key import PartitionKey

                self._client = CosmosClient(
                    url=settings.AZURE_COSMOS_ENDPOINT,
                    credential=settings.AZURE_COSMOS_KEY
                )
                self._database = await self._client.create_database_if_not_exists(
                    id=settings.AZURE_COSMOS_DATABASE_NAME
                )
                self._container = await self._database.create_container_if_not_exists(
                    id=settings.AZURE_COSMOS_CONTAINER_NAME,
                    partition_key=PartitionKey(path=settings.AZURE_COSMOS_PARTITION_KEY),
                    offer_throughput=400,
                )
                self._is_fallback = False
                logger.info(
                    f"Connected to Azure Cosmos DB: {settings.AZURE_COSMOS_DATABASE_NAME}/"
                    f"{settings.AZURE_COSMOS_CONTAINER_NAME}"
                )
                return
            except Exception as e:
                logger.warning(
                    f"[Cosmos DB Notice] Azure Cosmos connection failed ({e}). "
                    f"Switching to asynchronous local memory store."
                )

        self._is_fallback = True
        logger.info("[Cosmos DB Notice] Azure Cosmos DB running in local simulated fallback mode.")

    @property
    def is_fallback(self) -> bool:
        return self._is_fallback

    async def store_interaction(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Store an AI interaction document into the AIInteractions container."""
        # Ensure timestamp is set
        if "timestamp" not in item:
            item["timestamp"] = datetime.now(timezone.utc).isoformat()

        user_id = str(item.get("user_id", "default_user"))

        if not self._is_fallback and self._container:
            try:
                created_item = await self._container.create_item(body=item)
                return created_item
            except Exception as e:
                logger.error(f"Failed to write to Azure Cosmos DB: {e}. Falling back to local store.")

        # Fallback in-memory storage partitioned by user_id
        if user_id not in self._fallback_store:
            self._fallback_store[user_id] = []
        # Prepend so newest is first
        self._fallback_store[user_id].insert(0, item)
        return item

    async def get_user_interactions(
        self,
        user_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Query interactions by partition key /user_id ordered by timestamp descending."""
        if not self._is_fallback and self._container:
            try:
                query = (
                    "SELECT * FROM c WHERE c.user_id = @user_id "
                    "ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit"
                )
                parameters = [
                    {"name": "@user_id", "value": user_id},
                    {"name": "@limit", "value": limit},
                ]
                items = []
                async for item in self._container.query_items(
                    query=query,
                    parameters=parameters,
                    partition_key=user_id,
                ):
                    items.append(item)
                return items
            except Exception as e:
                logger.error(f"Failed to query Azure Cosmos DB: {e}. Reading fallback store.")

        # Read from fallback store
        user_records = self._fallback_store.get(user_id, [])
        return user_records[:limit]

    async def close(self) -> None:
        """Close Cosmos DB client session."""
        if self._client:
            await self._client.close()
            self._client = None
            logger.info("Azure Cosmos DB client closed.")


# Singleton instance
cosmos_manager = CosmosDBManager()
