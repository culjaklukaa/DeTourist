from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from typing import List, Optional
from datetime import datetime, timedelta, timezone, date

from app.api import deps
from app.core.database import get_db_session
from app.models.trip import Trip
from app.models.poi import POI
from app.models.route import Route
from app.schemas.route import RouteResponse
from app.services.route_intel_service import schedule_landmarks, calculate_route_score

router = APIRouter()

@router.get("/generate", response_model=RouteResponse)
async def generate_route(
    trip_id: uuid.UUID,
    target_date: date = Query(..., alias="date"),
    pacing: str = Query("moderate", description="Pacing tier: packed, moderate, relaxed"),
    prefs: Optional[str] = Query(None, description="Comma-separated user preferences"),
    db: AsyncSession = Depends(get_db_session),
    # Optional: require auth
    # current_user = Depends(deps.get_current_user)
):
    """
    Generate an intelligent route for a specific day of a trip.
    """
    # 1. Validate Trip
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Parse preferences
    user_preferences = [p.strip() for p in prefs.split(",")] if prefs else []

    # 2. Define Available Time Slots
    # E.g., 09:00 to 18:00 hourly for the given date
    start_time = datetime.combine(target_date, datetime.min.time()).replace(hour=9, tzinfo=timezone.utc)
    available_slots = [start_time + timedelta(hours=i) for i in range(10)]  # 9AM to 6PM
    
    # 3. Fetch POIs (for pilot, we fetch all active POIs or a subset. Limit to 100 to avoid memory issues)
    # Ideally, we would ST_DWithin around the trip destination.
    result = await db.execute(select(POI).limit(200))
    all_pois = result.scalars().all()
    
    if not all_pois:
        raise HTTPException(status_code=400, detail="No POIs available in the database to generate a route")

    # 4. Split Landmarks and Regular POIs
    landmarks = [p for p in all_pois if p.significance_tier and p.significance_tier >= 4]
    regular_pois = [p for p in all_pois if not p.significance_tier or p.significance_tier < 4]

    # 5. Schedule Landmarks (Backbone)
    # This modifies available_slots internally? No, schedule_landmarks returns a dict and we track remaining
    scheduled_backbone = schedule_landmarks(landmarks, available_slots)
    
    # Update remaining slots
    remaining_slots = [slot for slot in available_slots if slot not in scheduled_backbone]
    
    # 6. Fill remaining slots greedily
    final_schedule = scheduled_backbone.copy()
    current_route_path = list(scheduled_backbone.values()) # Start with landmarks as context
    
    for slot in remaining_slots:
        best_poi = None
        best_score = -float('inf')
        
        # In a real engine, we'd only score nearby POIs. Here we score all regular POIs
        for poi in regular_pois:
            # Skip if already in route
            if poi in current_route_path:
                continue
                
            score = calculate_route_score(
                poi=poi,
                time_slot=slot,
                user_preferences=user_preferences,
                pacing_tier=pacing,
                current_route_path=current_route_path
            )
            
            if score.score > best_score:
                best_score = score.score
                best_poi = poi
                
        if best_poi:
            final_schedule[slot] = best_poi
            current_route_path.append(best_poi)
            # Remove from pool to prevent visiting again
            regular_pois.remove(best_poi)

    # 7. Construct final sequenced array
    # Sort the dictionary by time slot to ensure chronological order
    sorted_slots = sorted(final_schedule.keys())
    poi_sequence = [final_schedule[slot].id for slot in sorted_slots]
    
    # Calculate total score for the route (just a sum of all individual scores at their times)
    total_route_score = 0.0
    for slot in sorted_slots:
        poi = final_schedule[slot]
        # Recalculate score for the metric
        result = calculate_route_score(poi, slot, user_preferences, pacing, current_route_path)
        total_route_score += result.score

    # 8. Save Route to DB
    new_route = Route(
        trip_id=trip.id,
        poi_sequence=poi_sequence,
        total_score=round(total_route_score, 2),
        mode="walking"
    )
    
    db.add(new_route)
    await db.commit()
    await db.refresh(new_route)
    
    return new_route
