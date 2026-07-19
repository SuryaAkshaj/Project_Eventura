"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { registrationsApi } from "@/lib/api/registrations.api";

export default function ScanHistoryPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    registrationsApi
      .getEventAttendees(eventId)
      .then((res) => setAttendees(res.data.data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const checkedIn = attendees.filter((a) => a.status === "CHECKED_IN");
  const registered = attendees.filter((a) => a.status === "REGISTERED");
  const waitlisted = attendees.filter((a) => a.status === "WAITLISTED");

  const formatTime = (dateStr: string) =>
    dateStr
      ? new Date(dateStr).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "—";

  const statusColors: Record<string, string> = {
    CHECKED_IN: "bg-[#f0f9f1] text-[#2e7d32] border-[#c6e5ca]",
    REGISTERED: "bg-primary/10 text-primary border-primary/20",
    WAITLISTED: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200",
    CANCELLED: "bg-error-container/20 text-error border-error-container",
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-low">
      <header className="bg-surface flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
          <Link href={`/org/events/${eventId}/manage`} className="hover:text-primary">
            Live Hub
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Scan History</span>
        </div>
        <div className="flex items-center gap-md">
          <Link
            href={`/org/events/${eventId}/scanner`}
            className="font-label-sm text-label-sm bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            Open Scanner
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
        <div className="max-w-4xl mx-auto space-y-lg">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Scan History &amp; Attendees
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Real-time attendance record for this event.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-md">
            {[
              { label: "Checked In", value: isLoading ? "—" : checkedIn.length, color: "text-[#2e7d32]", bg: "bg-[#f0f9f1]" },
              { label: "Registered", value: isLoading ? "—" : registered.length, color: "text-primary", bg: "bg-primary/10" },
              { label: "Waitlisted", value: isLoading ? "—" : waitlisted.length, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} border border-outline-variant rounded-xl p-4 text-center shadow-sm`}
              >
                <p className={`font-headline-lg text-headline-lg ${stat.color}`}>{stat.value}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Attendee Table */}
          <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-title-md text-title-md text-on-surface">
                Attendee Log ({isLoading ? "…" : attendees.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="material-symbols-outlined text-[36px] text-primary animate-spin">
                    progress_activity
                  </span>
                </div>
              ) : attendees.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] mb-3">people</span>
                  <p className="font-title-md">No attendees yet</p>
                  <p className="font-body-md mt-1">Registrations will appear here once they are created.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant uppercase">
                      <th className="py-3 px-6 font-semibold">Attendee</th>
                      <th className="py-3 px-6 font-semibold">Email</th>
                      <th className="py-3 px-6 font-semibold">Reg ID</th>
                      <th className="py-3 px-6 font-semibold">Check-in Time</th>
                      <th className="py-3 px-6 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                    {attendees.map((a: any) => (
                      <tr key={a.id} className="hover:bg-surface-container transition-colors">
                        <td className="py-4 px-6 font-semibold">
                          {a.user?.firstName} {a.user?.lastName}
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant">{a.user?.email ?? "—"}</td>
                        <td className="py-4 px-6 font-mono text-primary text-sm">
                          {a.id?.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant">
                          {a.status === "CHECKED_IN" && a.updatedAt
                            ? formatTime(a.updatedAt)
                            : "—"}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`font-label-sm text-label-sm px-2 py-1 rounded-sm border uppercase ${
                              statusColors[a.status] ?? "bg-surface-variant text-on-surface-variant border-outline-variant"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
