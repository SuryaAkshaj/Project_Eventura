"use client";
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import { adminApi } from "@/lib/api/admin.api";
import { useAuthStore } from "@/lib/store/authStore";

export default function SuperAdminDashboardPage() {
  const { user } = useAuthStore();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    staleTime: 1000 * 60 * 1,
  });

  const stats = statsData?.data?.data;

  const statCards = [
    {
      icon: "account_balance",
      label: "Active Institutions",
      value: isLoading ? "—" : String(stats?.colleges?.total ?? 0),
      color: "text-primary",
      bg: "bg-primary-container/20",
    },
    {
      icon: "event",
      label: "Total Events",
      value: isLoading ? "—" : String(stats?.events?.total ?? 0),
      color: "text-[#2e7d32]",
      bg: "bg-[#f0f9f1]",
    },
    {
      icon: "confirmation_number",
      label: "Tickets Sold",
      value: isLoading ? "—" : String(stats?.registrations?.total ?? 0),
      color: "text-tertiary",
      bg: "bg-tertiary-fixed/30",
    },
    {
      icon: "pending",
      label: "Pending Approvals",
      value: isLoading ? "—" : String((stats?.colleges?.pending ?? 0) + (stats?.clubs?.pending ?? 0)),
      color: "text-error",
      bg: "bg-error-container/20",
    },
  ];

  const adminName = user ? `${user.firstName} ${user.lastName}` : "Super Admin";
  const pendingCount = (stats?.colleges?.pending ?? 0) + (stats?.clubs?.pending ?? 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <header className="bg-surface flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="font-label-sm text-label-sm text-on-surface-variant">
          <span className="text-primary font-bold">Super Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-md">
          <button
            id="admin-notifications-btn"
            onClick={() => alert('Notifications coming soon!')}
            className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
        <div className="max-w-7xl mx-auto space-y-xl">
          <section>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Welcome, {adminName}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Platform-wide overview for the Eventura network.</p>
          </section>

          {/* Pending Approvals Alert */}
          {!isLoading && pendingCount > 0 && (
            <div className="bg-error-container/20 border border-error-container rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-error font-body-md">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span>{pendingCount} item{pendingCount > 1 ? "s" : ""} pending approval</span>
              </div>
              <Link href="/admin/colleges" className="font-label-sm text-label-sm text-error hover:underline font-bold">
                Review now →
              </Link>
            </div>
          )}

          {/* Stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-md">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <span className={`material-symbols-outlined text-[22px] ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`font-headline-lg text-headline-lg ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </section>

          {/* Revenue & Users Row */}
          {!isLoading && stats && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Revenue</p>
                <p className="font-headline-lg text-headline-lg text-primary">
                  ₹{Number(stats?.revenue?.total || 0).toLocaleString("en-IN")}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Platform lifetime</p>
              </div>
              <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Users</p>
                <p className="font-headline-lg text-headline-lg text-[#2e7d32]">{stats?.users?.total ?? 0}</p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Registered platform users</p>
              </div>
              <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Published Events</p>
                <p className="font-headline-lg text-headline-lg text-tertiary">{stats?.events?.published ?? 0}</p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">of {stats?.events?.total ?? 0} total events</p>
              </div>
            </section>
          )}

          {/* Pending Approvals */}
          <section className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                Pending Approvals
                <span className="font-label-sm text-label-sm bg-error-container text-on-error-container px-2 py-0.5 rounded-full">
                  {isLoading ? "…" : pendingCount}
                </span>
              </h2>
              <Link href="/admin/colleges" className="font-label-sm text-label-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="p-md">
              {isLoading ? (
                <p className="text-on-surface-variant font-body-md text-center py-4">Loading…</p>
              ) : pendingCount === 0 ? (
                <div className="flex flex-col items-center py-8 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[40px] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="font-body-md">All caught up — no pending approvals</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {stats?.colleges?.pending > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">account_balance</span>
                      </div>
                      <div>
                        <p className="font-body-md text-on-surface font-semibold">{stats.colleges.pending} College{stats.colleges.pending > 1 ? "s" : ""}</p>
                        <p className="font-label-sm text-on-surface-variant">Awaiting approval</p>
                      </div>
                    </div>
                  )}
                  {stats?.clubs?.pending > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary">group</span>
                      </div>
                      <div>
                        <p className="font-body-md text-on-surface font-semibold">{stats.clubs.pending} Club{stats.clubs.pending > 1 ? "s" : ""}</p>
                        <p className="font-label-sm text-on-surface-variant">Awaiting approval</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
