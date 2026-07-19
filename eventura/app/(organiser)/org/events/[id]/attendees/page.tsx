'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { registrationsApi } from '@/lib/api/registrations.api';

const statusConfig: Record<string, { label: string; classes: string }> = {
  REGISTERED: { label: 'Registered', classes: 'bg-primary/10 text-primary border-primary/20' },
  CHECKED_IN: { label: 'Checked In', classes: 'bg-sky-50 text-sky-700 border-sky-200' },
  WAITLISTED: { label: 'Waitlisted', classes: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200' },
};

const paymentConfig: Record<string, { label: string; classes: string }> = {
  FREE: { label: 'Free', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PAID: { label: 'Paid', classes: 'bg-primary/10 text-primary border-primary/20' },
  PENDING: { label: 'Pending', classes: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200' },
};

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const params = useParams();

  useEffect(() => {
    registrationsApi.getEventAttendees(params.id as string)
      .then(res => setAttendees(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Status', 'Payment', 'Checked In At'];
    const rows = attendees.map(a => [
      `${a.user.firstName} ${a.user.lastName}`,
      a.user.email,
      a.status,
      a.paymentStatus,
      a.checkedInAt ? new Date(a.checkedInAt).toLocaleString('en-IN') : 'Not checked in'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${params.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = attendees.filter(a => {
    const q = search.toLowerCase();
    return (
      a.user.firstName.toLowerCase().includes(q) ||
      a.user.lastName.toLowerCase().includes(q) ||
      a.user.email.toLowerCase().includes(q)
    );
  });

  const checkedInCount = attendees.filter(a => a.status === 'CHECKED_IN').length;
  const registeredCount = attendees.filter(a => a.status === 'REGISTERED').length;
  const waitlistCount = attendees.filter(a => a.status === 'WAITLISTED').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-low">
      <header className="bg-surface flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
          <Link href={`/org/events/${params.id}/manage`} className="hover:text-primary">Live Hub</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Attendees</span>
        </div>
        <button
          id="export-csv-btn"
          onClick={exportCSV}
          disabled={attendees.length === 0}
          className="font-label-sm text-label-sm border border-outline-variant text-on-surface-variant px-3 py-2 rounded-lg hover:bg-surface-variant transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
        <div className="max-w-5xl mx-auto space-y-lg">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-md">
            <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center shadow-sm">
              <p className="font-headline-lg text-headline-lg text-primary">{attendees.length}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Total</p>
            </div>
            <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center shadow-sm">
              <p className="font-headline-lg text-headline-lg text-[#2e7d32]">{checkedInCount}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Checked In</p>
            </div>
            <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center shadow-sm">
              <p className="font-headline-lg text-headline-lg text-amber-600 dark:text-amber-400">{waitlistCount}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Waitlisted</p>
            </div>
          </div>

          {/* Search + Table */}
          <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex items-center gap-md">
              <h1 className="font-headline-md text-headline-md text-on-surface">Attendee List</h1>
              <div className="ml-auto relative">
                <span className="material-symbols-outlined text-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email..."
                  className="border border-outline-variant rounded-lg pl-9 pr-3 py-2 font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary w-64"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="animate-pulse p-lg space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-surface-variant rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-3">people</span>
                <p className="font-title-md text-title-md text-on-surface mb-1">
                  {search ? 'No results found' : 'No attendees yet'}
                </p>
                <p className="font-body-md text-on-surface-variant">
                  {search ? 'Try a different search term' : 'Attendees will appear here after registration'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                      <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                      <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                      <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Payment</th>
                      <th className="text-left p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Check-in Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((attendee, i) => {
                      const sCfg = statusConfig[attendee.status] ?? statusConfig['REGISTERED'];
                      const pCfg = paymentConfig[attendee.paymentStatus] ?? paymentConfig['FREE'];
                      return (
                        <tr key={attendee.id} className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors ${i % 2 === 0 ? '' : 'bg-surface-container-low/30'}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                                {attendee.user.avatarUrl ? (
                                  <img src={attendee.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <span className="font-label-sm text-label-sm text-on-primary-container font-bold">
                                    {attendee.user.firstName[0]}{attendee.user.lastName[0]}
                                  </span>
                                )}
                              </div>
                              <span className="font-body-md text-on-surface">
                                {attendee.user.firstName} {attendee.user.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-body-md text-on-surface-variant">{attendee.user.email}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center font-label-sm text-label-sm px-2.5 py-1 rounded-full border ${sCfg.classes}`}>
                              {sCfg.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center font-label-sm text-label-sm px-2.5 py-1 rounded-full border ${pCfg.classes}`}>
                              {pCfg.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-body-md text-on-surface-variant">
                              {attendee.checkedInAt
                                ? new Date(attendee.checkedInAt).toLocaleString('en-IN')
                                : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
