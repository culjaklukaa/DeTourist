import { create } from 'zustand';
import { createAuthSlice, AuthState } from './slices/authSlice';

export const useStore = create<AuthState>()((...a) => ({
  ...createAuthSlice(...a),
}));
