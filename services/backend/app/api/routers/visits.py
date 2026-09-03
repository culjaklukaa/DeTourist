import uuid
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import User
from app.models.trip import Trip
from app.models.visit import Visit, VisitSource
from app.models.poi import POI

router = APIRouter(prefix="/trips/{trip_id}/visits", tags=["visits"])

class VisitCreate(BaseModel):
    poi_id: uuid.UUID
    arrived_at: datetime
    source: VisitSource = Field(default=VisitSource.gps_auto)
    departed_at: datetime | None = None

class VisitBulkCreate(BaseModel):
    visits: List[VisitCreate]

class VisitResponse(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    poi_id: uuid.UUID
    user_id: uuid.UUID
    arrived_at: datetime
    departed_at: datetime | None
    source: VisitSource
    created_at: datetime

    class Config:
        from_attributes = True

async def get_valid_trip(
    trip_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> Trip:
    result = await session.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.post("", response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
async def create_visit(
    trip_id: uuid.UUID,
    visit_in: VisitCreate,
    trip: Trip = Depends(get_valid_trip),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    # Verify POI exists
    poi_result = await session.execute(select(POI).where(POI.id == visit_in.poi_id))
    if not poi_result.scalars().first():
        raise HTTPException(status_code=404, detail="POI not found")

    visit = Visit(
        trip_id=trip.id,
        user_id=current_user.id,
        poi_id=visit_in.poi_id,
        arrived_at=visit_in.arrived_at,
        departed_at=visit_in.departed_at,
        source=visit_in.source
    )
    
    session.add(visit)
    await session.commit()
    await session.refresh(visit)
    return visit

@router.post("/bulk", response_model=List[VisitResponse], status_code=status.HTTP_201_CREATED)
async def create_visits_bulk(
    trip_id: uuid.UUID,
    bulk_in: VisitBulkCreate,
    trip: Trip = Depends(get_valid_trip),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    if not bulk_in.visits:
        return []

    # Get all POI IDs to verify they exist
    poi_ids = {v.poi_id for v in bulk_in.visits}
    poi_result = await session.execute(select(POI).where(POI.id.in_(poi_ids)))
    existing_pois = {p.id for p in poi_result.scalars().all()}
    
    missing_pois = poi_ids - existing_pois
    if missing_pois:
        raise HTTPException(
            status_code=400, 
            detail=f"Some POIs not found: {missing_pois}"
        )

    visits = [
        Visit(
            trip_id=trip.id,
            user_id=current_user.id,
            poi_id=v.poi_id,
            arrived_at=v.arrived_at,
            departed_at=v.departed_at,
            source=v.source
        )
        for v in bulk_in.visits
    ]
    
    session.add_all(visits)
    await session.commit()
    
    for v in visits:
        await session.refresh(v)
        
    return visits
