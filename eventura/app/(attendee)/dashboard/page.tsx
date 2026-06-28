"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from "@/lib/api/events.api";
import { registrationsApi } from "@/lib/api/registrations.api";
import { bookmarksApi } from "@/lib/api/bookmarks.api";
import { useAuthStore } from "@/lib/store/authStore";
import DeadlineBadge from "@/components/ui/DeadlineBadge";

export default function AttendeeDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  const { data: upcomingData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['events-upcoming'],
    queryFn: () => eventsApi.getEvents({
      limit: 3,
      sortBy: 'startDate',
      sortOrder: 'asc',
      startDateFrom: new Date().toISOString(),
    }),
    staleTime: 1000 * 60 * 2,
  });

  const upcomingEvents: any[] = upcomingData?.data?.data || [];

  useEffect(() => {
    registrationsApi.getMyRegistrations()
      .then(res => {
        const active = res.data.data.filter(
          (r: any) => r.status === 'REGISTERED' || r.status === 'CHECKED_IN'
        ).slice(0, 3);
        setActiveTickets(active);
      })
      .catch(console.error);
  }, []);

  // Load bookmarks when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    bookmarksApi.getMyBookmarks()
      .then(res => setBookmarks(res.data.data.slice(0, 3)))
      .catch(() => {});
  }, [isAuthenticated]);

  const handleBookmarkRemove = async (eventId: string) => {
    try {
      await bookmarksApi.removeBookmark(eventId);
      setBookmarks(prev => prev.filter(b => b.eventId !== eventId));
    } catch {}
  };

  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-surface-container-low">
      <div className="max-w-7xl mx-auto space-y-xl">
        {/* Welcome Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Hello, {user?.firstName || 'there'}!</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Here&apos;s what&apos;s happening on campus this week.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white border border-outline-variant rounded-xl p-4 min-w-[160px] shadow-sm">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Upcoming Events</p>
              <p className="font-headline-lg text-headline-lg text-primary">{upcomingEvents.length}</p>
            </div>
            <div className="bg-white border border-outline-variant rounded-xl p-4 min-w-[160px] shadow-sm">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active Tickets</p>
              <p className="font-headline-lg text-headline-lg text-tertiary">{activeTickets.length}</p>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-xl">
            {/* My Active Tickets */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="font-title-md text-title-md text-on-surface border-b border-outline-variant pb-2 flex-1">
                  My Active Tickets
                </h2>
              </div>
              {activeTickets.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant bg-white border border-outline-variant rounded-xl">
                  <span className="material-symbols-outlined text-[48px] block mb-2 text-outline">confirmation_number</span>
                  <p className="font-body-md text-body-md">No active tickets yet.</p>
                  <Link href="/events" className="font-label-sm text-label-sm text-primary hover:underline mt-2 inline-block">Browse events →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTickets.map((registration) => {
                    const event = registration.event;
                    const formattedDate = event?.startDate
                      ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'TBD';
                    return (
                      <div key={registration.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
                        <div className="h-32 bg-surface-variant relative">
                          {event?.bannerUrl ? (
                            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container/40 to-secondary-container/40">
                              <span className="material-symbols-outlined text-[48px] text-primary/30">event</span>
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-primary font-label-sm text-label-sm flex items-center gap-1 shadow-sm border border-outline-variant/20">
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            {formattedDate}
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="mb-auto">
                            <span className="inline-block bg-slate-100 text-slate-700 font-label-sm text-label-sm px-2 py-1 rounded mb-2">
                              {event?.category || 'Event'}
                            </span>
                            <h3 className="font-title-md text-title-md text-on-surface mb-1 leading-tight">{event?.title}</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined text-[18px]">location_on</span>
                              {event?.venue || event?.onlineLink || 'Online'}
                            </p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-outline-variant/50 flex justify-between items-center">
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              #{registration.id?.slice(0, 8).toUpperCase()}
                            </span>
                            <button
                              id={`view-qr-${registration.id}`}
                              onClick={() => router.push(`/my-tickets/${registration.id}`)}
                              className="bg-primary text-white font-label-sm text-label-sm px-4 py-2 rounded hover:bg-primary/90 transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">qr_code</span>
                              View QR
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Saved Events (Bookmarks) */}
            {bookmarks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
                  <h2 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                    Saved Events
                  </h2>
                  <Link href="/events" className="font-label-sm text-label-sm text-primary hover:underline">View all →</Link>
                </div>
                <div className="space-y-2">
                  {bookmarks.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group">
                      <Link href={`/events/${b.eventId}`} className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{b.event?.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {b.event?.college?.name}
                          {b.event?.startDate && ` · ${new Date(b.event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <DeadlineBadge
                          startDate={b.event?.startDate}
                          registrationDeadline={b.event?.registrationDeadline}
                        />
                        <button
                          onClick={() => handleBookmarkRemove(b.eventId)}
                          className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove bookmark"
                        >
                          <span className="material-symbols-outlined text-[18px]">bookmark_remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recommended / Upcoming */}
            <section>
              <div className="flex justify-between items-end mb-6 border-b border-outline-variant pb-2">
                <h2 className="font-title-md text-title-md text-on-surface">Upcoming Events</h2>
                <Link href="/events" className="font-label-sm text-label-sm text-primary hover:underline">View All</Link>
              </div>

              {isLoadingEvents && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white border border-outline-variant rounded-xl p-4 flex gap-4 animate-pulse">
                      <div className="w-24 h-24 rounded-lg bg-gray-200 shrink-0" />
                      <div className="flex-1 flex flex-col gap-2 justify-center">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoadingEvents && upcomingEvents.length === 0 && (
                <div className="text-center py-lg text-on-surface-variant">
                  <p className="font-body-md text-body-md">No upcoming events at this time.</p>
                  <Link href="/events" className="font-label-sm text-label-sm text-primary hover:underline mt-2 inline-block">Browse all events</Link>
                </div>
              )}

              {!isLoadingEvents && upcomingEvents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingEvents.map((event) => {
                    const formattedDate = event.startDate
                      ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'TBD';
                    const price = event.isFree ? 'Free' : `₹${event.ticketPrice}`;
                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="bg-white border border-outline-variant rounded-xl p-4 flex gap-4 hover:shadow-[0_4px_20px_rgba(46,49,146,0.08)] transition-shadow"
                      >
                        <div className="w-24 h-24 rounded-lg bg-surface-variant shrink-0 overflow-hidden flex items-center justify-center">
                          {event.bannerUrl ? (
                            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-[32px] text-primary/40">event</span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="font-title-md text-title-md text-on-surface mb-1 leading-tight">{event.title}</h4>
                          <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-1">{event.college?.name}</p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="font-label-sm text-label-sm text-tertiary">{formattedDate} • {price}</span>
                            <DeadlineBadge
                              startDate={event.startDate}
                              registrationDeadline={event.registrationDeadline}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-xl">
            {/* Recent Activity */}
            <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-title-md text-title-md text-on-surface border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                Recent Activity
              </h2>
              {activeTickets.length === 0 ? (
                <p className="text-on-surface-variant font-body-md text-body-md text-center py-4">
                  Register for events to track your activity
                </p>
              ) : (
                <div className="space-y-3">
                  {activeTickets.map(t => (
                    <div key={t.id} className="flex items-center justify-between">
                      <p className="font-body-md text-body-md text-on-surface truncate max-w-[65%]">{t.event?.title}</p>
                      <span className={`font-label-sm text-label-sm text-xs px-2 py-0.5 rounded-full ${
                        t.status === 'CHECKED_IN'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {t.status === 'CHECKED_IN' ? 'Attended' : 'Registered'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Events (right column mini-list) */}
            <section className="bg-surface-container border border-outline-variant rounded-xl p-6">
              <h2 className="font-title-md text-title-md text-on-surface border-b border-outline-variant pb-2 mb-4">Upcoming Events</h2>
              {upcomingEvents.length === 0 ? (
                <p className="font-body-md text-body-md text-on-surface-variant text-center py-4">No upcoming events</p>
              ) : (
                <ul className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event: any) => (
                    <li key={event.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body-md text-body-md text-on-surface font-bold truncate">{event.title}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <DeadlineBadge
                          startDate={event.startDate}
                          registrationDeadline={event.registrationDeadline}
                          className="mt-1"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
