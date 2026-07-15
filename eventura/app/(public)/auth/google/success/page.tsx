'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';

function GoogleSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const mode = searchParams.get('mode') || 'COLLEGE';
    const role = searchParams.get('role') || 'ATTENDEE';

    if (!token) {
      router.push('/login?error=google_failed');
      return;
    }

    const finishLogin = async () => {
      try {
        // Get user profile with the token
        const res = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = res.data.data;

        // Get full active context by calling refresh
        // This ensures labels and orgType are in the store
        const refreshRes = await apiClient.post('/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);

        const activeContext = refreshRes?.data?.data?.activeContext || {
          role,
          collegeId: null,
          clubId: null,
          permissions: ['events:read'],
          orgType: mode === 'COLLEGE' ? 'UNIVERSITY' : 'COMMUNITY',
          accountMode: mode,
          labels: {
            team: mode === 'COLLEGE' ? 'Club' : 'Team',
            members: mode === 'COLLEGE' ? 'Students' : 'Members',
            teamAdmin: mode === 'COLLEGE' ? 'Club President' : 'Team Admin',
            guests: mode === 'COLLEGE' ? 'Students' : 'Guests',
          }
        };

        // Store in Zustand
        setAuth(user, token, activeContext);

        // Set auth cookie
        document.cookie = `eventura-auth=${token}; path=/; max-age=${15 * 60}; SameSite=Lax`;

        // Set mode cookie for middleware routing
        document.cookie = `eventura-mode=${mode}; path=/; max-age=${7 * 24 * 60 * 60}`;

        // Redirect based on role and mode
        if (role === 'SUPER_ADMIN') {
          router.push('/admin/dashboard');
        } else if (mode === 'OPEN') {
          router.push('/creator/dashboard');
        } else if (role === 'COLLEGE_ADMIN' || role === 'CLUB_PRESIDENT') {
          router.push('/org/dashboard');
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Google login completion failed:', err);
        router.push('/login?error=google_failed');
      }
    };

    finishLogin();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-body-md text-body-md text-on-surface font-medium">Completing sign in…</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Please wait</p>
      </div>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GoogleSuccessContent />
    </Suspense>
  );
}
