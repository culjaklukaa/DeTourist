import { create } from 'zustand';
import { createAuthSlice, AuthState } from './slices/authSlice';
import { createTripSlice, TripState } from './slices/tripSlice';
import { createUserSlice, UserState } from './slices/userSlice';

export type StoreState = AuthState & TripState & UserState;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createTripSlice(...a),
  ...createUserSlice(...a),
}));
