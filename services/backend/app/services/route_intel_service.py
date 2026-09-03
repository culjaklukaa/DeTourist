from datetime import datetime
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

from app.models.poi import POI
from app.core.crowd_index import calculate_crowd_index

# ==============================================================================
# RouteScore Result
# ==============================================================================
@dataclass
class RouteScoreResult:
    score: float
    interest_match: float
    crowd_avoidance: float
    proximity: float
    novelty: float
    redundancy_penalty: float

# ==============================================================================
# Weight Presets per Pacing Tier (Phase 1A, §8.4)
# ==============================================================================
PACING_TIER_WEIGHTS = {
    # Short stays: Focus on proximity and interest match. Crowds and novelty matter less.
    "packed": {
        "w1": 0.35,  # Interest Match
        "w2": 0.10,  # Crowd Avoidance
        "w3": 0.40,  # ProximityScore
        "w4": 0.05,  # NoveltyScore
        "w5": 0.10   # RedundancyPenalty
    },
    # Default/Medium stays: Balanced approach
    "moderate": {
        "w1": 0.30,
        "w2": 0.25,
        "w3": 0.20,
        "w4": 0.15,
        "w5": 0.10
    },
    # Long stays: Highly prioritize novelty and crowd avoidance over proximity
    "relaxed": {
        "w1": 0.25,
        "w2": 0.40,
        "w3": 0.05,
        "w4": 0.25,
        "w5": 0.05
    }
}

# Maximum theoretical CrowdIndex (Tier 5 * 1.6 Transit Hub * 1.0 peak curve * 1.15 sat)
# We use this to normalize CrowdIndex into a 0.0-1.0 penalty scale.
MAX_EXPECTED_CROWD_INDEX = 8.0 

def _calculate_interest_match(poi: POI, user_preferences: List[str]) -> float:
    """
    Returns 0.0 to 1.0 representing how well the POI matches user preferences.
    Checks overlap between user preference tags and POI category/tags.
    """
    if not user_preferences:
        return 0.5  # Neutral default if no preferences are stated
        
    tags = poi.tags or {}
    poi_keywords = set([poi.category.lower()] if poi.category else [])
    
    # In a real app, tags is a JSON dict (e.g. {"amenity": "cafe", "historic": "monument"})
    for k, v in tags.items():
        poi_keywords.add(str(v).lower())
        
    user_prefs_lower = set(p.lower() for p in user_preferences)
    overlap = poi_keywords.intersection(user_prefs_lower)
    
    if overlap:
        # Give 0.4 per matching tag, max 1.0
        return min(1.0, len(overlap) * 0.4)
    return 0.1  # Low match

import struct
import math

def get_lon_lat_from_wkb(wkb_hex):
    try:
        data = bytes.fromhex(wkb_hex)
        # Check endianness
        endian = '<' if data[0] == 1 else '>'
        # Unpack as EWKB Point (SRID included)
        # byte 0: endian
        # byte 1-4: type (uint)
        # byte 5-8: SRID (uint)
        # byte 9-16: X (double)
        # byte 17-24: Y (double)
        # Format string: b I I d d
        unpacked = struct.unpack(endian + 'bIIdd', data[:25])
        return unpacked[3], unpacked[4]
    except Exception:
        return 0.0, 0.0

