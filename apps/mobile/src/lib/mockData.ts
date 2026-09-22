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
  display_name: 'Demo User',
  is_active: true,
  interests: ['landmarks', 'food', 'attractions'],
  default_pace: 'balanced',
  default_stay_time: 'standard',
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
  image_url: string;
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
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR4go6QVxu4Wcs9zo5YBPKt_r5-O7FRTWcl-ZpOMEeZQ&s=10',
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
    name: 'Tunnel of Hope Museum',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRts-pqgM5fXk0OaYgyE-GpsMswaS6GGyDz7sdrDYHO0Q&s=10',
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
    id: 'poi-003',
    name: 'Vrelo Bosne Park',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTn5Xu2H1koFSTcieFFq3stQ4eBvBMCcepaT2Ep_MY3Q&s=10',
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
    id: 'poi-004',
    name: 'Gazi Husrev-beg Mosque',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRptvAKCfo7YfWJojiTAJVxpPEgx2ZnySqVVyweLIfaZw&s=10',
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
    id: 'poi-005',
    name: 'Kazandžiluk (Coppersmith Street)',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9UON934nVx0Aq3jjdooB7fG4qpLfyF5Kia-pGAd5cOg&s=10',
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
  {
    id: 'poi-006',
    name: 'Stari most',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQy-41X7myVUEg2ikvhIJQ6ZhMI5E2wJsZBsiHU3g-bg&s=10',
    category: 'landmarks',
    lat: 43.3373,
    lng: 17.8150,
    significance_tier: 5,
    score: 0.95,
    score_breakdown: {
      interest_match: 0.95,
      crowd_avoidance: 0.20,
      proximity: 0.85,
      novelty: 0.80,
      redundancy_penalty: 0.0,
    },
    crowd_index: 0.85,
    tags: { type: 'bridge', era: 'ottoman' },
  },
  {
    id: 'poi-007',
    name: 'Blagaj',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf4FfpY0SpX8RCVPgOo9ny-8MOz4EWSQXncrmKK-3G7A&s=10',
    category: 'landmarks',
    lat: 43.2567,
    lng: 17.9039,
    significance_tier: 4,
    score: 0.90,
    score_breakdown: {
      interest_match: 0.90,
      crowd_avoidance: 0.75,
      proximity: 0.80,
      novelty: 0.85,
      redundancy_penalty: 0.0,
    },
    crowd_index: 0.40,
    tags: { type: 'monastery', era: 'ottoman' },
  },
  {
    id: 'poi-008',
    name: 'Počitelj',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9cXv0xYBMjeyBL2BjKDXNvRKqYu7bPf0qlxlX1uheXw&s=10',
    category: 'landmarks',
    lat: 43.1344,
    lng: 17.7317,
    significance_tier: 4,
    score: 0.88,
    score_breakdown: {
      interest_match: 0.88,
      crowd_avoidance: 0.80,
      proximity: 0.75,
      novelty: 0.90,
      redundancy_penalty: 0.0,
    },
    crowd_index: 0.30,
    tags: { type: 'fortress', era: 'medieval' },
  },
  {
    id: 'poi-009',
    name: 'Stolac',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXBA2wvM5HxiHvMTKp5tfJLssk0h6jO_RyvpyPhoAtQw&s=10',
    category: 'landmarks',
    lat: 43.0933,
    lng: 17.9250,
    significance_tier: 4,
    score: 0.86,
    score_breakdown: {
      interest_match: 0.85,
      crowd_avoidance: 0.90,
      proximity: 0.70,
      novelty: 0.95,
      redundancy_penalty: 0.0,
    },
    crowd_index: 0.15,
    tags: { type: 'necropolis', era: 'medieval' },
  },
  {
    id: 'poi-010',
    name: 'Trebinje',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9_y3KHj_ZBCqp8i60zS3qzq-soZGsuZsIIl-FgA-85A&s=10',
    category: 'landmarks',
    lat: 42.7119,
    lng: 18.3436,
    significance_tier: 4,
    score: 0.84,
    score_breakdown: {
      interest_match: 0.82,
      crowd_avoidance: 0.85,
      proximity: 0.65,
      novelty: 0.88,
      redundancy_penalty: 0.0,
    },
    crowd_index: 0.20,
    tags: { type: 'city', era: 'historic' },
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
