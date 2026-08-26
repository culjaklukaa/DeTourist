/**
 * Mock/Demo Data Layer
 *
 * Provides hardcoded data for demo mode when the backend is unavailable.
 * Toggle `DEMO_MODE` to switch between real API and mock data.
 *
 * To remove: delete this file and all imports referencing it once the
 * backend is reliably available for demos.
 */

// ────────────────────────────────────────────
// Demo Mode Toggle
// ────────────────────────────────────────────

/** Set to `true` to use mock data instead of real API calls. */
export let DEMO_MODE = true;

export function setDemoMode(enabled: boolean) {
  DEMO_MODE = enabled;
}

// ────────────────────────────────────────────
// Mock User
// ────────────────────────────────────────────

export const MOCK_USER = {
  id: 'demo-user-001',
  email: 'demo@detourist.app',
  is_active: true,
  created_at: '2026-06-01T10:00:00Z',
  updated_at: '2026-08-20T14:30:00Z',
};

export const MOCK_TOKENS = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  token_type: 'bearer',
};

// ────────────────────────────────────────────
// Mock Trips
// ────────────────────────────────────────────

export interface MockTrip {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  start_date: string;
  end_date: string;
  interests: string[];
  pacing_tier: 'relaxed' | 'balanced' | 'packed';
  created_at: string;
  updated_at: string;
}

export const MOCK_TRIPS: MockTrip[] = [
  {
    id: 'trip-001',
    user_id: 'demo-user-001',
    title: 'Sarajevo Explorer',
    description: 'Discovering the heart of Bosnia',
    destination_name: 'Sarajevo, Bosnia and Herzegovina',
    destination_lat: 43.8563,
    destination_lng: 18.4131,
    start_date: '2026-10-12',
    end_date: '2026-10-16',
    interests: ['landmarks', 'food', 'attractions'],
    pacing_tier: 'balanced',
    created_at: '2026-08-15T10:00:00Z',
    updated_at: '2026-08-15T10:00:00Z',
  },
  {
    id: 'trip-002',
    user_id: 'demo-user-001',
    title: 'Mostar & Herzegovina',
    description: 'Bridge diving and old town charm',
    destination_name: 'Mostar, Bosnia and Herzegovina',
    destination_lat: 43.3438,
    destination_lng: 17.8078,
    start_date: '2026-11-01',
    end_date: '2026-11-04',
    interests: ['landmarks', 'parks', 'shopping'],
    pacing_tier: 'relaxed',
    created_at: '2026-08-20T14:00:00Z',
    updated_at: '2026-08-20T14:00:00Z',
  },
];

// ────────────────────────────────────────────
// Mock POIs & Recommendations
// ────────────────────────────────────────────

export interface MockRecommendedPOI {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  significance_tier: number;
  score: number;
  score_breakdown: {
    interest_match: number;
    crowd_avoidance: number;
    proximity: number;
    novelty: number;
    redundancy_penalty: number;
  };
  crowd_index: number;
  tags: Record<string, string>;
}

