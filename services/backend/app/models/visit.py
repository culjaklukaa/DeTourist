import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

class VisitSource(str, enum.Enum):
    gps_auto = "gps_auto"
    manual_checkin = "manual_checkin"

class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False
    )
    poi_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pois.id", ondelete="CASCADE"), nullable=False
    )
    
    arrived_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    departed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    
    source: Mapped[VisitSource] = mapped_column(
        Enum(VisitSource, name="visit_source_enum"), nullable=False
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="visits")
    trip = relationship("Trip", back_populates="visits")
    poi = relationship("POI", back_populates="visits")
