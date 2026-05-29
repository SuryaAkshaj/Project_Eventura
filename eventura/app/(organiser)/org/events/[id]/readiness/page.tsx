"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { eventsApi } from "@/lib/api/events.api";

export default function ReadinessChecklistPage() {
  const [readiness, setReadiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const response = await eventsApi.getReadiness(params.id as string);
        setReadiness(response.data.data);
      } catch (err) {
        setError('Failed to load readiness data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReadiness();
  }, [params.id]);

  const handlePublish = async () => {
    if (!readiness?.canPublish) return;
    setIsPublishing(true);
    try {
      await eventsApi.publishEvent(params.id as string);
      router.push(`/org/events/${params.id}/manage`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to publish event');
    } finally {
      setIsPublishing(false);
    }
  };

  const scoreColor = readiness?.score >= 80
    ? 'text-[#2e7d32]'
    : readiness?.score >= 60
    ? 'text-tertiary'
    : 'text-error';

  const scoreBarColor = readiness?.score >= 80
    ? 'bg-[#2e7d32]'
    : readiness?.score >= 60
    ? 'bg-tertiary'
    : 'bg-error';

  // Map backend checks object to list items
  const checkItems = readiness?.checks
    ? [
        { key: 'title', label: 'Event Title', desc: 'Event has a title set.' },
        { key: 'description', label: 'Description', desc: 'Event has a description.' },
        { key: 'banner', label: 'Banner Image', desc: 'Event has a banner image uploaded.' },
        { key: 'dates', label: 'Dates Set', desc: 'Start and end dates are configured.' },
        { key: 'location', label: 'Location / Venue', desc: 'Venue or online link is set.' },
        { key: 'capacity', label: 'Capacity', desc: 'Max capacity is defined.' },
        { key: 'payment', label: 'Payment / Pricing', desc: 'Ticket pricing is configured.' },
        { key: 'sessions', label: 'Sessions', desc: 'At least one session is added.' },
      ].map((item) => ({
        ...item,
        status: readiness.checks[item.key] ? 'pass' : 'fail',
      }))
    : [];

  const passCount = checkItems.filter((c) => c.status === 'pass').length;

  if (isLoading) {
    return (
      <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
        <header className="bg-surface w-full px-margin-mobile md:px-margin-desktop h-16 flex items-center border-b border-outline-variant shrink-0">
          <div className="flex items-center gap-md">
            <span className="font-headline-md text-headline-md font-bold text-primary">Eventura</span>
            <span className="text-on-surface-variant text-body-md font-body-md hidden sm:inline-block pl-4 border-l border-outline-variant">Event Creator</span>
          </div>
          <div className="ml-auto">
            <Link href="/org/dashboard" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px]">close</span>
              <span className="font-label-sm text-label-sm uppercase hidden sm:inline-block">Exit Builder</span>
            </Link>
          </div>
        </header>
        <main className="flex-grow flex flex-col items-center py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low">
          <div className="w-full max-w-3xl animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
      <header className="bg-surface w-full px-margin-mobile md:px-margin-desktop h-16 flex items-center border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-md">
          <span className="font-headline-md text-headline-md font-bold text-primary">Eventura</span>
          <span className="text-on-surface-variant text-body-md font-body-md hidden sm:inline-block pl-4 border-l border-outline-variant">Event Creator</span>
        </div>
        <div className="ml-auto">
          <Link href="/org/dashboard" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[20px]">close</span>
            <span className="font-label-sm text-label-sm uppercase hidden sm:inline-block">Exit Builder</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low">
        {/* Stepper — all 5 steps done */}
        <div className="w-full max-w-4xl mb-xl">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-primary z-0"></div>
            {["Basic Info", "Logistics", "Tickets & Pricing", "Review", "Checklist"].map((label) => (
              <div key={label} className="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <span className="font-label-sm text-label-sm text-primary uppercase absolute top-10 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-3xl bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Pre-Publish Checklist</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Review the final system checks before your event can go live.</p>
              </div>
              {readiness && (
                <div className="text-right">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Readiness Score</p>
                  <p className={`font-headline-lg text-headline-lg ${scoreColor}`}>{readiness.score}%</p>
                  {checkItems.length > 0 && (
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{passCount}/{checkItems.length} checks</p>
                  )}
                </div>
              )}
            </div>

            {/* Score progress bar */}
            {readiness && (
              <div className="mt-4">
                <div className="w-full bg-surface-variant rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${scoreBarColor}`}
                    style={{ width: `${readiness.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-lg flex flex-col gap-md bg-surface">
            {error && (
              <div className="flex items-start gap-md p-md rounded-lg border border-error-container bg-[#fff5f5]">
                <span className="material-symbols-outlined text-[24px] text-error mt-1 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <p className="font-body-md text-body-md text-error">{error}</p>
              </div>
            )}

            {checkItems.length === 0 && !error && (
              <p className="font-body-md text-body-md text-on-surface-variant text-center py-4">No readiness checks available.</p>
            )}

            {checkItems.map((check, i) => (
              <div key={i} className={`flex items-start gap-md p-md rounded-lg border ${check.status === "pass" ? "border-[#c6e5ca] bg-[#f0f9f1]" : "border-error-container bg-[#fff5f5]"}`}>
                <span
                  className={`material-symbols-outlined text-[24px] mt-1 shrink-0 ${check.status === "pass" ? "text-[#2e7d32]" : "text-error"}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {check.status === "pass" ? "check_circle" : "error"}
                </span>
                <div>
                  <span className="font-title-md text-title-md text-on-surface">{check.label}</span>
                  <p className={`font-body-md text-body-md mt-1 ${check.status === "fail" ? "text-error" : "text-on-surface-variant"}`}>{check.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-lg border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-md">
            <Link
              href={`/org/events/${params.id}/edit`}
              className="w-full sm:w-auto h-10 px-lg bg-surface border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase rounded-lg hover:bg-surface-variant transition-colors text-center flex items-center justify-center"
            >
              Edit Event
            </Link>
            <button
              id="publish-event-btn"
              onClick={handlePublish}
              disabled={!readiness?.canPublish || isPublishing}
              className="w-full sm:w-auto h-10 px-lg bg-primary text-on-primary font-label-sm text-label-sm uppercase rounded-lg transition-colors flex items-center justify-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? 'Publishing...' : 'Publish Event'}
              <span className="material-symbols-outlined text-[18px]">publish</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-surface border-t border-outline-variant py-md px-margin-mobile text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 Eventura.</p>
      </footer>
    </div>
  );
}
