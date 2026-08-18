import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.core.pacing import resolve_pacing_tier
from app.models.user import User
from app.models.trip import Trip
from app.schemas.discovery import DiscoveryResponse
from app.services import discovery_service

router = APIRouter()


@router.get("/recommendations", response_model=DiscoveryResponse)
async def get_recommendations(
    trip_id: uuid.UUID = Query(..., description="Trip ID to generate recommendations for"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of recommendations"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Returns a personalized discovery feed of POI recommendations for a trip,
    ranked by RouteScore (§8.4) and filtered by interests + pacing tier (§8.2).
    Pacing tier is auto-derived from trip duration if not explicitly set (§8.1).
    """
    # Validate trip exists and belongs to the current user
    result = await session.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalars().first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Resolve the effective pacing tier (user preference > trip duration > default)
    effective_tier = resolve_pacing_tier(
        explicit_tier=trip.pacing_tier,
        start_date=trip.start_date,
        end_date=trip.end_date,
    )

    recommendations, total_candidates = await discovery_service.get_recommendations(
        trip=trip,
        db=session,
        limit=limit,
        offset=offset,
    )

    return DiscoveryResponse(
        trip_id=trip.id,
        pacing_tier=effective_tier,
        total_candidates=total_candidates,
        recommendations=recommendations,
    )

