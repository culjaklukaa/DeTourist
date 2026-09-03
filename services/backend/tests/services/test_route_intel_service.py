import pytest
from datetime import datetime
from unittest.mock import patch

from app.services.route_intel_service import (
    calculate_route_score,
    schedule_landmarks,
    RouteScoreResult,
    _calculate_interest_match,
    _calculate_proximity_score,
    _calculate_novelty_score,
    _calculate_redundancy_penalty,
)

class MockPOI:
    def __init__(self, category=None, tags=None, significance_tier=None):
        self.category = category
        self.tags = tags or {}
        self.significance_tier = significance_tier
        self.location = None

def test_calculate_interest_match():
    poi = MockPOI(category="cafe", tags={"amenity": "cafe", "cuisine": "coffee"})
    
    # No preferences -> neutral
    assert _calculate_interest_match(poi, []) == 0.5
    
    # Matching preference
    assert _calculate_interest_match(poi, ["cafe"]) == 0.4
    
    # Multiple matching preference (capped at 1.0, but here 2 * 0.4 = 0.8)
    assert _calculate_interest_match(poi, ["cafe", "coffee"]) == 0.8
    
    # Three matches
    poi.tags["specialty"] = "espresso"
    assert _calculate_interest_match(poi, ["cafe", "coffee", "espresso"]) == 1.0 # 3 * 0.4 = 1.2 -> 1.0
    
    # No overlap
    assert _calculate_interest_match(poi, ["museum"]) == 0.1

def test_calculate_proximity_score():
    poi = MockPOI()
    assert _calculate_proximity_score(poi, []) == 1.0
    
    # Without locations it returns distance 0.0, which maps to score 1.0
    assert _calculate_proximity_score(poi, [MockPOI()]) == 1.0

def test_calculate_novelty_score():
    # tier 1 -> 1.0
    assert _calculate_novelty_score(MockPOI(significance_tier=1), "packed") == pytest.approx(1.0)
    # tier 5 -> 0.2
    assert _calculate_novelty_score(MockPOI(significance_tier=5), "packed") == pytest.approx(0.2)
    # None defaults to 1 -> 1.0
    assert _calculate_novelty_score(MockPOI(significance_tier=None), "packed") == pytest.approx(1.0)
    # tier 6 theoretically -> 0.0 (bounded by min/max)
    assert _calculate_novelty_score(MockPOI(significance_tier=7), "packed") == pytest.approx(0.0)

def test_calculate_redundancy_penalty():
    poi = MockPOI(category="museum")
    # Empty path
    assert _calculate_redundancy_penalty(poi, []) == 0.0
    
    # No matching category
    path = [MockPOI(category="cafe"), MockPOI(category="park")]
    assert _calculate_redundancy_penalty(poi, path) == 0.0
    
    # One matching category
    path.append(MockPOI(category="museum"))
    assert _calculate_redundancy_penalty(poi, path) == 0.35
    
    # Three matching categories (3 * 0.35 = 1.05 -> 1.0)
    path.extend([MockPOI(category="museum"), MockPOI(category="museum")])
    assert _calculate_redundancy_penalty(poi, path) == 1.0

@patch("app.services.route_intel_service.calculate_crowd_index")
def test_calculate_route_score(mock_crowd_index):
    mock_crowd_index.return_value = 2.0  # Normalized: 1.0 - (2.0 / 8.0) = 0.75
    
    poi = MockPOI(category="cafe", tags={"amenity": "cafe"}, significance_tier=3)
    user_prefs = ["cafe"] # Interest: 0.4
    time_slot = datetime(2023, 10, 20, 10, 0)
    
    # Tier: 3 -> Novelty: 1.0 - 2*0.2 = 0.6
    # Redundancy: 1 similar (0.35)
    path = [MockPOI(category="cafe")]
    
    # Pacing tier weights for 'packed'
    # w1 (interest): 0.35
    # w2 (crowd): 0.10
    # w3 (proximity): 0.40
    # w4 (novelty): 0.05
    # w5 (redundancy): 0.10
    
    result = calculate_route_score(
        poi=poi,
        time_slot=time_slot,
        user_preferences=user_prefs,
        pacing_tier="packed",
        current_route_path=path
    )
    
    assert isinstance(result, RouteScoreResult)
    assert result.interest_match == 0.4
    assert result.crowd_avoidance == 0.75
    assert result.proximity == 0.8
    assert result.novelty == 0.6
    assert result.redundancy_penalty == 0.35
    
    # Expected score calculation
    expected_score = (0.35 * 0.4) + (0.10 * 0.75) + (0.40 * 0.8) + (0.05 * 0.6) - (0.10 * 0.35)
    assert result.score == round(expected_score, 4)

@patch("app.services.route_intel_service.calculate_crowd_index")
def test_schedule_landmarks(mock_crowd_index):
    # Mock calculate_crowd_index to return a time-based pseudo-random value
    mock_crowd_index.side_effect = lambda poi, dt: dt.hour * 1.0
    
    poi1 = MockPOI(significance_tier=5)
    poi2 = MockPOI(significance_tier=4)
    poi3 = MockPOI(significance_tier=3)
    
    landmarks = [poi3, poi1, poi2] # Unsorted
    
    slots = [
        datetime(2023, 10, 20, 14, 0), # highest crowd
        datetime(2023, 10, 20, 10, 0), # lowest crowd
        datetime(2023, 10, 20, 12, 0), # medium crowd
    ]
    
    schedule = schedule_landmarks(landmarks, slots)
    
    assert len(schedule) == 3
    # poi1 is most significant, gets the best slot (hour 10)
    assert schedule[datetime(2023, 10, 20, 10, 0)] == poi1
    # poi2 gets next best slot (hour 12)
    assert schedule[datetime(2023, 10, 20, 12, 0)] == poi2
    # poi3 gets the last slot (hour 14)
    assert schedule[datetime(2023, 10, 20, 14, 0)] == poi3
