import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { graphqlRequest, AUTH_MUTATIONS, AUTH_QUERIES } from './graphql-client';

export type ViewMode = 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  role: 'TEACHER' | 'STUDENT_PARENT';
  studentName?: string | null;
  parentName?: string | null;
  teacherName?: string | null;
  avatar?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  fetchMe: () => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      viewMode: 'student' as ViewMode,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await graphqlRequest(
            AUTH_MUTATIONS.LOGIN,
            { input: { email, password } },
          );
          const { accessToken, refreshToken, user } = data.login;
          set({
            user,
            accessToken,
            refreshToken,
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.message || 'Login gagal',
          });
          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          viewMode: 'student',
          error: null,
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const data = await graphqlRequest(
            AUTH_MUTATIONS.REFRESH_TOKEN,
            { input: { refreshToken } },
          );
          set({
            accessToken: data.refreshToken.accessToken,
            refreshToken: data.refreshToken.refreshToken,
          });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      fetchMe: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const data = await graphqlRequest(
            AUTH_QUERIES.ME,
            undefined,
            { token: accessToken },
          );
          set({ user: data.me });
        } catch {
          // Token might be expired, try refresh
          const refreshed = await get().refreshAuth();
          if (refreshed) {
            const newToken = get().accessToken;
            const data = await graphqlRequest(
              AUTH_QUERIES.ME,
              undefined,
              { token: newToken },
            );
            set({ user: data.me });
          }
        }
      },

      setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'lms-auth',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // SSR fallback
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        viewMode: state.viewMode,
      }),
    },
  ),
);
