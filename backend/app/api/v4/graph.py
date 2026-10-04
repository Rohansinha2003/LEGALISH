"""
Legal Knowledge Graph API Router (V4).
Provides entity search, graph traversal, and relationship visualization.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.graph.service import LegalKnowledgeGraphService
from app.schemas.v4 import KnowledgeGraphExploreResponse, LegalEntityRead

router = APIRouter()


@router.get("/entities", response_model=List[LegalEntityRead])
async def search_entities(
    query: Optional[str] = Query(None, description="Search keyword for canonical name or identifier"),
    entity_type: Optional[str] = Query(None, description="Filter by type: act, section, court, judgment"),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Searches legal entities in the verified Indian knowledge graph."""
    service = LegalKnowledgeGraphService(db)
    entities = await service.search_entities(query=query, entity_type=entity_type, limit=limit)
    return entities


@router.get("/entities/{entity_id_or_identifier}")
async def get_entity(
    entity_id_or_identifier: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieves a single legal entity by UUID or canonical identifier."""
    service = LegalKnowledgeGraphService(db)
    entity = await service.get_entity(entity_id_or_identifier)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found in knowledge graph.")
    return {
        "id": str(entity.id),
        "identifier": entity.identifier,
        "entity_type": entity.entity_type,
        "canonical_name": entity.canonical_name,
        "jurisdiction": entity.jurisdiction,
        "metadata": entity.metadata_ or {},
    }


@router.get("/explore/{entity_id_or_identifier}", response_model=KnowledgeGraphExploreResponse)
async def explore_graph(
    entity_id_or_identifier: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Traverses connected graph nodes, outgoing relationships,
    and incoming relationships for interactive graph rendering.
    """
    service = LegalKnowledgeGraphService(db)
    result = await service.explore_graph(entity_id_or_identifier)
    return result


@router.post("/seed")
async def seed_knowledge_graph(
    db: AsyncSession = Depends(get_db),
):
    """Seeds foundational Indian statutory and precedent graph nodes."""
    service = LegalKnowledgeGraphService(db)
    await service.ensure_seed_graph()
    return {"status": "success", "message": "Knowledge graph seeded successfully."}