def haversine_dist(lon1, lat1, lon2, lat2):
    R = 6371.0 # Earth radius in km
    dlon = math.radians(lon2 - lon1)
    dlat = math.radians(lat2 - lat1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def _calculate_proximity_score(poi: POI, current_route_path: List[POI]) -> float:
    """
    Returns 0.0 to 1.0 based on spatial distance to the last POI in the path.
    1.0 = adjacent/very close (< 500m), 0.0 = opposite side of town (> 10km).
    """
    if not current_route_path:
        return 1.0  # If it's the first POI, distance doesn't matter or is optimal
        
    last_poi = current_route_path[-1]
    
    # Extract coordinates from WKB data
    def get_wkb_hex(loc):
        if not loc:
            return None
        if hasattr(loc, "data"):
            return loc.data
        if isinstance(loc, str):
            return loc
        return None
        
    wkb1 = get_wkb_hex(poi.location)
    wkb2 = get_wkb_hex(last_poi.location)
    
    lon1, lat1 = get_lon_lat_from_wkb(wkb1) if wkb1 else (0.0, 0.0)
    lon2, lat2 = get_lon_lat_from_wkb(wkb2) if wkb2 else (0.0, 0.0)
    
    dist_km = haversine_dist(lon1, lat1, lon2, lat2)
    
    # Normalize: < 0.5km is 1.0, > 10km is 0.0
    if dist_km <= 0.5:
        return 1.0
    elif dist_km >= 10.0:
        return 0.0
    else:
        # linear scale between 0.5km and 10km
        return 1.0 - ((dist_km - 0.5) / 9.5)

def _calculate_novelty_score(poi: POI, pacing_tier: str) -> float:
    """
    Returns 0.0 to 1.0 representing how 'off the beaten path' this POI is.
    Inversely proportional to significance_tier.
    """
    tier = poi.significance_tier if poi.significance_tier is not None else 1
    # Tier 5 (Famous) -> Novelty 0.2
    # Tier 1 (Obscure) -> Novelty 1.0
    novelty = 1.0 - ((tier - 1) * 0.2)
    return max(0.0, min(1.0, novelty))

def _calculate_redundancy_penalty(poi: POI, already_selected_similar_pois: List[POI]) -> float:
    """
    Returns 0.0 to 1.0 penalty. 1.0 means highly redundant.
    Checks how many POIs of the same category are already in the current route.
    """
    if not already_selected_similar_pois:
        return 0.0
        
    same_category_count = sum(1 for p in already_selected_similar_pois if p.category == poi.category)
    
    # E.g., penalty increases by 0.35 for every similar POI already in the route
    penalty = same_category_count * 0.35
    return min(1.0, penalty)


def calculate_route_score(
    poi: POI, 
    time_slot: datetime, 
    user_preferences: List[str], 
    pacing_tier: str, 
    current_route_path: List[POI]
) -> RouteScoreResult:
    """
    RouteScore(poi, time_slot, user) =
        w1 * InterestMatch(poi, user.preferences)
      + w2 * (1 - CrowdIndex(poi, time_slot))
      + w3 * ProximityScore(poi, current_route_path)
      + w4 * NoveltyScore(poi, user.pacing_tier)
      - w5 * RedundancyPenalty(poi, already_selected_similar_pois)
    """
    # Fallback to moderate if unknown pacing tier
    weights = PACING_TIER_WEIGHTS.get(pacing_tier, PACING_TIER_WEIGHTS["moderate"])
    
    # 1. Interest Match
    interest = _calculate_interest_match(poi, user_preferences)
    
    # 2. Crowd Avoidance
    crowd_index_raw = calculate_crowd_index(poi, time_slot)
    normalized_crowd_avoidance = max(0.0, 1.0 - (crowd_index_raw / MAX_EXPECTED_CROWD_INDEX))
    
    # 3. Proximity
    proximity = _calculate_proximity_score(poi, current_route_path)
    
    # 4. Novelty
    novelty = _calculate_novelty_score(poi, pacing_tier)
    
    # 5. Redundancy
    redundancy = _calculate_redundancy_penalty(poi, current_route_path)
    
    # Compute Weighted Score
    score = (
        (weights["w1"] * interest) +
        (weights["w2"] * normalized_crowd_avoidance) +
        (weights["w3"] * proximity) +
        (weights["w4"] * novelty) -
        (weights["w5"] * redundancy)
    )
    
    return RouteScoreResult(
        score=round(score, 4),
        interest_match=round(interest, 4),
        crowd_avoidance=round(normalized_crowd_avoidance, 4),
        proximity=round(proximity, 4),
        novelty=round(novelty, 4),
        redundancy_penalty=round(redundancy, 4),
    )

# ==============================================================================
# Landmark-Tier Bypass Logic (Phase 1A, §8.4)
# ==============================================================================
def schedule_landmarks(landmarks: List[POI], available_time_slots: List[datetime]) -> Dict[datetime, POI]:
    """
    Bypasses standard scoring for Landmark POIs (e.g., Tier 4/5).
    Always includes them if there are enough time slots, placing them in the 
    slot with the lowest CrowdIndex to actively spread the load.
    """
    scheduled_backbone = {}
    
    # Sort landmarks by significance_tier descending to prioritize the most important ones
    sorted_landmarks = sorted(
        landmarks, 
        key=lambda p: p.significance_tier if p.significance_tier is not None else 0, 
        reverse=True
    )
    
    # Copy available slots so we can remove from them
    remaining_slots = list(available_time_slots)
    
    for poi in sorted_landmarks:
        if not remaining_slots:
            break  # Itinerary not long enough to fit all landmarks
            
        # Find the time slot that yields the lowest CrowdIndex for this specific POI
        best_slot = None
        lowest_crowd_index = float('inf')
        
        for slot in remaining_slots:
            crowd = calculate_crowd_index(poi, slot)
            if crowd < lowest_crowd_index:
                lowest_crowd_index = crowd
                best_slot = slot
                
        # Schedule it
        if best_slot:
            scheduled_backbone[best_slot] = poi
            remaining_slots.remove(best_slot)
            
    return scheduled_backbone
