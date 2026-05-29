import type { Metadata } from "next";
import Link from "next/link";
import { mockScanRecords } from "@/lib/mockData";

export const metadata: Metadata = { title: "Scan History & Audit Log" };

interface PageProps { params: { id: string } }

const statusColors: Record<string, string> = {
  success: "bg-[#f0f9f1] text-[#2e7d32] border-[#c6e5ca]",
  duplicate: "bg-tertiary-fixed/30 text-on-tertiary-fixed border-tertiary-fixed",
  invalid: "bg-error-container/30 text-on-error-container border-error-container",
};

export default function ScanHistoryPage({ params }: PageProps) {
  const totals = {
    success: mockScanRecords.filter((r) => r.status === "success").length,
    duplicate: mockScanRecords.filter((r) => r.status === "duplicate").length,
    invalid: mockScanRecords.filter((r) => r.status === "invalid").length,
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-low">
      <header className="bg-surface flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
          <Link href={`/org/events/${params.id}/manage`} className="hover:text-primary">Live Hub</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Scan History</span>
        </div>
        <div className="flex items-center gap-md">
          <Link href={`/org/events/${params.id}/scanner`} className="font-label-sm text-label-sm bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            Open Scanner
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
        <div className="max-w-4xl mx-auto space-y-lg">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Scan History & Audit Log</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Complete record of all ticket scan events.</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-md">
            {[
              { label: "Successful", value: totals.success, color: "text-[#2e7d32]", bg: "bg-[#f0f9f1]" },
              { label: "Duplicates", value: totals.duplicate, color: "text-tertiary", bg: "bg-tertiary-fixed/30" },
              { label: "Invalid", value: totals.invalid, color: "text-error", bg: "bg-error-container/20" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} border border-outline-variant rounded-xl p-4 text-center shadow-sm`}>
                <p className={`font-headline-lg text-headline-lg ${stat.color}`}>{stat.value}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Audit Table */}
          <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-title-md text-title-md text-on-surface">Scan Log</h2>
              <button className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">download</span>Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant uppercase">
                    <th className="py-3 px-6 font-semibold">Ticket ID</th>
                    <th className="py-3 px-6 font-semibold">Attendee</th>
                    <th className="py-3 px-6 font-semibold">Time</th>
                    <th className="py-3 px-6 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                  {mockScanRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-surface-container transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-primary">{record.ticketId}</td>
                      <td className="py-4 px-6">{record.attendee}</td>
                      <td className="py-4 px-6 text-on-surface-variant">{record.time}</td>
                      <td className="py-4 px-6">
                        <span className={`font-label-sm text-label-sm px-2 py-1 rounded-sm border uppercase ${statusColors[record.status]}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
