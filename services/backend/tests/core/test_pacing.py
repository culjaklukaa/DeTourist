import pytest
from datetime import date
from app.core.pacing import resolve_pacing_tier, get_pacing_config, PACING_CONFIGS, PacingConfig

def test_resolve_pacing_tier_explicit():
    assert resolve_pacing_tier("packed") == "packed"
    assert resolve_pacing_tier("moderate") == "moderate"
    assert resolve_pacing_tier("relaxed") == "relaxed"
    
def test_resolve_pacing_tier_invalid_explicit():
    # If explicit tier is invalid, it falls back to duration-based or default
    assert resolve_pacing_tier("super-fast") == "moderate"

def test_resolve_pacing_tier_duration_based():
    # 1-3 days: packed
    assert resolve_pacing_tier(None, date(2023, 1, 1), date(2023, 1, 1)) == "packed" # 1 day
    assert resolve_pacing_tier(None, date(2023, 1, 1), date(2023, 1, 3)) == "packed" # 3 days
    
    # 4-7 days: moderate
    assert resolve_pacing_tier(None, date(2023, 1, 1), date(2023, 1, 4)) == "moderate" # 4 days
    assert resolve_pacing_tier(None, date(2023, 1, 1), date(2023, 1, 7)) == "moderate" # 7 days
    
    # 8+ days: relaxed
    assert resolve_pacing_tier(None, date(2023, 1, 1), date(2023, 1, 8)) == "relaxed" # 8 days
    assert resolve_pacing_tier(None, date(2023, 1, 1), date(2023, 1, 14)) == "relaxed" # 14 days

def test_resolve_pacing_tier_missing_dates():
    assert resolve_pacing_tier(None) == "moderate"
    assert resolve_pacing_tier(None, start_date=date(2023, 1, 1)) == "moderate"
    assert resolve_pacing_tier(None, end_date=date(2023, 1, 1)) == "moderate"

def test_get_pacing_config():
    config = get_pacing_config("packed")
    assert isinstance(config, PacingConfig)
    assert config.tier == "packed"
    assert config.radius_m == 5_000
    assert config.landmark_boost is True
    
    config2 = get_pacing_config(None, date(2023, 1, 1), date(2023, 1, 8))
    assert config2.tier == "relaxed"
    assert config2.landmark_boost is False
