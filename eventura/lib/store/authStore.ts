import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface ActiveContext {
  role: string;
  collegeId: string | null;
  clubId: string | null;
  permissions?: string[];
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  activeRole: string | null;
  collegeId: string | null;
  clubId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: AuthUser | null, accessToken: string, activeContext: ActiveContext | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  activeRole: null,
  collegeId: null,
  clubId: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user, accessToken, activeContext) =>
    set({
      user,
      accessToken,
      activeRole: activeContext?.role ?? null,
      collegeId: activeContext?.collegeId ?? null,
      clubId: activeContext?.clubId ?? null,
      isAuthenticated: true,
      isLoading: false,
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      activeRole: null,
      collegeId: null,
      clubId: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
