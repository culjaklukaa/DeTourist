import { StateCreator } from 'zustand';
import { saveToken, deleteToken, getToken } from '../../lib/secureStore';

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async (token, refreshToken) => {
    await saveToken('accessToken', token);
    await saveToken('refreshToken', refreshToken);
    set({ token, isAuthenticated: true });
  },
  signOut: async () => {
    await deleteToken('accessToken');
    await deleteToken('refreshToken');
    set({ token: null, isAuthenticated: false });
  },
  restoreSession: async () => {
    try {
      const token = await getToken('accessToken');
      if (token) {
        set({ token, isAuthenticated: true, isLoading: false });
      } else {
        set({ token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      set({ token: null, isAuthenticated: false, isLoading: false });
    }
  },
});
