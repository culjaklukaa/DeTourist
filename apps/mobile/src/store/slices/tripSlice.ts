import { StateCreator } from 'zustand';
import { api } from '../../lib/api';

import type { Trip } from '../../features/trips/api';

export interface CreateTripData {
  title: string;
  destination_name: string;
  start_date: string;
  end_date: string;
  interests: string[];
  pacing_tier: string;
}

export interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
  isLoadingTrips: boolean;
  tripError: string | null;
  fetchTrips: () => Promise<void>;
  createTrip: (data: CreateTripData) => Promise<Trip>;
  setActiveTrip: (trip: Trip | null) => void;
  deleteTrip: (id: string) => Promise<void>;
}

export const createTripSlice: StateCreator<TripState> = (set, get) => ({
  trips: [],
  activeTrip: null,
  isLoadingTrips: false,
  tripError: null,

  fetchTrips: async () => {
    set({ isLoadingTrips: true, tripError: null });
    try {

      const { data } = await api.get<Trip[]>('/v1/trips');
      set({ trips: data, isLoadingTrips: false });
    } catch (err: any) {
      set({
        tripError: err.message || 'Failed to load trips',
        isLoadingTrips: false,
      });
    }
  },

  createTrip: async (tripData: CreateTripData) => {
    set({ isLoadingTrips: true, tripError: null });
    try {


      const { data } = await api.post<Trip>('/v1/trips', tripData);
      set((state) => ({
        trips: [data, ...state.trips],
        activeTrip: data,
        isLoadingTrips: false,
      }));
      return data;
    } catch (err: any) {
      set({
        tripError: err.message || 'Failed to create trip',
        isLoadingTrips: false,
      });
      throw err;
    }
  },

  setActiveTrip: (trip) => set({ activeTrip: trip }),

  deleteTrip: async (id: string) => {
    try {
      await api.delete(`/v1/trips/${id}`);
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== id),
        activeTrip: state.activeTrip?.id === id ? null : state.activeTrip,
      }));
    } catch (err: any) {
      set({ tripError: err.message || 'Failed to delete trip' });
    }
  },
});
