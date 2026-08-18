from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class RouteResponse(BaseModel):
    id: UUID
    trip_id: UUID
    poi_sequence: List[UUID]
    total_score: float
    mode: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
