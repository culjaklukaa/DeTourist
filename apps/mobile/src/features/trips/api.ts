import { api } from '@/lib/api';

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  destination_name?: string;
  longitude?: number;
  latitude?: number;
  start_date?: string;
  end_date?: string;
  interests?: string[];
  pacing_tier?: string;
  created_at: string;
  updated_at: string;
}

export async function getTrips(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>('/v1/trips');
  return data;
}
