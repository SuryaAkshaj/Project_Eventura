'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { certificatesApi } from '@/lib/api/certificates.api';

export default function VerifyCertificatePage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    certificatesApi.verify(params.id as string)
      .then(res => setResult(res.data.data))
      .catch(() => setResult({ valid: false, message: 'Certificate not found' }))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      {/* Eventura Branding */}
      <div className="mb-10 text-center">
        <a href="/" className="inline-block">
          <span className="font-black text-3xl tracking-tight" style={{ color: '#2E3192' }}>
            Event<span style={{ color: '#6366F1' }}>ura</span>
          </span>
        </a>
        <p className="text-sm text-on-surface-variant mt-1">Certificate Verification Portal</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full max-w-lg bg-surface border border-outline-variant rounded-2xl p-10 shadow-sm animate-pulse flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-surface-variant" />
          <div className="h-5 bg-surface-variant rounded w-48" />
          <div className="h-4 bg-surface-variant rounded w-64" />
          <div className="h-4 bg-surface-variant rounded w-56" />
        </div>
      )}

      {/* Result Card */}
      {!isLoading && result && (
        <div className="w-full max-w-lg">
          {result.valid ? (
            <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-md">
              {/* Valid Header */}
              <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)' }}>
                {/* Green checkmark circle */}
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm" style={{ background: '#e8f5e9', border: '2px solid #4caf50' }}>
                  <span className="material-symbols-outlined text-[44px]" style={{ color: '#2e7d32', fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }}>
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Verified by Eventura
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Certificate Valid</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">This certificate has been verified and is authentic.</p>
              </div>

              {/* Certificate Details */}
              <div className="px-8 py-6 space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Attendee Name</span>
                  <span className="font-headline-md text-headline-md text-on-surface">{result.certificate.attendeeName}</span>
                </div>

                <div className="w-full h-px bg-outline-variant/50" />

                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Event</span>
                  <span className="font-title-md text-title-md text-on-surface">{result.certificate.eventTitle}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Organised By</span>
                  <span className="font-body-md text-body-md text-on-surface">{result.certificate.organisingBody}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Event Date</span>
                    <span className="font-body-md text-body-md text-on-surface">
                      {new Date(result.certificate.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Issued On</span>
                    <span className="font-body-md text-body-md text-on-surface">
                      {new Date(result.certificate.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {result.certificate.blockchainHash && (
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Blockchain Hash</span>
                    <span className="font-mono text-[11px] text-on-surface-variant break-all bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/50">
                      {result.certificate.blockchainHash}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-surface-container-low border-t border-outline-variant/50 flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px]">
                  Certificate ID: {result.certificate.id?.slice(0, 8).toUpperCase()}
                </span>
                <a href="/events" className="font-label-sm text-label-sm text-primary hover:underline text-[12px]">
                  Discover Events →
                </a>
              </div>
            </div>
          ) : (
            /* Invalid Certificate */
            <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-md">
              <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%)' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm" style={{ background: '#fef2f2', border: '2px solid #f87171' }}>
                  <span className="material-symbols-outlined text-[44px]" style={{ color: '#dc2626', fontVariationSettings: "'FILL' 1" }}>cancel</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Certificate Not Valid</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {result.message || 'Certificate not found or invalid. It may have been revoked or the ID is incorrect.'}
                </p>
              </div>
              <div className="px-8 py-6 flex justify-center">
                <a href="/" className="font-label-sm text-label-sm bg-primary text-on-primary hover:bg-primary/90 transition-colors px-6 py-3 rounded-md shadow-sm">
                  Back to Eventura
                </a>
              </div>
            </div>
          )}

          <p className="text-center text-[12px] text-on-surface-variant mt-6">
            Powered by <span className="font-semibold" style={{ color: '#2E3192' }}>Eventura</span> · Institutional Certificate Registry
          </p>
        </div>
      )}
    </div>
  );
}
