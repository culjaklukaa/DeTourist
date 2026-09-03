import uuid
from typing import List
from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.poi import POI
from app.models.crowd_signal import CrowdSignal
from app.models.user import User

router = APIRouter(prefix="/crowd-signals", tags=["crowd-signals"])

class CrowdSignalResponse(BaseModel):
    id: uuid.UUID
    poi_id: uuid.UUID
    time_bucket: datetime
    crowd_index: float
    sample_size: int
    source: str
    
    class Config:
        from_attributes = True

@router.get("/{poi_id}", response_model=List[CrowdSignalResponse])
async def get_crowd_signals(
    poi_id: uuid.UUID,
    target_date: date = Query(..., alias="date"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    # Verify POI exists
    poi_result = await session.execute(select(POI).where(POI.id == poi_id))
    if not poi_result.scalars().first():
        raise HTTPException(status_code=404, detail="POI not found")
        
    start_time = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=timezone.utc)
    end_time = start_time + timedelta(days=1)
    
    result = await session.execute(
        select(CrowdSignal)
        .where(
            and_(
                CrowdSignal.poi_id == poi_id,
                CrowdSignal.time_bucket >= start_time,
                CrowdSignal.time_bucket < end_time
            )
        )
        .order_by(CrowdSignal.time_bucket)
    )
    
    return result.scalars().all()
