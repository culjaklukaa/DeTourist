from datetime import datetime

# ==============================================================================
# Category Base Multipliers
# ==============================================================================
CATEGORY_BASE_MULTIPLIER = {
    "Attractions": 1.5,
    "Landmarks & Historic": 1.3,
    "Food & Drink": 1.1,
    "Shopping": 1.2,
    "Parks & Nature": 0.7,
    "Transit Hubs": 1.6,
    "Accommodation": 0.8
}
DEFAULT_BASE_MULTIPLIER = 1.0

# ==============================================================================
# Day-of-Week Multipliers (0=Monday, 6=Sunday)
# ==============================================================================
DAY_MULTIPLIER_GENERAL = {0: 0.75, 1: 0.80, 2: 0.85, 3: 0.90, 4: 1.00, 5: 1.15, 6: 1.00}
DAY_MULTIPLIER_TRANSIT = {0: 1.00, 1: 1.00, 2: 1.00, 3: 1.00, 4: 1.00, 5: 0.60, 6: 0.55}

# ==============================================================================
# Season Multipliers (Month: 1-12)
# ==============================================================================
SEASON_MULTIPLIER = {
    1: 0.37, 2: 0.37, 3: 0.41, 4: 0.55, 5: 0.65, 6: 0.85,
    7: 0.97, 8: 1.00, 9: 0.75, 10: 0.65, 11: 0.45, 12: 0.55
}

# ==============================================================================
# Time-of-Day Curves (Hour: 0-23)
# ==============================================================================
def get_time_curve_multiplier(category: str, tags: dict, hour: int, weekday: int) -> float:
    # Handle weekend shift for Attractions
    is_weekend = weekday >= 5
    
    if category == "Attractions":
        if hour < 9: return 0.00
        elif hour == 9: return 0.25
        elif hour == 10: return 0.55
        elif hour == 11: return 0.80
        elif hour == 12: return 0.95 if not is_weekend else 0.85
        elif hour == 13: return 0.85 if not is_weekend else 0.95  # Weekend peak shifts later
        elif hour == 14: return 0.70
        elif hour == 15: return 0.55
        elif hour == 16: return 0.35
        elif hour == 17: return 0.15
        else: return 0.00
        
    elif category == "Landmarks & Historic":
        if hour < 7: return 0.05
        elif hour < 9: return 0.15
        elif hour == 9: return 0.30
        elif hour == 10: return 0.60
        elif hour < 15: return 0.85
        elif hour < 17: return 0.65
        elif hour == 17: return 0.75
        elif hour <= 20: return 1.00
        elif hour == 21: return 0.45
        else: return 0.15
        
    elif category == "Food & Drink":
        if tags.get("amenity") == "cafe":
            if hour < 6: return 0.30
            elif hour < 8: return 0.35
            elif hour < 10: return 0.60
            elif hour < 12: return 0.85
            elif hour < 14: return 0.55
            elif hour < 18: return 1.00
            elif hour < 20: return 0.80
            elif hour < 22: return 0.60
            else: return 0.30
        else: # Restaurants / Fast Food
            if hour < 11: return 0.25
            elif hour < 13: return 0.25
            elif hour < 15: return 0.80
            elif hour < 19: return 0.15
            elif hour == 19: return 0.35
            elif hour == 20: return 0.70
            elif hour < 23: return 1.00
            else: return 0.50
            
    elif category == "Shopping":
        if hour < 8: return 0.05
        elif hour < 10: return 0.20
        elif hour == 10: return 0.50
        elif hour < 14: return 1.00
        elif hour < 17: return 0.70
        elif hour < 20: return 0.80
        elif hour == 20: return 0.35
        else: return 0.05
        
    elif category == "Parks & Nature":
        if hour < 6: return 0.20
        elif hour < 8: return 0.40
        elif hour < 10: return 0.30
        elif hour < 12: return 0.50
        elif hour < 15: return 0.65
        elif hour < 18: return 0.90
        elif hour < 20: return 0.55
        else: return 0.20
        
    elif category == "Transit Hubs":
        if hour < 5: return 0.10
        elif hour < 7: return 0.45
        elif hour < 10: return 1.00
        elif hour < 12: return 0.35
        elif hour < 15: return 0.45
        elif hour == 15: return 0.55
        elif hour < 19: return 0.90
        elif hour < 22: return 0.30
        else: return 0.10
        
    elif category == "Accommodation":
        if hour < 6: return 0.20
        elif hour < 10: return 0.70
        elif hour < 14: return 0.15
        elif hour < 17: return 0.85
        elif hour < 20: return 0.40
        elif hour < 22: return 0.30
        else: return 0.20
        
    return 0.50 # Default safe fallback


def calculate_crowd_index(poi, target_time: datetime) -> float:
    """
    Calculates the CrowdIndex heuristic for a given POI at a specific time.
    
    Formula:
    CrowdIndex = Significance_Tier_Weight(POI)
               x Category_Base_Multiplier(POI.category)
               x Time_Curve(POI.category, hour)
               x Day_Multiplier(day, POI.category)
               x Season_Multiplier(month)
    """
    if not poi or not target_time:
        return 0.0

    # 1. Significance Tier Weight
    # If a POI lacks a significance_tier, we default it to 1
    tier_weight = poi.significance_tier if poi.significance_tier is not None else 1

    category = poi.category or "Unknown"
    tags = poi.tags or {}
    
    # 2. Category Base Multiplier
    cat_multiplier = CATEGORY_BASE_MULTIPLIER.get(category, DEFAULT_BASE_MULTIPLIER)
    
    # 3. Time Curve Multiplier
    hour = target_time.hour
    weekday = target_time.weekday() # 0 = Mon, 6 = Sun
    time_curve_val = get_time_curve_multiplier(category, tags, hour, weekday)
    
    # 4. Day Multiplier
    if category == "Transit Hubs":
        day_mult = DAY_MULTIPLIER_TRANSIT.get(weekday, 1.00)
    else:
        day_mult = DAY_MULTIPLIER_GENERAL.get(weekday, 1.00)
        
    # 5. Season Multiplier
    month = target_time.month
    season_mult = SEASON_MULTIPLIER.get(month, 1.00)
    
    # Combine
    crowd_index = tier_weight * cat_multiplier * time_curve_val * day_mult * season_mult
    
    return round(crowd_index, 2)
