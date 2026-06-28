import axios from 'axios';
import { useAuthStore } from '@/lib/store/authStore';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1`,
  withCredentials: true, // Required for HTTP-only refresh token cookie
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token from Zustand store
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry && !err.config.url?.includes('/auth/refresh')) {
      err.config._retry = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken: string = data.data.accessToken;

        // Preserve existing user + context — only update the token
        const current = useAuthStore.getState();
        useAuthStore.getState().setAuth(current.user, newToken, {
          role: current.activeRole!,
          collegeId: current.collegeId,
          clubId: current.clubId,
        });

        // Roll the middleware cookie forward another 15 minutes
        if (typeof document !== 'undefined') {
          document.cookie = `eventura-auth=${newToken}; path=/; max-age=${15 * 60}; SameSite=Lax`;
        }

        err.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(err.config);
      } catch {
        useAuthStore.getState().clearAuth();
        if (typeof document !== 'undefined') {
          document.cookie = 'eventura-auth=; path=/; max-age=0';
        }
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default apiClient;
