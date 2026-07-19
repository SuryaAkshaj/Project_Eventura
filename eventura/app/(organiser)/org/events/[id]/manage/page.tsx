"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { eventsApi } from "@/lib/api/events.api";
import { certificatesApi } from "@/lib/api/certificates.api";

export default function LiveManagementHubPage() {
  const [event, setEvent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [subEvents, setSubEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, statsRes] = await Promise.all([
          eventsApi.getEventById(params.id as string),
          eventsApi.getEventStats(params.id as string),
        ]);
        setEvent(eventRes.data.data);
        setStats(statsRes.data.data);
        // Fetch sub-events if this is a FEST
        const ev = eventRes.data.data;
        if (ev?.eventType === 'FEST') {
          try {
            const subRes = await eventsApi.getSubEvents(params.id as string);
            setSubEvents(subRes.data.data);
          } catch {}
        }
      } catch (err) {
        console.error('Failed to fetch event data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Poll stats every 30 seconds for live updates
    const interval = setInterval(async () => {
      try {
        const statsRes = await eventsApi.getEventStats(params.id as string);
        setStats(statsRes.data.data);
      } catch (err) {
        console.error('Stats poll failed', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [params.id]);

  const handleBulkGenerate = async () => {
    setIsBulkGenerating(true);
    try {
      const response = await certificatesApi.bulkGenerate(params.id as string);
      setBulkResult(response.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to generate certificates');
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const totalRegistrations = stats?.totalRegistrations ?? 0;
  const checkedIn = stats?.checkedIn ?? 0;
  const waitlisted = stats?.waitlisted ?? 0;
  const revenue = stats?.revenue ? `₹${stats.revenue}` : '₹0';
  const checkInRate = stats?.checkInRate ? `${stats.checkInRate.toFixed(1)}%` : '0%';
  const capacity = event?.maxCapacity ?? 0;
  const checkInPct = capacity > 0 ? Math.round((checkedIn / capacity) * 100) : 0;

  const formattedDate = event?.startDate
    ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'TBD';

  const statusLabel = event?.status ?? 'LIVE';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-low">
      {/* Top Bar */}
      <header className="bg-surface flex justify-between items-center px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
          <Link href="/org/dashboard" className="hover:text-primary">My Events</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">{isLoading ? '...' : (event?.title || 'Event')}</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Live Hub</span>
        </div>
        <div className="flex items-center gap-md">
          <Link href={`/org/events/${params.id}/scanner`} className="font-label-sm text-label-sm bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            Open Scanner
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-desktop">
        <div className="max-w-7xl mx-auto space-y-xl">
          {/* Event Header */}
          <section className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-label-sm text-label-sm bg-[#f0f9f1] text-[#2e7d32] border border-[#c6e5ca] px-2 py-1 rounded-sm uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] inline-block animate-pulse"></span>
                  {statusLabel}
                </span>
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                </div>
              ) : (
                <>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">{event?.title || 'Event'}</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">{formattedDate} · Real-time event management dashboard</p>
                </>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href={`/org/events/${params.id}/attendees`}
                className="font-label-sm text-label-sm border border-outline-variant text-on-surface px-4 py-2 rounded-lg hover:bg-surface-variant flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">group</span>
                View Attendees
              </Link>
              <button
                id={`bulk-generate-${params.id}`}
                onClick={handleBulkGenerate}
                disabled={isBulkGenerating}
                className="font-label-sm text-label-sm border border-outline-variant text-on-surface px-4 py-2 rounded-lg hover:bg-surface-variant flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isBulkGenerating ? (
                  <><span className="w-4 h-4 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin mr-1" />Generating...</>
                ) : (
                  <>Generate All Certificates</>
                )}
              </button>
              {bulkResult && (
                <span className="font-label-sm text-label-sm text-emerald-600 flex items-center gap-1 py-2">
                  Generated {bulkResult.succeeded} certificates
                  {bulkResult.failed > 0 && ` (${bulkResult.failed} failed)`}
                </span>
              )}
            </div>
          </section>

          {/* Live Stats Grid */}
          {isLoading ? (
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-md">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 mb-3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
              ))}
            </section>
          ) : (
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-md">
              {[
                { label: "Total Registered", value: totalRegistrations.toString(), icon: "confirmation_number", color: "text-primary", bg: "bg-primary-container/20" },
                { label: "Checked In", value: checkedIn.toString(), icon: "how_to_reg", color: "text-[#2e7d32]", bg: "bg-[#f0f9f1]" },
                { label: "Waitlisted", value: waitlisted.toString(), icon: "pending", color: "text-tertiary", bg: "bg-tertiary-fixed/30" },
                { label: "Check-in Rate", value: checkInRate, icon: "trending_up", color: "text-secondary", bg: "bg-secondary-container/30" },
              ].map((stat) => (
                <div key={stat.label} className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <span className={`material-symbols-outlined text-[22px] ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`font-headline-lg text-headline-lg ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </section>
          )}

          {/* Revenue & Progress */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {/* Revenue card */}
              <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#f0f9f1] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#2e7d32] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Revenue</p>
                  <p className="font-headline-lg text-headline-lg text-[#2e7d32]">{revenue}</p>
                </div>
              </div>

              {/* Attendance Progress */}
              <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-title-md text-title-md text-on-surface">Attendance Progress</h2>
                  <span className="font-headline-md text-headline-md text-primary">{checkInPct}%</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-4 overflow-hidden">
                  <div className="bg-primary h-4 rounded-full transition-all duration-1000" style={{ width: `${checkInPct}%` }}></div>
                </div>
                <div className="flex justify-between mt-2 font-label-sm text-label-sm text-on-surface-variant">
                  <span>{checkedIn} checked in</span>
                  <span>{capacity} capacity</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {[
              { href: `/org/events/${params.id}/scanner`, icon: "qr_code_scanner", label: "QR Scanner", desc: "Scan attendee tickets" },
              { href: `/org/events/${params.id}/scan-history`, icon: "history", label: "Scan History", desc: "View all scan records" },
              { href: `/org/events/${params.id}/readiness`, icon: "checklist", label: "Checklist", desc: "Pre-publish checks" },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="bg-surface border border-outline-variant rounded-xl p-4 flex items-center gap-4 hover:border-primary hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center group-hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-primary">{action.icon}</span>
                </div>
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors">{action.label}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{action.desc}</p>
                </div>
              </Link>
            ))}
          </section>

          {/* Sub-events management — only for FEST */}
          {!isLoading && event?.eventType === 'FEST' && (
            <section className="bg-surface border border-outline-variant rounded-xl p-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-md text-headline-md text-on-surface">Sub-Events</h2>
                <Link
                  href={`/org/events/create?parentId=${params.id}&parentTitle=${encodeURIComponent(event.title)}`}
                  className="font-label-sm text-label-sm bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Competition / Workshop
                </Link>
              </div>
              {subEvents.length === 0 ? (
                <div className="bg-surface-container-low rounded-xl border border-dashed border-outline-variant p-6 text-center">
                  <p className="text-on-surface-variant text-sm">No sub-events yet. Add competitions, workshops or seminars to this fest.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {subEvents.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                      <div className="flex items-center gap-2">
                        <span>{sub.eventType === 'COMPETITION' ? '🏆' : sub.eventType === 'WORKSHOP' ? '🛠️' : '🎤'}</span>
                        <p className="font-label-sm text-label-sm font-medium text-on-surface">{sub.title}</p>
                        <span className="text-xs text-on-surface-variant">({sub._count?.registrations || 0} registered)</span>
                      </div>
                      <Link
                        href={`/org/events/${sub.id}/manage`}
                        className="text-xs text-primary hover:underline font-label-sm"
                      >
                        Manage →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
