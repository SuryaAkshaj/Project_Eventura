"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from "@/lib/api/events.api";
import { useAuthStore } from "@/lib/store/authStore";

const statusColors: Record<string, string> = {
  DRAFT: "bg-surface-variant text-on-surface-variant",
  PUBLISHED: "bg-secondary-container text-on-secondary-container",
  LIVE: "bg-[#f0f9f1] text-[#2e7d32] border border-[#c6e5ca]",
  COMPLETED: "bg-primary-container/20 text-primary",
  CANCELLED: "bg-error-container text-on-error-container",
};

export default function OrgDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: orgData, isLoading } = useQuery({
    queryKey: ['org-events'],
    queryFn: () => eventsApi.getOrgEvents({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    staleTime: 1000 * 60 * 2,
  });

  const orgEvents: any[] = orgData?.data?.data || [];

  // Compute stats from real data
  const totalEvents = orgEvents.length;
  const published = orgEvents.filter((e) => e.status === 'PUBLISHED').length;
  const drafts = orgEvents.filter((e) => e.status === 'DRAFT').length;
  const totalRegistrations = orgEvents.reduce((sum, e) => sum + (e._count?.registrations || 0), 0);

  const stats = [
    { icon: "event", label: "Total Events", value: isLoading ? "—" : totalEvents.toString(), color: "text-primary", bg: "bg-primary-container/20" },
    { icon: "check_circle", label: "Published", value: isLoading ? "—" : published.toString(), color: "text-[#2e7d32]", bg: "bg-[#f0f9f1]" },
    { icon: "draft", label: "Drafts", value: isLoading ? "—" : drafts.toString(), color: "text-tertiary", bg: "bg-tertiary-fixed/30" },
    { icon: "people", label: "Registrations", value: isLoading ? "—" : totalRegistrations.toString(), color: "text-secondary", bg: "bg-secondary-container/30" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-surface-container-low">
      {/* Top bar */}
      <header className="flex justify-between items-center w-full h-16 bg-surface text-primary border-b border-outline-variant shrink-0 -mx-margin-mobile md:-mx-margin-desktop px-margin-mobile md:px-margin-desktop mb-xl -mt-margin-mobile md:-mt-margin-desktop pt-margin-mobile md:pt-margin-desktop">
        <div className="flex items-center gap-4">
          <span className="font-headline-md text-headline-md font-bold text-primary">Eventura</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="hidden md:block font-body-md text-body-md text-secondary border border-outline-variant bg-white px-4 py-2 rounded hover:bg-surface-variant transition-colors"
          >
            Switch to Attendee
          </button>
          <Link href="/org/events/create" className="font-body-md text-body-md bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
            Create Event
          </Link>
          <button
            onClick={() => router.push('/profile')}
            className="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-xl">
        {/* Welcome */}
        <section>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Organizer Dashboard</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'Organizer'}! Here&apos;s your event management overview.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <span className={`material-symbols-outlined text-[22px] ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`font-headline-lg text-headline-lg ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Events Table */}
        <section className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h2 className="font-title-md text-title-md text-on-surface">My Events</h2>
            <Link href="/org/events/create" className="font-label-sm text-label-sm bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">add</span>New Event
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant uppercase">
                  <th className="py-3 px-6 font-semibold">Event</th>
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold">Registered</th>
                  <th className="py-3 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                {isLoading && (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    </tr>
                  ))
                )}
                {!isLoading && orgEvents.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="text-center py-12 px-6">
                        <p className="text-5xl mb-4">🎪</p>
                        <h3 className="font-title-md text-title-md text-on-surface mb-2">No events yet</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-6">Create your first event to get started</p>
                        <a
                          href="/org/events/create"
                          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-sm text-label-sm hover:bg-primary/90 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          Create Event
                        </a>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && orgEvents.slice(0, 5).map((event) => {
                  const formattedDate = event.startDate
                    ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'TBD';
                  const registrations = event._count?.registrations || 0;
                  return (
                    <tr key={event.id} className="hover:bg-surface-container transition-colors">
                      <td className="py-4 px-6 font-semibold">{event.title}</td>
                      <td className="py-4 px-6 text-on-surface-variant">{formattedDate}</td>
                      <td className="py-4 px-6">
                        <span className={`font-label-sm text-label-sm px-2 py-1 rounded-sm uppercase ${statusColors[event.status] || 'bg-surface-variant text-on-surface-variant'}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">{registrations}{event.maxCapacity ? `/${event.maxCapacity}` : ''}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Link href={`/org/events/${event.id}/manage`} className="text-primary hover:underline font-label-sm text-label-sm">Manage</Link>
                          <Link href={`/org/events/${event.id}/readiness`} className="text-secondary hover:underline font-label-sm text-label-sm">Readiness</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {[
            { href: "/org/payments", icon: "payments", title: "Payouts & Finance", desc: "View revenue, withdrawals and bank connections." },
            { href: "/org/events/create", icon: "add_circle", title: "Create New Event", desc: "Start building your next campus event." },
            { href: "/org/members", icon: "group", title: "Team Members", desc: "Manage your organiser team and permissions." },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary transition-all group flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center shrink-0 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-primary text-[22px]">{item.icon}</span>
              </div>
              <div>
                <h3 className="font-title-md text-title-md text-on-surface mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{item.desc}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
