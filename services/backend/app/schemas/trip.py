import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict

class TripBase(BaseModel):
    title: str
    description: Optional[str] = None
    destination_name: Optional[str] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    destination_name: Optional[str] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class TripResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str] = None
    destination_name: Optional[str] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
