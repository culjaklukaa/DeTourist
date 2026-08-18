from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from typing import List

from app.api import deps
from app.models.poi import POI
from app.schemas.poi import POISearchResponse, POIDetailResponse
from app.services.search_service import search_service

router = APIRouter()

@router.get("/search", response_model=List[POISearchResponse])
async def search_pois(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, le=100)
):
    """
    Search POIs using Meilisearch.
    Fast, typo-tolerant full-text search across POI names, tags, and categories.
    """
    try:
        hits = search_service.search_pois(q, limit=limit)
        return hits
    except Exception as e:
        # Fallback or error handling if Meilisearch is down
        raise HTTPException(status_code=503, detail=f"Search service unavailable: {str(e)}")

@router.get("/{poi_id}", response_model=POIDetailResponse)
async def get_poi_detail(
    poi_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Fetch full details of a specific POI directly from the PostgreSQL database.
    """
    result = await db.execute(select(POI).where(POI.id == poi_id))
    poi = result.scalar_one_or_none()
    
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
        
    return poi
