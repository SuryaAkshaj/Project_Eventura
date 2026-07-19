'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function PendingApprovalContent() {
  const router = useRouter();

  // All signups are now auto-approved — redirect to login immediately
  useEffect(() => {
    const timer = setTimeout(() => router.push('/login?approved=1'), 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      <header className="bg-surface border-b border-outline-variant px-margin-mobile md:px-margin-desktop h-16 flex items-center">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_activity</span>
          Eventura
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-margin-mobile py-xl">
        <div className="w-full max-w-lg text-center">
          <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-xl flex flex-col items-center gap-lg">
              {/* Success Illustration */}
              <div className="w-24 h-24 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-[#2e7d32]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>

              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">You&apos;re Approved!</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Your account has been set up successfully. Redirecting you to login...
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link
                  href="/login"
                  className="flex-1 bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors text-center shadow-sm"
                >
                  Go to Login
                </Link>
                <Link
                  href="/"
                  className="flex-1 border border-outline-variant text-on-surface font-label-sm text-label-sm py-3 rounded-lg hover:bg-surface-variant transition-colors text-center"
                >
                  Return Home
                </Link>
              </div>
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

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-container-low flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary text-[48px]">progress_activity</span></div>}>
      <PendingApprovalContent />
    </Suspense>
  );
}
