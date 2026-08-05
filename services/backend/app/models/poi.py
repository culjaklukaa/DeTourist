import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from geoalchemy2 import Geometry

from app.core.database import Base

class POISource(str, enum.Enum):
    osm = "osm"
    partner = "partner"
    manual = "manual"

class POI(Base):
    __tablename__ = "pois"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=True)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=True)
    
    # Store lat/lon as PostGIS Geometry
    location: Mapped[str] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=False
    )
    
    source: Mapped[POISource] = mapped_column(
        Enum(POISource, name="poi_source_enum"), nullable=False, default=POISource.osm
    )
    
    # Stubbed for Phase 1A (§8.4)
    significance_tier: Mapped[int] = mapped_column(Integer, nullable=True)
    
    tags: Mapped[dict] = mapped_column(JSONB, nullable=True, default=dict)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )
