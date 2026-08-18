from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from uuid import UUID

class POISearchResponse(BaseModel):
    id: UUID
    name: Optional[str] = None
    category: Optional[str] = None
    # If geo is indexed, we might return it from search
    _geo: Optional[dict] = None
    
    # Optional fields that might be returned from search index
    tags: Optional[dict] = None

class POIDetailResponse(BaseModel):
    id: UUID
    name: Optional[str] = None
    category: Optional[str] = None
    source: str
    significance_tier: Optional[int] = None
    tags: Optional[dict] = None
    # You might want to format WKT location to lat/lng in a real app
    # location: str 

    model_config = ConfigDict(from_attributes=True)
