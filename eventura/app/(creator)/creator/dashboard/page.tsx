'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/events/my-open-events')
      .then(res => setEvents(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    clearAuth();
    document.cookie = 'eventura-auth=; path=/; max-age=0';
    document.cookie = 'eventura-mode=; path=/; max-age=0';
    router.push('/login');
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';
  const greeting = user ? `${user.firstName}` : 'Creator';

  const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date());
  const pastEvents = events.filter(e => new Date(e.startDate) <= new Date());

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1025 40%, #0d0d1a 100%)' }}>
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06]"
           style={{ background: 'rgba(10, 10, 15, 0.8)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/creator/dashboard" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[26px] text-purple-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
              local_activity
            </span>
            <span className="text-lg font-bold text-white tracking-tight">
              Eventura
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/creator/dashboard"
              className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-all font-medium"
            >
              Events
            </Link>
            <Link
              href="/events"
              className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-all font-medium"
            >
              Discover
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/creator/events/create"
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-600/20"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Event
            </Link>

            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-sm font-bold hover:bg-purple-600/30 transition-colors"
              title="Sign out"
            >
              {initials}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Section */}
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {greeting} 👋
          </h1>
          <p className="text-white/50 text-base">
            Manage your events and track registrations
          </p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            {
              label: 'Total Events',
              value: events.length.toString(),
              icon: 'calendar_today',
              color: 'from-purple-500/20 to-purple-600/5',
              border: 'border-purple-500/20',
              iconColor: 'text-purple-400',
            },
            {
              label: 'Upcoming',
              value: upcomingEvents.length.toString(),
              icon: 'event_upcoming',
              color: 'from-blue-500/20 to-blue-600/5',
              border: 'border-blue-500/20',
              iconColor: 'text-blue-400',
            },
            {
              label: 'Total Registrations',
              value: events.reduce((s, e) => s + (e._count?.registrations || 0), 0).toString(),
              icon: 'group',
              color: 'from-emerald-500/20 to-emerald-600/5',
              border: 'border-emerald-500/20',
              iconColor: 'text-emerald-400',
            },
          ].map(stat => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-5 backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                  <span className={`material-symbols-outlined text-[20px] ${stat.iconColor}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                    {stat.icon}
                  </span>
                </div>
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">{stat.label}</p>
              </div>
              <p className={`text-3xl font-bold ${stat.iconColor}`}>{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Events List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Your Events</h2>
            <Link
              href="/creator/events/create"
              className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Event
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-white/[0.03] border border-white/[0.06] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/[0.1] rounded-2xl bg-white/[0.01]">
              <span className="material-symbols-outlined text-[48px] text-white/20 mb-4 block"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                celebration
              </span>
              <h3 className="text-white/60 text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-white/30 text-sm mb-6">Create your first event and start sharing it with the world.</p>
              <Link
                href="/creator/events/create"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg shadow-purple-600/20"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => {
                const isUpcoming = new Date(event.startDate) > new Date();
                const regCount = event._count?.registrations || 0;
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-5 p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group cursor-pointer"
                  >
                    {/* Date Badge */}
                    <div className="w-14 h-14 rounded-xl bg-purple-600/10 border border-purple-500/20 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs text-purple-300/70 uppercase font-bold leading-none">
                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-purple-300 leading-tight">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base truncate group-hover:text-purple-300 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-white/40 text-xs">
                        {event.venue && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {event.venue}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-white/60 text-sm font-medium">{regCount}</p>
                        <p className="text-white/30 text-xs">Registered</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isUpcoming
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/[0.06] text-white/40 border border-white/[0.08]'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: isUpcoming ? '#34d399' : '#666' }} />
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
