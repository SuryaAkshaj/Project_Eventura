'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/store/authStore';
import RoleSwitcherModal from '@/components/auth/RoleSwitcherModal';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const verified = searchParams.get('verified');
  const approved = searchParams.get('approved');
  const reset = searchParams.get('reset');
  const googleError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authApi.login({ email, password });
      const { data } = res;

      if (res.status === 202 || data.requiresApproval) {
        const pendingUserId = data.data?.user?.id ?? '';
        router.push(`/signup/pending-approval?userId=${pendingUserId}`);
        return;
      }

      if (res.status === 206 || data.requiresContextSelection) {
        setAvailableRoles(data.data.roles);
        setPendingUser(data.data.user);
        setShowRoleSwitcher(true);
        return;
      }

      // 200 — successful
      const { user, accessToken, activeContext } = data.data;
      setAuth(user, accessToken, activeContext);

      // Set auth cookie for middleware (15 min expiry)
      document.cookie = `eventura-auth=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`;

      // Set mode cookie for routing
      const accountMode = activeContext?.accountMode || 'COLLEGE';
      document.cookie = `eventura-mode=${accountMode}; path=/; max-age=${7 * 24 * 60 * 60}`;

      // Redirect based on mode + role
      if (accountMode === 'OPEN') {
        router.push('/creator/dashboard');
      } else {
        const role = activeContext?.role;
        if (role === 'SUPER_ADMIN') router.push('/admin/dashboard');
        else if (role === 'COLLEGE_ADMIN' || role === 'CLUB_PRESIDENT' || role === 'EVENT_MANAGER') router.push('/org/dashboard');
        else router.push('/dashboard');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.response?.data?.error?.code;
      const userId = err?.response?.data?.error?.details?.userId ?? err?.response?.data?.userId;

      if (status === 403 && code === 'EMAIL_NOT_VERIFIED') {
        router.push(`/signup/verify-email?userId=${userId ?? ''}`);
        return;
      }

      setError(err?.response?.data?.error?.message || 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const successBanner = !bannerDismissed && (verified || approved || reset) ? (
    verified ? 'Email verified successfully! You can now sign in.'
    : approved ? 'Your account has been approved! Sign in to get started.'
    : 'Password reset successfully! Please sign in with your new password.'
  ) : null;

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      {/* Minimal nav */}
      <header className="bg-surface border-b border-outline-variant px-margin-mobile md:px-margin-desktop h-16 flex items-center">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_activity</span>
          Eventura
        </Link>
      </header>

      {/* Google error banner */}
      {googleError === 'google_failed' && (
        <div className="bg-error-container border-b border-error/20 px-margin-mobile py-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <p className="font-body-sm text-body-sm text-on-error-container">Google sign-in failed. Please try again or use email/password.</p>
        </div>
      )}

      {/* Success banner */}
      {successBanner && (
        <div className="bg-primary-container border-b border-primary/20 px-margin-mobile py-sm flex items-center justify-between gap-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="font-body-sm text-body-sm text-on-primary-container">{successBanner}</p>
          </div>
          <button onClick={() => setBannerDismissed(true)} className="text-on-primary-container/60 hover:text-on-primary-container transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <main className="flex-1 flex items-center justify-center px-margin-mobile py-xl">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Welcome back</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Sign in to your Eventura account.</p>
            </div>
            <div className="p-lg flex flex-col gap-lg">
              {/* Google Sign In */}
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <a
                  id="google-signin-btn"
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/auth/google`}
                  className="w-full flex items-center justify-center gap-3 border border-outline-variant rounded-lg py-3 font-body-md text-body-md text-on-surface hover:bg-surface-container-lowest transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </a>
              ) : (
                <button
                  id="google-signin-btn"
                  disabled
                  className="w-full flex items-center justify-center gap-3 border border-outline-variant rounded-lg py-3 font-body-md text-body-md text-on-surface opacity-50 cursor-not-allowed transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                  <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded-full">Setup required</span>
                </button>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-outline-variant"></div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">or sign in with email</span>
                <div className="flex-1 h-px bg-outline-variant"></div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                <div className="flex flex-col gap-xs">
                  <label htmlFor="email" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                    Institutional Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label htmlFor="password" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline"
                  />
                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="font-label-sm text-label-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {error && (
                  <p className="font-body-sm text-body-sm text-error bg-error-container rounded-lg px-md py-sm">{error}</p>
                )}

                <button
                  type="submit"
                  id="signin-submit-btn"
                  disabled={isLoading}
                  className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-center font-body-md text-body-md text-on-surface-variant">
                New to Eventura?{' '}
                <Link href="/signup" className="text-primary font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface border-t border-outline-variant py-md px-margin-mobile text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 Eventura. Institutional Grade Event Management.</p>
      </footer>

      {showRoleSwitcher && (
        <RoleSwitcherModal
          roles={availableRoles}
          user={pendingUser}
          onClose={() => setShowRoleSwitcher(false)}
        />
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-container-low flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary text-[48px]">progress_activity</span></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
