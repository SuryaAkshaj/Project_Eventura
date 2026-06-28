"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { certificatesApi } from "@/lib/api/certificates.api";
import { registrationsApi } from "@/lib/api/registrations.api";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [eligibleRegistrations, setEligibleRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [certsRes, regsRes] = await Promise.all([
          certificatesApi.getMyCertificates(),
          registrationsApi.getMyRegistrations(),
        ]);

        setCertificates(certsRes.data.data);

        // Eligible = CHECKED_IN registrations that don't have a certificate yet
        const certRegIds = new Set(certsRes.data.data.map((c: any) => c.registrationId));
        const eligible = regsRes.data.data.filter(
          (r: any) => r.status === 'CHECKED_IN' && !certRegIds.has(r.id)
        );
        setEligibleRegistrations(eligible);
      } catch (err) {
        console.error('Failed to fetch certificates', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerate = async (registrationId: string) => {
    setIsGenerating(registrationId);
    try {
      await certificatesApi.generate(registrationId);
      // Refresh certificates list
      const certsRes = await certificatesApi.getMyCertificates();
      setCertificates(certsRes.data.data);
      setEligibleRegistrations(prev => prev.filter(r => r.id !== registrationId));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to generate certificate');
    } finally {
      setIsGenerating(null);
    }
  };

  const totalEarned = certificates.length;

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      {/* Header */}
      <div className="mb-xl border-b border-outline-variant pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav aria-label="Breadcrumb" className="flex text-on-surface-variant font-label-sm text-label-sm mb-4">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/dashboard" className="hover:text-primary flex items-center">
                  <span className="material-symbols-outlined text-[16px] mr-1">home</span>Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                  <span className="text-primary font-bold">Certificates Vault</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="font-display-lg text-display-lg text-on-background mb-2">Your Verified Achievements</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Access, verify, and share your official co-curricular credentials backed by institutional blockchain verification.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/50 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          </div>
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Earned</div>
            <div className="font-headline-lg text-headline-lg text-primary leading-none mt-1">{totalEarned}</div>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-32 bg-surface-variant" />
              <div className="p-6">
                <div className="h-4 bg-surface-variant rounded w-24 mb-4" />
                <div className="h-6 bg-surface-variant rounded w-48 mb-6" />
                <div className="h-10 bg-surface-variant rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && certificates.length === 0 && eligibleRegistrations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-6">
            <span className="material-symbols-outlined text-[40px]">workspace_premium</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-background mb-2">No certificates yet</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-8">
            No certificates yet. Attend events and get checked in to earn certificates.
          </p>
          <Link href="/events" className="font-label-sm text-label-sm bg-primary text-on-primary hover:bg-primary/90 transition-colors px-6 py-3 rounded-md shadow-sm">
            Discover Verified Events
          </Link>
        </div>
      )}

      {/* Ready to Generate Section */}
      {!isLoading && eligibleRegistrations.length > 0 && (
        <section className="mb-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px] text-primary">add_task</span>
            <h2 className="font-title-lg text-title-lg text-on-background">Ready to Generate</h2>
            <span className="font-label-sm text-label-sm bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">{eligibleRegistrations.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter mb-xl">
            {eligibleRegistrations.map((registration) => (
              <div key={registration.id} className="bg-surface border border-primary/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-label-sm text-label-sm bg-surface-variant text-on-surface-variant px-2.5 py-1 rounded-sm uppercase tracking-wider text-[10px]">
                      Ready
                    </span>
                    <span className="font-label-sm text-label-sm bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-sm text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
                      Checked In
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-2">
                    {registration.event?.title || 'Event'}
                  </h3>
                  <div className="flex items-center gap-3 mt-auto pt-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden flex-shrink-0 border border-outline-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-secondary">account_balance</span>
                    </div>
                    <div>
                      <div className="font-label-sm text-label-sm text-on-background">
                        {registration.event?.college?.name || ''}
                      </div>
                      <div className="font-body-md text-[13px] text-on-surface-variant">
                        {registration.event?.startDate
                          ? new Date(registration.event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : ''}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-outline-variant/50 pt-4">
                    <button
                      id={`cert-generate-${registration.id}`}
                      onClick={() => handleGenerate(registration.id)}
                      disabled={isGenerating === registration.id}
                      className="w-full font-label-sm text-label-sm bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors rounded-md py-2.5 flex items-center justify-center gap-2"
                    >
                      {isGenerating === registration.id ? (
                        <>
                          <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                          Generate Certificate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certificate Grid */}
      {!isLoading && certificates.length > 0 && (
        <section>
          {eligibleRegistrations.length > 0 && (
            <h2 className="font-title-lg text-title-lg text-on-background mb-4">Your Certificates</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {certificates.map((cert) => {
              const event = cert.registration?.event;
              const eventTitle = event?.title || 'Event';
              const organiser = event?.club
                ? `${event.club.name}, ${event.college?.name}`
                : (event?.college?.name || '');
              const eventDate = event?.startDate
                ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : '';
              const issueDate = cert.issuedAt
                ? new Date(cert.issuedAt).toLocaleDateString('en-IN')
                : '';
              const shortId = cert.id?.slice(0, 8).toUpperCase();
              const downloadUrl = certificatesApi.getDownloadUrl(cert.id);

              return (
                <div key={cert.id} className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group relative">
                  <div className="h-32 bg-primary-container/20 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary to-transparent"></div>
                    <div className="w-16 h-16 bg-surface rounded-full shadow-sm flex items-center justify-center relative z-10 border border-outline-variant">
                      <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider">
                        Attendance
                      </div>
                      <div className="inline-flex items-center px-2 py-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm text-[10px] uppercase tracking-wider gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Blockchain Verified
                      </div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-background mb-2 group-hover:text-primary transition-colors">{eventTitle}</h3>
                    <div className="flex items-center gap-3 mt-auto pt-4 mb-6">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden flex-shrink-0 border border-outline-variant flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-secondary">account_balance</span>
                      </div>
                      <div>
                        <div className="font-label-sm text-label-sm text-on-background">{organiser}</div>
                        <div className="font-body-md text-[13px] text-on-surface-variant">Issued: {issueDate}</div>
                      </div>
                    </div>
                    <div className="font-body-md text-[11px] text-on-surface-variant mb-2 font-mono">ID: {shortId}</div>
                    <div className="border-t border-outline-variant/50 pt-4 flex gap-2">
                      <a
                        id={`cert-pdf-${cert.id}`}
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>PDF
                      </a>
                      <a
                        id={`cert-verify-${cert.id}`}
                        href={`/certificates/verify/${cert.id}`}
                        className="flex-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">verified</span>Verify
                      </a>
                      <button
                        id={`cert-share-${cert.id}`}
                        title="Copy verification link"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/certificates/verify/${cert.id}`);
                        }}
                        className="w-10 flex-shrink-0 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center hover:bg-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">share</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Earn More Card */}
            <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-xl overflow-hidden flex flex-col items-center justify-center p-8 text-center min-h-[360px]">
              <div className="w-16 h-16 rounded-full bg-surface border border-outline-variant flex items-center justify-center text-primary mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[32px]">add_task</span>
              </div>
              <h3 className="font-title-md text-title-md text-on-background mb-2">Earn More Credentials</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-xs">
                Register for verified events to continue building your co-curricular transcript.
              </p>
              <Link href="/events" className="font-label-sm text-label-sm bg-primary text-on-primary hover:bg-primary/90 transition-colors px-6 py-3 rounded-md shadow-sm">
                Discover Verified Events
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
