"""
Pacing-tier logic (§8.1) — trip-length-aware itinerary pacing.

Resolves which pacing tier a trip falls into based on its duration,
and provides per-tier behavioral parameters that the discovery service
and route generation use to shape recommendations.

| Stay length | Tier     | Behavior                                                        |
|-------------|----------|-----------------------------------------------------------------|
| 1–3 days    | packed   | Tight cluster, landmarks as backbone, minimize travel time      |
| 4–7 days    | moderate | Mix of flagship + secondary POIs, one excursion day             |
| 8+ days     | relaxed  | Under-visited spots, neighborhood depth, slower pace            |
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Optional


VALID_PACING_TIERS = ("packed", "moderate", "relaxed")


@dataclass(frozen=True)
class PacingConfig:
    """Behavioral parameters for a pacing tier."""

    tier: str

    # Spatial search radius in meters
    radius_m: int

    # Minimum significance_tier to include (None = no filter)
    # Packed trips focus on high-confidence POIs; relaxed trips include everything.
    min_significance_tier: Optional[int]

    # Whether landmark-tier POIs (significance_tier >= 4) are force-included
    # at the top of the discovery feed regardless of score.
    landmark_boost: bool

    # Maximum daily POI count the discovery feed should aim for.
    # This caps the per-day recommendation density.
    daily_poi_target: int

    # Minimum novelty score threshold — POIs below this are filtered out.
    # Relaxed trips have no threshold (explore everything); packed trips
    # skip obscure, low-novelty spots to focus on sure bets.
    min_novelty: float

    # Category diversity cap — max POIs of the same category in one page
    # of recommendations. Prevents "5 cafés in a row" results.
    category_diversity_cap: int


# ==============================================================================
# Tier Configurations (§8.1)
# ==============================================================================
PACING_CONFIGS = {
    # 1–3 days: Tight cluster of high-confidence, logistically close POIs.
    # Landmark-tier POIs are the backbone. Minimize inter-stop travel time.
    "packed": PacingConfig(
        tier="packed",
        radius_m=5_000,
        min_significance_tier=2,        # Skip tier-1 obscure spots
        landmark_boost=True,            # Always surface landmarks first
        daily_poi_target=6,             # Dense schedule
        min_novelty=0.0,                # Don't filter by novelty
        category_diversity_cap=2,       # Tight diversity constraint
    ),

    # 4–7 days: Mix of flagship + secondary POIs.
    "moderate": PacingConfig(
        tier="moderate",
        radius_m=15_000,
        min_significance_tier=None,     # Include everything
        landmark_boost=True,            # Still surface landmarks
        daily_poi_target=5,             # Balanced pace
        min_novelty=0.0,
        category_diversity_cap=3,
    ),

    # 8+ days: Heavier weight toward under-visited, quality-matched spots.
    # Neighborhood-level depth over checklist coverage.
    "relaxed": PacingConfig(
        tier="relaxed",
        radius_m=30_000,
        min_significance_tier=None,     # Include everything, even obscure
        landmark_boost=False,           # Let landmarks compete on score
        daily_poi_target=4,             # Slower pace, deeper visits
        min_novelty=0.0,
        category_diversity_cap=4,       # More variety allowed
    ),
}


def _trip_duration_days(start_date: Optional[date], end_date: Optional[date]) -> Optional[int]:
    """Returns the number of days in the trip, or None if dates are missing."""
    if start_date and end_date:
        delta = (end_date - start_date).days + 1  # inclusive
        return max(1, delta)
    return None


def resolve_pacing_tier(
    explicit_tier: Optional[str],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> str:
    """
    Resolves the effective pacing tier for a trip.

    Priority:
    1. User's explicit choice (if valid)
    2. Auto-derived from trip duration
    3. Fallback to "moderate"
    """
    # Honor explicit user preference
    if explicit_tier and explicit_tier in VALID_PACING_TIERS:
        return explicit_tier

    # Auto-derive from trip duration
    duration = _trip_duration_days(start_date, end_date)
    if duration is not None:
        if duration <= 3:
            return "packed"
        elif duration <= 7:
            return "moderate"
        else:
            return "relaxed"

    return "moderate"


def get_pacing_config(
    explicit_tier: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> PacingConfig:
    """
    Resolves the pacing tier and returns its full configuration.
    """
    tier = resolve_pacing_tier(explicit_tier, start_date, end_date)
    return PACING_CONFIGS[tier]
