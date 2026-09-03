# Spec Deviations

This document tracks intentional deviations from the core product specifications (`DeTourist.md`).

## 1. Significance Tier (Numeric vs Enum)
- **Spec Section:** §8.1.1 (Relevance Filtering)
- **Specified:** `significance_tier` as an ENUM (`global_landmark`, `major_attraction`, `notable_poi`, `local_favorite`, `niche_spot`).
- **Implementation:** `significance_tier` is implemented as an `Integer` (1-5) in the database and models.
- **Rationale:** The numeric approach allows for easier relative comparisons (e.g. `poi.significance_tier >= user.preference_threshold`). It simplifies SQL queries for significance filtering without needing complex ENUM ordering rules. The API Types map these numeric values to the labeled tiers.
