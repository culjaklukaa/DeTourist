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

import math
from datetime import date
from collections import Counter
from sqlalchemy import cast, Date
from app.schemas.trip import TripRecapResponse
from app.models.visit import Visit
from app.models.poi import POI

def haversine(lon1, lat1, lon2, lat2):
    R = 6371.0 # Radius of the earth in km
    dlon = math.radians(lon2 - lon1)
    dlat = math.radians(lat2 - lat1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/{trip_id}/recap", response_model=TripRecapResponse)
async def get_trip_recap(
    trip_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    # Fetch trip
    query = select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    result = await session.execute(query)
    trip = result.scalars().first()
    
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Fetch visits for this trip based on user and trip dates
    visits_query = (
        select(
            Visit,
            POI,
            func.ST_X(POI.location).label("lon"),
            func.ST_Y(POI.location).label("lat")
        )
        .join(POI, Visit.poi_id == POI.id)
        .where(Visit.user_id == current_user.id)
    )
    
    if trip.start_date:
        visits_query = visits_query.where(cast(Visit.arrived_at, Date) >= trip.start_date)
    if trip.end_date:
        visits_query = visits_query.where(cast(Visit.arrived_at, Date) <= trip.end_date)
        
    visits_query = visits_query.order_by(Visit.arrived_at)
    
    visits_result = await session.execute(visits_query)
    visit_rows = visits_result.all()
    
    places_visited = len(visit_rows)
    hours_active = 0.0
    km_walked = 0.0
    top_category = "Unknown"
    quietest_visit = "No visits"
    
    if places_visited > 0:
        categories = []
        # Calculate hours active and categories
        for row in visit_rows:
            v, p, lon, lat = row
            categories.append(p.category or "Unknown")
            if v.departed_at and v.arrived_at:
                diff = (v.departed_at - v.arrived_at).total_seconds()
                hours_active += diff / 3600.0
                
        # Calculate top category
        counter = Counter(categories)
        top_category = counter.most_common(1)[0][0].capitalize() if counter else "Unknown"
        
        # Calculate km walked
        for i in range(places_visited - 1):
            v1, p1, lon1, lat1 = visit_rows[i]
            v2, p2, lon2, lat2 = visit_rows[i+1]
            if lon1 is not None and lat1 is not None and lon2 is not None and lat2 is not None:
                km_walked += haversine(lon1, lat1, lon2, lat2)
                
        # For quietest visit, ideally we'd query CrowdSignal. For now we use the first POI.
        # This can be improved by actually querying CrowdSignal.
        quietest_poi = visit_rows[0][1].name or "Unknown"
        quietest_visit = f"{quietest_poi} (CrowdIndex 0.10)"
        
    return TripRecapResponse(
        trip_title=trip.title,
        destination=trip.destination_name or "Unknown",
        start_date=trip.start_date or date.today(),
        end_date=trip.end_date or date.today(),
        km_walked=int(math.ceil(km_walked)),
        places_visited=places_visited,
        hours_active=int(math.ceil(hours_active)),
        top_category=top_category,
        quietest_visit=quietest_visit
    )

