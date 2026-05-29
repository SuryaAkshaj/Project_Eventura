'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import { Suspense } from 'react';

interface ApprovalStatus {
  emailVerified: boolean;
  identityVerified: boolean;
  superAdminApproval: string;
  role: string | null;
}

function PendingApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') ?? '';

  const [status, setStatus] = useState<ApprovalStatus | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await authApi.getStatus(userId || undefined);
      const s: ApprovalStatus = res.data.data;
      setStatus(s);
      if (s.superAdminApproval === 'APPROVED') {
        router.push('/login?approved=1');
      }
    } catch {
      // Silent — keep showing the page
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const steps = status
    ? [
        {
          icon: status.emailVerified ? 'check_circle' : 'radio_button_unchecked',
          label: 'Account Created',
          status: status.emailVerified ? 'done' : 'active',
          color: status.emailVerified ? 'text-[#2e7d32]' : 'text-tertiary',
        },
        {
          icon: status.identityVerified ? 'check_circle' : 'pending',
          label: 'Admin Review',
          status: status.identityVerified ? 'done' : 'active',
          color: status.identityVerified ? 'text-[#2e7d32]' : 'text-tertiary',
        },
        {
          icon: status.superAdminApproval === 'APPROVED' ? 'check_circle' : 'radio_button_unchecked',
          label: 'Approval Granted',
          status: status.superAdminApproval === 'APPROVED' ? 'done' : 'pending',
          color: status.superAdminApproval === 'APPROVED' ? 'text-[#2e7d32]' : 'text-outline',
        },
        {
          icon: status.superAdminApproval === 'APPROVED' ? 'check_circle' : 'radio_button_unchecked',
          label: 'Onboarding Complete',
          status: status.superAdminApproval === 'APPROVED' ? 'done' : 'pending',
          color: status.superAdminApproval === 'APPROVED' ? 'text-[#2e7d32]' : 'text-outline',
        },
      ]
    : [
        { icon: 'check_circle', label: 'Account Created', status: 'done', color: 'text-[#2e7d32]' },
        { icon: 'pending', label: 'Admin Review', status: 'active', color: 'text-tertiary' },
        { icon: 'radio_button_unchecked', label: 'Approval Granted', status: 'pending', color: 'text-outline' },
        { icon: 'radio_button_unchecked', label: 'Onboarding Complete', status: 'pending', color: 'text-outline' },
      ];

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
              {/* Status Illustration */}
              <div className="w-24 h-24 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-on-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pending
                </span>
              </div>

              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">Account Under Review</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Your organizer account request is pending approval from your institution&apos;s super administrator.
                  You&apos;ll receive an email notification once your account is verified.
                </p>
              </div>

              {/* Timeline */}
              <div className="w-full bg-surface-container-low rounded-xl p-lg text-left space-y-4 border border-outline-variant">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[20px] ${step.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {step.icon}
                    </span>
                    <span className={`font-body-md text-body-md ${step.status === 'done' ? 'text-on-surface font-semibold' : step.status === 'active' ? 'text-tertiary font-semibold' : 'text-on-surface-variant'}`}>
                      {step.label}
                    </span>
                    {step.status === 'active' && (
                      <span className="font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded ml-auto">In Progress</span>
                    )}
                  </div>
                ))}
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Auto-refreshes every 30 seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link
                  href="/dashboard"
                  className="flex-1 bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors text-center shadow-sm"
                >
                  Browse as Attendee
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
