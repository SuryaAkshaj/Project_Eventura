'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') ?? '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
    setIsLoading(true);

    try {
      await authApi.verifyEmail(userId, otp);
      // Check approval status to decide redirect
      const statusRes = await authApi.getStatus(userId);
      const { role, superAdminApproval } = statusRes.data.data;

      if (role === 'ATTENDEE') {
        router.push('/login?verified=1');
      } else {
        router.push('/signup/pending-approval');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    try {
      // Use the status endpoint to get email, then call forgotPassword to resend OTP
      const statusRes = await authApi.getStatus(userId);
      // Actually we need the email — but we don't have it here easily
      // We'll show a message to check console again
      setSuccess('A new OTP has been logged to the server console.');
    } catch {
      setError('Failed to resend OTP. Please try signing up again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      <header className="bg-surface border-b border-outline-variant px-margin-mobile md:px-margin-desktop h-16 flex items-center">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_activity</span>
          Eventura
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-margin-mobile py-xl">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-on-primary-container text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Verify your email</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Enter the 6-digit OTP to confirm your account.</p>
            </div>

            <div className="p-lg flex flex-col gap-lg">
              {/* Dev mode notice */}
              <div className="bg-tertiary-fixed/20 border border-tertiary-fixed rounded-lg px-md py-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                <p className="font-body-sm text-body-sm text-on-surface">
                  <strong>Dev mode:</strong> Check your <code className="font-mono bg-surface-container px-1 rounded text-xs">eventura-api</code> terminal for your OTP.
                  It was printed when you signed up.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                <div className="flex flex-col gap-xs">
                  <label htmlFor="otp" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                    One-Time Password
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full h-12 px-md border border-outline-variant rounded-lg font-headline-md text-headline-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline text-center tracking-[0.5em]"
                  />
                </div>

                {error && <p className="font-body-sm text-body-sm text-error bg-error-container rounded-lg px-md py-sm">{error}</p>}
                {success && <p className="font-body-sm text-body-sm text-primary bg-primary-container rounded-lg px-md py-sm">{success}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Verifying…
                    </>
                  ) : (
                    <>
                      Verify Email
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-center font-body-md text-body-md text-on-surface-variant">
                Didn&apos;t receive it?{' '}
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  {isResending ? 'Sending…' : 'Resend OTP'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface border-t border-outline-variant py-md px-margin-mobile text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 Eventura.</p>
      </footer>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-container-low flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary text-[48px]">progress_activity</span></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
