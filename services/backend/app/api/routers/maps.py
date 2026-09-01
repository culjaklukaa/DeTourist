from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()

class MapRegion(BaseModel):
    id: str
    name: str
    download_url: str
    size_bytes: int
    bounds: List[float] # [minLng, minLat, maxLng, maxLat]

@router.get("/regions", response_model=List[MapRegion])
def get_map_regions():
    """
    Returns a catalog of available offline map packs (PMTiles format).
    """
    return [
        MapRegion(
            id="bih-pilot",
            name="Bosnia and Herzegovina",
            download_url=f"https://{settings.ASSETS_DOMAIN}/regions/bih.pmtiles",
            size_bytes=104857600, # ~100MB mocked size
            bounds=[15.727, 42.565, 19.613, 45.275]
        )
    ]
