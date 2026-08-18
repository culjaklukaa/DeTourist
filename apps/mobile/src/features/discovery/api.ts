import { api } from '@/lib/api';

export interface ScoreBreakdown {
  interest_match: number;
  crowd_avoidance: number;
  proximity: number;
  novelty: number;
  redundancy_penalty: number;
}

export interface RecommendedPOI {
  id: string;
  name: string;
  category: string;
  significance_tier?: number | null;
  tags: Record<string, any>;
  score: number;
  score_breakdown: ScoreBreakdown;
}

export interface DiscoveryResponse {
  trip_id: string;
  pacing_tier: string;
  total_candidates: number;
  recommendations: RecommendedPOI[];
}

export async function getDiscoveryRecommendations(tripId: string, limit = 20, offset = 0): Promise<DiscoveryResponse> {
  const { data } = await api.get<DiscoveryResponse>('/v1/discovery/recommendations', {
    params: { trip_id: tripId, limit, offset },
  });
  return data;
}
