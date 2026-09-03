export const PACING_TIERS = {
  RELAXED: "relaxed",
  MODERATE: "moderate",
  PACKED: "packed",
} as const;

export type PacingTier = typeof PACING_TIERS[keyof typeof PACING_TIERS];

export const SIGNIFICANCE_TIERS = {
  GLOBAL_LANDMARK: 5,
  MAJOR_ATTRACTION: 4,
  NOTABLE_POI: 3,
  LOCAL_FAVORITE: 2,
  NICHE_SPOT: 1,
} as const;

export type SignificanceTier = typeof SIGNIFICANCE_TIERS[keyof typeof SIGNIFICANCE_TIERS];

export const PACING_LABELS: Record<PacingTier, string> = {
  [PACING_TIERS.RELAXED]: "Relaxed (1-2 places/day)",
  [PACING_TIERS.MODERATE]: "Moderate (3-4 places/day)",
  [PACING_TIERS.PACKED]: "Packed (5+ places/day)",
};

export const SIGNIFICANCE_LABELS: Record<SignificanceTier, string> = {
  [SIGNIFICANCE_TIERS.GLOBAL_LANDMARK]: "Global Landmark (e.g. Eiffel Tower)",
  [SIGNIFICANCE_TIERS.MAJOR_ATTRACTION]: "Major Attraction (e.g. Louvre)",
  [SIGNIFICANCE_TIERS.NOTABLE_POI]: "Notable POI (e.g. Sacré-Cœur)",
  [SIGNIFICANCE_TIERS.LOCAL_FAVORITE]: "Local Favorite",
  [SIGNIFICANCE_TIERS.NICHE_SPOT]: "Niche Spot",
};
