import uuid
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, field_validator, model_validator

class TripBase(BaseModel):
    title: str
    description: Optional[str] = None
    destination_name: Optional[str] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    interests: Optional[List[str]] = None
    pacing_tier: Optional[str] = None

    @field_validator('pacing_tier')
    @classmethod
    def validate_pacing_tier(cls, v):
        if v is not None and v not in ('packed', 'moderate', 'relaxed'):
            raise ValueError('pacing_tier must be one of: packed, moderate, relaxed')
        return v

    @field_validator('longitude')
    @classmethod
    def validate_longitude(cls, v):
        if v is not None and not (-180 <= v <= 180):
            raise ValueError('longitude must be between -180 and 180')
        return v

    @field_validator('latitude')
    @classmethod
    def validate_latitude(cls, v):
        if v is not None and not (-90 <= v <= 90):
            raise ValueError('latitude must be between -90 and 90')
        return v

    @model_validator(mode='after')
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError('end_date must be on or after start_date')
        return self

    @model_validator(mode='after')
    def validate_coords_pair(self):
        has_lon = self.longitude is not None
        has_lat = self.latitude is not None
        if has_lon != has_lat:
            raise ValueError('longitude and latitude must both be provided or both omitted')
        return self

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
    interests: Optional[List[str]] = None
    pacing_tier: Optional[str] = None

    @field_validator('pacing_tier')
    @classmethod
    def validate_pacing_tier(cls, v):
        if v is not None and v not in ('packed', 'moderate', 'relaxed'):
            raise ValueError('pacing_tier must be one of: packed, moderate, relaxed')
        return v

    @field_validator('longitude')
    @classmethod
    def validate_longitude(cls, v):
        if v is not None and not (-180 <= v <= 180):
            raise ValueError('longitude must be between -180 and 180')
        return v

    @field_validator('latitude')
    @classmethod
    def validate_latitude(cls, v):
        if v is not None and not (-90 <= v <= 90):
            raise ValueError('latitude must be between -90 and 90')
        return v

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
    interests: Optional[List[str]] = None
    pacing_tier: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class TripRecapResponse(BaseModel):
    trip_title: str
    destination: str
    start_date: date
    end_date: date
    km_walked: int
    places_visited: int
    hours_active: int
    top_category: str
    quietest_visit: str

