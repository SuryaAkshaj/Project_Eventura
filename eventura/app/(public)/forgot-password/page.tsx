'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';

type Phase = 'email' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('email');

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setInfo('If an account exists with that email, a reset OTP has been sent. Check your inbox and spam folder.');
      setPhase('reset');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!userId.trim()) { setError('User ID is required'); return; }
    setIsLoading(true);
    try {
      await authApi.resetPassword({ userId, otp, newPassword });
      router.push('/login?reset=1');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline';
  const labelClass = 'font-label-sm text-label-sm text-on-surface uppercase tracking-wide';

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
                <span className="material-symbols-outlined text-on-primary-container text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {phase === 'email' ? 'lock_reset' : 'key'}
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                {phase === 'email' ? 'Reset your password' : 'Enter your new password'}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {phase === 'email'
                  ? 'Enter your email and we\'ll send an OTP to the server console.'
                  : 'Enter the OTP from your terminal and choose a new password.'}
              </p>
            </div>

            <div className="p-lg flex flex-col gap-lg">
              {info && (
                <div className="bg-tertiary-fixed/20 border border-tertiary-fixed rounded-lg px-md py-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                  <p className="font-body-sm text-body-sm text-on-surface">{info}</p>
                </div>
              )}

              {phase === 'email' ? (
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-md">
                  <div className="flex flex-col gap-xs">
                    <label htmlFor="email" className={labelClass}>Institutional Email</label>
                    <input id="email" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
                  </div>
                  {error && <p className="font-body-sm text-body-sm text-error bg-error-container rounded-lg px-md py-sm">{error}</p>}
                  <button type="submit" disabled={isLoading} className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70">
                    {isLoading ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Sending…</> : <>Send OTP<span className="material-symbols-outlined text-[18px]">arrow_forward</span></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="flex flex-col gap-md">
                  <div className="flex flex-col gap-xs">
                    <label htmlFor="userId" className={labelClass}>Your User ID</label>
                    <input id="userId" type="text" placeholder="Paste your userId from signup response" value={userId} onChange={e => setUserId(e.target.value)} className={inputClass} />
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Find this in the signup API response or server logs.</p>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label htmlFor="otp" className={labelClass}>OTP from Console</label>
                    <input id="otp" type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className={inputClass + ' tracking-widest text-center'} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label htmlFor="newPassword" className={labelClass}>New Password</label>
                    <input id="newPassword" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label htmlFor="confirmNewPassword" className={labelClass}>Confirm New Password</label>
                    <input id="confirmNewPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
                  </div>
                  {error && <p className="font-body-sm text-body-sm text-error bg-error-container rounded-lg px-md py-sm">{error}</p>}
                  <button type="submit" disabled={isLoading} className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70">
                    {isLoading ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Resetting…</> : <>Reset Password<span className="material-symbols-outlined text-[18px]">arrow_forward</span></>}
                  </button>
                </form>
              )}

              <p className="text-center font-body-md text-body-md text-on-surface-variant">
                Remember your password?{' '}
                <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
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
