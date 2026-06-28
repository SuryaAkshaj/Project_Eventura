'use client';
/**
 * AuthInitializer — mounts once in layout.tsx.
 *
 * On every page load it checks whether the Zustand auth store is empty
 * (which happens after a hard-refresh, because Zustand is in-memory only).
 * If the store is empty, it calls POST /auth/refresh (using the HTTP-only
 * refresh cookie) to silently restore the full session — including the
 * correct activeContext (role, collegeId, clubId).
 *
 * This fixes:
 *  - Blank profile page / missing user name after browser refresh
 *  - Club President (and other non-ATTENDEE roles) being treated as
 *    unauthenticated in the UI after a refresh
 */
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';

export default function AuthInitializer() {
  const { isAuthenticated, accessToken, setAuth, clearAuth } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // If Zustand already has a token in memory (same tab, no refresh), skip.
    if (isAuthenticated && accessToken) return;

    const restoreSession = async () => {
      try {
        // Call /auth/refresh using the HTTP-only cookie.
        // The response now includes both accessToken AND activeContext.
        const refreshRes = await apiClient.post('/auth/refresh');
        const { accessToken: newToken, activeContext } = refreshRes.data.data;

        if (!newToken || !activeContext) return;

        // Fetch the user profile with the fresh token.
        const meRes = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        const user = meRes.data.data;

        // Rebuild the full Zustand store.
        setAuth(user, newToken, activeContext);

        // Roll the middleware cookie forward so Next.js route guards pass.
        document.cookie = `eventura-auth=${newToken}; path=/; max-age=${15 * 60}; SameSite=Lax`;
      } catch {
        // Refresh token is missing / expired — clear everything so the
        // middleware can redirect to /login on the next protected navigation.
        clearAuth();
        document.cookie = 'eventura-auth=; path=/; max-age=0';
      }
    };

    restoreSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