export const MOCK_RECOMMENDATIONS: MockRecommendedPOI[] = [
  {
    id: 'poi-001',
    name: 'Baščaršija',
    category: 'landmarks',
    lat: 43.8598,
    lng: 18.4310,
    significance_tier: 5,
    score: 0.92,
    score_breakdown: {
      interest_match: 0.95,
      crowd_avoidance: 0.65,
      proximity: 0.90,
      novelty: 0.85,
      redundancy_penalty: 0.0,
    },
    crowd_index: 0.35,
    tags: { type: 'bazaar', era: 'ottoman' },
  },
  {
    id: 'poi-002',
    name: 'Sebilj Fountain',
    category: 'landmarks',
    lat: 43.8601,
    lng: 18.4313,
    significance_tier: 4,
    score: 0.88,
    score_breakdown: {
      interest_match: 0.90,
      crowd_avoidance: 0.60,
      proximity: 0.95,
      novelty: 0.80,
      redundancy_penalty: 0.1,
    },
    crowd_index: 0.40,
    tags: { type: 'fountain', era: 'ottoman' },
  },
  {
    id: 'poi-003',
    name: 'Ćevabdžinica Željo',
    category: 'food',
    lat: 43.8590,
    lng: 18.4298,
    significance_tier: 2,
    score: 0.85,
    score_breakdown: {
      interest_match: 0.92,
      crowd_avoidance: 0.75,
      proximity: 0.88,
      novelty: 0.90,
      redundancy_penalty: 0.0,
    },
    crowd_index: 0.25,
    tags: { cuisine: 'bosnian', specialty: 'ćevapi' },
  },
  {
    id: 'poi-004',
    name: 'Tunnel of Hope Museum',
    category: 'attractions',
    lat: 43.8242,
    lng: 18.3560,
    significance_tier: 4,
    score: 0.84,
    score_breakdown: {
      interest_match: 0.88,
      crowd_avoidance: 0.82,
      proximity: 0.60,
      novelty: 0.95,
      redundancy_penalty: 0.0,
    },
    crowd_index: 0.18,
    tags: { type: 'museum', era: 'modern' },
  },
  {
    id: 'poi-005',
    name: 'Vrelo Bosne Park',
    category: 'parks',
    lat: 43.8186,
    lng: 18.2671,
    significance_tier: 3,
    score: 0.81,
    score_breakdown: {
      interest_match: 0.70,
      crowd_avoidance: 0.88,
      proximity: 0.55,
      novelty: 0.92,
      redundancy_penalty: 0.0,
    },
    crowd_index: 0.12,
    tags: { type: 'nature', feature: 'spring' },
  },
  {
    id: 'poi-006',
    name: 'Latin Bridge',
    category: 'landmarks',
    lat: 43.8575,
    lng: 18.4288,
    significance_tier: 5,
    score: 0.80,
    score_breakdown: {
      interest_match: 0.85,
      crowd_avoidance: 0.55,
      proximity: 0.92,
      novelty: 0.70,
      redundancy_penalty: 0.15,
    },
    crowd_index: 0.45,
    tags: { type: 'bridge', era: 'ottoman', event: 'archduke_assassination' },
  },
  {
    id: 'poi-007',
    name: 'Gazi Husrev-beg Mosque',
    category: 'landmarks',
    lat: 43.8596,
    lng: 18.4310,
    significance_tier: 4,
    score: 0.78,
    score_breakdown: {
      interest_match: 0.82,
      crowd_avoidance: 0.72,
      proximity: 0.90,
      novelty: 0.75,
      redundancy_penalty: 0.2,
    },
    crowd_index: 0.28,
    tags: { type: 'mosque', era: 'ottoman' },
  },
  {
    id: 'poi-008',
    name: 'Kazandžiluk (Coppersmith Street)',
    category: 'shopping',
    lat: 43.8594,
    lng: 18.4320,
    significance_tier: 2,
    score: 0.76,
    score_breakdown: {
      interest_match: 0.65,
      crowd_avoidance: 0.70,
      proximity: 0.95,
      novelty: 0.85,
      redundancy_penalty: 0.0,
    },
    crowd_index: 0.30,
    tags: { type: 'market', specialty: 'copperware' },
  },
];

// ────────────────────────────────────────────
// Mock Recap Data
// ────────────────────────────────────────────

export interface MockRecapData {
  trip_title: string;
  destination: string;
  start_date: string;
  end_date: string;
  km_walked: number;
  places_visited: number;
  hours_active: number;
  top_category: string;
  quietest_visit: string;
}

export const MOCK_RECAP: Record<string, MockRecapData> = {
  'trip-001': {
    trip_title: 'Sarajevo Explorer',
    destination: 'Sarajevo',
    start_date: '2026-10-12',
    end_date: '2026-10-16',
    km_walked: 24,
    places_visited: 12,
    hours_active: 14,
    top_category: 'Landmarks',
    quietest_visit: 'Vrelo Bosne Park (CrowdIndex 0.12)',
  },
  'trip-002': {
    trip_title: 'Mostar & Herzegovina',
    destination: 'Mostar',
    start_date: '2026-11-01',
    end_date: '2026-11-04',
    km_walked: 16,
    places_visited: 8,
    hours_active: 10,
    top_category: 'Landmarks',
    quietest_visit: 'Koski Mehmed Pasha Mosque (CrowdIndex 0.15)',
  },
};

// ────────────────────────────────────────────
// Interest Categories (Backend taxonomy)
// ────────────────────────────────────────────

export const INTEREST_CATEGORIES = [
  { id: 'attractions', label: 'Attractions', emoji: '🏛️' },
  { id: 'landmarks', label: 'Landmarks', emoji: '🗿' },
  { id: 'food', label: 'Food & Drink', emoji: '🍽️' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'parks', label: 'Parks & Nature', emoji: '🌿' },
  { id: 'transit', label: 'Transit', emoji: '🚌' },
  { id: 'accommodation', label: 'Accommodation', emoji: '🏨' },
] as const;

export type InterestCategoryId = (typeof INTEREST_CATEGORIES)[number]['id'];
