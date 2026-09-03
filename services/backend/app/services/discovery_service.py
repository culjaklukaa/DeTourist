from datetime import datetime, timezone
from typing import List, Optional
from collections import Counter

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, or_, Text

from app.models.trip import Trip
from app.models.poi import POI
from app.models.visit import Visit
from app.core.pacing import get_pacing_config, PacingConfig
from app.services.route_intel_service import calculate_route_score, RouteScoreResult
from app.schemas.discovery import ScoreBreakdown, RecommendedPOI

# Hard limit on candidate POIs when no spatial filter is available
MAX_CANDIDATES_FALLBACK = 200

# Landmark significance_tier threshold (§8.4)
LANDMARK_TIER_THRESHOLD = 4


async def get_recommendations(
    trip: Trip,
    db: AsyncSession,
    limit: int = 20,
    offset: int = 0,
) -> tuple[List[RecommendedPOI], int]:
    """
    Returns a ranked list of POI recommendations for a trip,
    scored by RouteScore, filtered by interests + pacing tier,
    and shaped by trip-length-aware pacing behaviors (§8.1).
    """
    # --- Resolve pacing config from trip duration + user preference ---
    pacing = get_pacing_config(
        explicit_tier=trip.pacing_tier,
        start_date=trip.start_date,
        end_date=trip.end_date,
    )
    interests = trip.interests or []

    # --- Resolve scoring time_slot ---
    now = datetime.now(timezone.utc)
    if trip.start_date and now.date() < trip.start_date:
        # Trip hasn't started — score as if it's the first morning
        time_slot = datetime.combine(
            trip.start_date, datetime.min.time()
        ).replace(hour=10, tzinfo=timezone.utc)
    else:
        time_slot = now

    # --- Build candidate query ---
    query = select(POI)

    # Spatial filter: only POIs near the trip destination
    if trip.destination_coords is not None:
        # Cast geometry to geography for meter-based distance; both are already SRID 4326
        from geoalchemy2.types import Geography
        query = query.where(
            func.ST_DWithin(
                POI.location.cast(Geography(srid=4326)),
                select(Trip.destination_coords.cast(Geography(srid=4326)))
                .where(Trip.id == trip.id)
                .scalar_subquery(),
                pacing.radius_m,
            )
        )
    else:
        # No destination coords — fall back to a hard limit
        query = query.limit(MAX_CANDIDATES_FALLBACK)

    # Significance filter: packed trips skip very obscure POIs (§8.1)
    if pacing.min_significance_tier is not None:
        query = query.where(
            or_(
                POI.significance_tier >= pacing.min_significance_tier,
                POI.significance_tier.is_(None),  # Don't exclude uncategorized POIs
            )
        )

    # --- Interest pre-filter (hard filter) ---
    # Only apply if user has stated interests; otherwise show everything
    if interests:
        # Match POIs whose category OR any tag value overlaps with interests.
        # For tags (JSONB), cast to text and use ILIKE for a pragmatic substring match.
        interest_conditions = []
        tags_as_text = func.cast(POI.tags, Text)
        for interest in interests:
            interest_lower = interest.lower()
            interest_conditions.append(
                func.lower(POI.category) == interest_lower
            )
            interest_conditions.append(
                tags_as_text.ilike(f"%{interest_lower}%")
            )
        query = query.where(or_(*interest_conditions))

    # --- Exclude already-visited POIs ---
    visited_subq = (
        select(Visit.poi_id)
        .where(Visit.user_id == trip.user_id)
        .scalar_subquery()
    )
    query = query.where(POI.id.notin_(visited_subq))

    # --- Execute ---
    result = await db.execute(query)
    candidate_pois: List[POI] = list(result.scalars().all())
    total_candidates = len(candidate_pois)

    # --- Score each candidate ---
    scored: List[tuple[POI, RouteScoreResult]] = []
    for poi in candidate_pois:
        score_result = calculate_route_score(
            poi=poi,
            time_slot=time_slot,
            user_preferences=interests,
            pacing_tier=pacing.tier,
            current_route_path=[],  # Discovery is standalone, no route context
        )
        scored.append((poi, score_result))

    # --- Apply pacing-tier-specific ranking (§8.1) ---
    scored = _apply_pacing_behaviors(scored, pacing)

    # --- Paginate ---
    page = scored[offset: offset + limit]

    # --- Build response items ---
    recommendations = [
        RecommendedPOI(
            id=poi.id,
            name=poi.name,
            category=poi.category,
            significance_tier=poi.significance_tier,
            tags=poi.tags,
            score=sr.score,
            score_breakdown=ScoreBreakdown(
                interest_match=sr.interest_match,
                crowd_avoidance=sr.crowd_avoidance,
                proximity=sr.proximity,
                novelty=sr.novelty,
                redundancy_penalty=sr.redundancy_penalty,
            ),
        )
        for poi, sr in page
    ]

    return recommendations, total_candidates


def _apply_pacing_behaviors(
    scored: List[tuple[POI, RouteScoreResult]],
    pacing: PacingConfig,
) -> List[tuple[POI, RouteScoreResult]]:
    """
    Applies trip-length-aware pacing behaviors to the scored list (§8.1):

    - packed (1–3 days): Landmarks float to top; tight category diversity.
    - moderate (4–7 days): Landmarks included but compete more on score.
    - relaxed (8+ days): No landmark boost; maximizes category diversity.
    """
    if not scored:
        return scored

    # --- Separate landmarks if boosted ---
    if pacing.landmark_boost:
        landmarks = [
            (poi, sr) for poi, sr in scored
            if poi.significance_tier is not None
            and poi.significance_tier >= LANDMARK_TIER_THRESHOLD
        ]
        non_landmarks = [
            (poi, sr) for poi, sr in scored
            if poi.significance_tier is None
            or poi.significance_tier < LANDMARK_TIER_THRESHOLD
        ]
        # Sort each group by score
        landmarks.sort(key=lambda x: x[1].score, reverse=True)
        non_landmarks.sort(key=lambda x: x[1].score, reverse=True)

        # Landmarks first, then fill with non-landmarks
        merged = landmarks + non_landmarks
    else:
        # No landmark boost — pure score ordering
        merged = sorted(scored, key=lambda x: x[1].score, reverse=True)

    # --- Apply category diversity cap ---
    diversified = _apply_category_diversity(merged, pacing.category_diversity_cap)

    return diversified


def _apply_category_diversity(
    scored: List[tuple[POI, RouteScoreResult]],
    cap: int,
) -> List[tuple[POI, RouteScoreResult]]:
    """
    Reorders the scored list so that no more than `cap` POIs of the same
    category appear consecutively. POIs that exceed the cap are pushed
    further down rather than removed entirely.
    """
    if cap <= 0:
        return scored

    result: List[tuple[POI, RouteScoreResult]] = []
    deferred: List[tuple[POI, RouteScoreResult]] = []
    category_counts: Counter = Counter()

    for item in scored:
        poi, sr = item
        cat = poi.category or "unknown"
        if category_counts[cat] < cap:
            result.append(item)
            category_counts[cat] += 1
        else:
            deferred.append(item)

    # Append deferred items at the end (still in score order within their group)
    result.extend(deferred)
    return result
