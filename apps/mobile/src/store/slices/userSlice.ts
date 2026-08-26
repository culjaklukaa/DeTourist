import { StateCreator } from 'zustand';
import { api } from '../../lib/api';
import { DEMO_MODE, MOCK_USER } from '../../lib/mockData';

export interface UserProfile {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserState {
  user: UserProfile | null;
  isLoadingUser: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearUser: () => void;
}

export const createUserSlice: StateCreator<UserState> = (set) => ({
  user: null,
  isLoadingUser: false,

  fetchProfile: async () => {
    set({ isLoadingUser: true });
    try {
      if (DEMO_MODE) {
        set({ user: MOCK_USER as UserProfile, isLoadingUser: false });
        return;
      }
      const { data } = await api.get<UserProfile>('/v1/users/me');
      set({ user: data, isLoadingUser: false });
    } catch (err) {
      set({ isLoadingUser: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      if (DEMO_MODE) {
        set((state) => ({
          user: state.user ? { ...state.user, ...profileData } : null,
        }));
        return;
      }
      const { data } = await api.put<UserProfile>('/v1/users/me', profileData);
      set({ user: data });
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  },

  clearUser: () => set({ user: null }),
});
