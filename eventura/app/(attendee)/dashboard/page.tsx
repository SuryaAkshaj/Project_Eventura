"use client";
import Link from "next/link";
import { mockTickets } from "@/lib/mockData";
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from "@/lib/api/events.api";
import { useAuthStore } from "@/lib/store/authStore";

export default function AttendeeDashboardPage() {
  const { user } = useAuthStore();

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
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Campus Credits</p>
              <p className="font-headline-lg text-headline-lg text-tertiary">14</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
                    <div className="h-32 bg-surface-variant relative">
                      <img src={ticket.imageUrl} alt={ticket.eventTitle} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-primary font-label-sm text-label-sm flex items-center gap-1 shadow-sm border border-outline-variant/20">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {ticket.date}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-auto">
                        <span className="inline-block bg-slate-100 text-slate-700 font-label-sm text-label-sm px-2 py-1 rounded mb-2">{ticket.category}</span>
                        <h3 className="font-title-md text-title-md text-on-surface mb-1 leading-tight">{ticket.eventTitle}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          {ticket.venue}
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-outline-variant/50 flex justify-between items-center">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Ticket #{ticket.ticketNumber}</span>
                        <button id={`view-qr-${ticket.id}`} className="bg-primary text-white font-label-sm text-label-sm px-4 py-2 rounded hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">qr_code</span>
                          View QR
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

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
                          <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-2">{event.college?.name}</p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="font-label-sm text-label-sm text-tertiary">{formattedDate} • {price}</span>
                            <button className="text-primary hover:bg-surface-variant p-1 rounded transition-colors">
                              <span className="material-symbols-outlined">bookmark_border</span>
                            </button>
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
            {/* Co-Curricular Progress */}
            <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-title-md text-title-md text-on-surface border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                Co-Curricular Progress
              </h2>
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Leadership Certificate</span>
                  <span className="font-label-sm text-label-sm text-primary font-bold">75%</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-2">
                  Complete 1 more required event to earn your certificate.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Required Events Remaining:</h3>
                <div className="border border-outline-variant rounded-lg p-3 flex items-center justify-between hover:bg-surface-variant transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">group</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface">Conflict Resolution Seminar</span>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </div>
              </div>
            </section>

            {/* Deadlines */}
            <section className="bg-surface-container border border-outline-variant rounded-xl p-6">
              <h2 className="font-title-md text-title-md text-on-surface border-b border-outline-variant pb-2 mb-4">Important Deadlines</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-error mt-2 shrink-0"></div>
                  <div>
                    <p className="font-body-md text-body-md text-on-surface font-bold">Spring Gala Registration Closes</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Tomorrow, 11:59 PM</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-tertiary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-body-md text-body-md text-on-surface font-bold">Submit Capstone Proposal</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Oct 25, 5:00 PM</p>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
