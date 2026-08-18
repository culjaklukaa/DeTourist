import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import User
from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripUpdate, TripResponse

router = APIRouter(prefix="/trips", tags=["trips"])

def _build_trip_response(row) -> TripResponse:
    trip, lon, lat = row
    return TripResponse(
        id=trip.id,
        user_id=trip.user_id,
        title=trip.title,
        description=trip.description,
        destination_name=trip.destination_name,
        longitude=lon,
        latitude=lat,
        start_date=trip.start_date,
        end_date=trip.end_date,
        interests=trip.interests,
        pacing_tier=trip.pacing_tier,
        created_at=trip.created_at,
        updated_at=trip.updated_at
    )

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_in: TripCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    trip_data = trip_in.model_dump(exclude={"longitude", "latitude"})
    trip = Trip(**trip_data, user_id=current_user.id)
    
    if trip_in.longitude is not None and trip_in.latitude is not None:
        trip.destination_coords = func.ST_SetSRID(func.ST_MakePoint(trip_in.longitude, trip_in.latitude), 4326)
        
    session.add(trip)
    await session.commit()
    await session.refresh(trip)
    
    # Return it with the parsed coordinates
    return TripResponse(
        **{c.name: getattr(trip, c.name) for c in trip.__table__.columns if c.name != 'destination_coords'},
        longitude=trip_in.longitude,
        latitude=trip_in.latitude
    )

@router.get("", response_model=List[TripResponse])
async def read_trips(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    query = select(
        Trip,
        func.ST_X(Trip.destination_coords).label('lon'),
        func.ST_Y(Trip.destination_coords).label('lat')
    ).where(Trip.user_id == current_user.id)
    
    result = await session.execute(query)
    return [_build_trip_response(row) for row in result.all()]

@router.get("/{trip_id}", response_model=TripResponse)
async def read_trip(
    trip_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    query = select(
        Trip,
        func.ST_X(Trip.destination_coords).label('lon'),
        func.ST_Y(Trip.destination_coords).label('lat')
    ).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    
    result = await session.execute(query)
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    return _build_trip_response(row)

@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: uuid.UUID,
    trip_in: TripUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    query = select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    result = await session.execute(query)
    trip = result.scalars().first()
    
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    update_data = trip_in.model_dump(exclude_unset=True, exclude={"longitude", "latitude"})
    for field, value in update_data.items():
        setattr(trip, field, value)
        
    if trip_in.longitude is not None and trip_in.latitude is not None:
        trip.destination_coords = func.ST_SetSRID(func.ST_MakePoint(trip_in.longitude, trip_in.latitude), 4326)
        
    session.add(trip)
    await session.commit()
    await session.refresh(trip)
    
    # Re-fetch for coords
    fetch_query = select(
        Trip,
        func.ST_X(Trip.destination_coords).label('lon'),
        func.ST_Y(Trip.destination_coords).label('lat')
    ).where(Trip.id == trip_id)
    fetch_result = await session.execute(fetch_query)
    return _build_trip_response(fetch_result.first())

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    query = delete(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    result = await session.execute(query)
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    await session.commit()
