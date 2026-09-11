import { StateCreator } from 'zustand';
import { api } from '../../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  is_active: boolean;
  interests?: string[];
  default_pace?: string;
  default_stay_time?: string;
  created_at: string;
  updated_at: string;
}

export interface UserState {
  user: UserProfile | null;
  isLoadingUser: boolean;
  hasCompletedOnboarding: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => void;
  clearUser: () => void;
}

export const createUserSlice: StateCreator<UserState> = (set) => ({
  user: null,
  isLoadingUser: false,
  hasCompletedOnboarding: false,

  fetchProfile: async () => {
    set({ isLoadingUser: true });
    try {

      const { data } = await api.get<UserProfile>('/v1/users/me');
      set({ user: data, isLoadingUser: false });
    } catch (err) {
      set({ isLoadingUser: false });
    }
  },

  updateProfile: async (profileData) => {
    try {

      const { data } = await api.put<UserProfile>('/v1/users/me', profileData);
      set({ user: data });
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  },

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),

  clearUser: () => set({ user: null }),
});
