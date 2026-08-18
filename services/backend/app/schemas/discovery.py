from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID


class ScoreBreakdown(BaseModel):
    interest_match: float
    crowd_avoidance: float
    proximity: float
    novelty: float
    redundancy_penalty: float


class RecommendedPOI(BaseModel):
    id: UUID
    name: Optional[str] = None
    category: Optional[str] = None
    significance_tier: Optional[int] = None
    tags: Optional[dict] = None
    score: float
    score_breakdown: ScoreBreakdown

    model_config = ConfigDict(from_attributes=True)


class DiscoveryResponse(BaseModel):
    trip_id: UUID
    pacing_tier: str
    total_candidates: int
    recommendations: List[RecommendedPOI]
