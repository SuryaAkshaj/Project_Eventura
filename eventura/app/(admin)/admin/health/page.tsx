"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin.api";

const statusConfig: Record<string, { icon: string; color: string; bg: string; border: string; label: string }> = {
  healthy: { icon: "check_circle", color: "text-[#2e7d32]", bg: "bg-[#f0f9f1]", border: "border-[#c6e5ca]", label: "Healthy" },
  warning: { icon: "warning", color: "text-tertiary", bg: "bg-tertiary-fixed/30", border: "border-tertiary-fixed", label: "Warning" },
  critical: { icon: "error", color: "text-error", bg: "bg-error-container/20", border: "border-error-container", label: "Critical" },
};

export default function HealthDashboardPage() {
  const [healthData, setHealthData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = () => {
    setIsLoading(true);
    adminApi.getHealth()
      .then(res => setHealthData(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchHealth(); }, []);

  const healthy = healthData.filter(m => m.status === "healthy").length;
  const warning = healthData.filter(m => m.status === "warning").length;
  const critical = healthData.filter(m => m.status === "critical").length;
  const totalRevenue = healthData.reduce((s, m) => s + (m.totalRevenue || 0), 0);
  const totalEvents = healthData.reduce((s, m) => s + (m.totalEvents || 0), 0);
  const totalUsers = healthData.reduce((s, m) => s + (m.totalUsers || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <header className="bg-surface flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
          <span>Admin Console</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Platform Health</span>
        </div>
        <button
          onClick={fetchHealth}
          className="font-label-sm text-label-sm border border-outline-variant text-on-surface-variant px-3 py-2 rounded-lg hover:bg-surface-variant transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
        <div className="max-w-7xl mx-auto space-y-xl">
          <section>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Multi-Tenant Health Dashboard</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Real-time platform metrics across all connected institutions.</p>
          </section>

          {/* Platform Stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-md">
            {[
              { label: "Healthy Institutions", value: isLoading ? "—" : String(healthy), icon: "check_circle", color: "text-[#2e7d32]", bg: "bg-[#f0f9f1]" },
              { label: "Warnings", value: isLoading ? "—" : String(warning), icon: "warning", color: "text-tertiary", bg: "bg-tertiary-fixed/30" },
              { label: "Critical", value: isLoading ? "—" : String(critical), icon: "error", color: "text-error", bg: "bg-error-container/20" },
              { label: "Total Institutions", value: isLoading ? "—" : String(healthData.length), icon: "account_balance", color: "text-primary", bg: "bg-primary-container/20" },
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

          {/* Platform Totals */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Active Events</p>
              <p className="font-headline-lg text-headline-lg text-primary">{isLoading ? "—" : totalEvents}</p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Across {healthData.length} institutions</p>
            </div>
            <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Users</p>
              <p className="font-headline-lg text-headline-lg text-tertiary">{isLoading ? "—" : totalUsers}</p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Approved role assignments</p>
            </div>
            <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Platform Revenue</p>
              <p className="font-headline-lg text-headline-lg text-[#2e7d32]">
                {isLoading ? "—" : `₹${totalRevenue.toLocaleString("en-IN")}`}
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">All-time paid payments</p>
            </div>
          </section>

          {/* Institution Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <p className="font-body-md text-on-surface-variant">Loading institution data…</p>
            </div>
          ) : healthData.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-3">account_balance</span>
              <p className="font-title-md">No approved institutions yet</p>
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {healthData.map((college: any) => {
                const cfg = statusConfig[college.status] ?? statusConfig.healthy;
                return (
                  <div key={college.id} className={`bg-surface border ${cfg.border} rounded-xl p-lg shadow-sm`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface">{college.name}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">{college.domain}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${cfg.bg} border ${cfg.border}`}>
                        <span className={`material-symbols-outlined text-[16px] ${cfg.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                        <span className={`font-label-sm text-label-sm ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Clubs</p>
                        <p className="font-title-lg text-on-surface">{college.totalClubs}</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Events</p>
                        <p className="font-title-lg text-on-surface">{college.totalEvents}</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active Events</p>
                        <p className="font-title-lg text-[#2e7d32]">{college.activeEvents}</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Revenue</p>
                        <p className="font-title-lg text-primary">₹{college.totalRevenue.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
