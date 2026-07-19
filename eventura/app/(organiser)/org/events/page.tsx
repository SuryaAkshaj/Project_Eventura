'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api/events.api';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  PUBLISHED: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  CANCELLED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  COMPLETED: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
};

export default function OrgEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    eventsApi.getOrgEvents({ sortBy: 'createdAt', sortOrder: 'desc' })
      .then(res => setEvents(res.data.data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load your events.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-surface-container-low">
      <div className="max-w-7xl mx-auto space-y-xl">
        {/* Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2">My Events</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Manage all your created events.</p>
          </div>
          <Link
            href="/org/events/create"
            className="font-label-sm text-label-sm bg-primary text-on-primary px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Event
          </Link>
        </section>

        {/* Events List */}
        <section className="bg-white dark:bg-gray-900 border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant uppercase">
                  <th className="py-3 px-6 font-semibold">Event</th>
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold">Registered</th>
                  <th className="py-3 px-6 font-semibold">Format</th>
                  <th className="py-3 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                {isLoading && (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" /></td>
                    </tr>
                  ))
                )}

                {!isLoading && error && (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center">
                      <p className="text-error font-body-md">{error}</p>
                    </td>
                  </tr>
                )}

                {!isLoading && !error && events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] mb-3 block text-outline">event_busy</span>
                      <p className="font-title-md text-title-md mb-2">No events yet</p>
                      <p className="font-body-md text-body-md mb-4">Get started by creating your first event.</p>
                      <Link href="/org/events/create" className="font-label-sm text-label-sm text-primary hover:underline">
                        Create your first event →
                      </Link>
                    </td>
                  </tr>
                )}

                {!isLoading && !error && events.map((event) => {
                  const formattedDate = event.startDate
                    ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'TBD';
                  const registrations = event._count?.registrations ?? 0;
                  const capacity = event.maxCapacity;

                  return (
                    <tr key={event.id} className="hover:bg-surface-container transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-on-surface leading-tight">{event.title}</p>
                          {event.college?.name && (
                            <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{event.college.name}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">{formattedDate}</td>
                      <td className="py-4 px-6">
                        <span className={`font-label-sm text-label-sm px-2 py-1 rounded-sm uppercase ${statusColors[event.status] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {registrations}{capacity ? `/${capacity}` : ''}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">{event.format ?? '—'}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-3">
                          <Link href={`/org/events/${event.id}/manage`} className="text-primary hover:underline font-label-sm text-label-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">manage_accounts</span>
                            Manage
                          </Link>
                          <Link href={`/org/events/${event.id}/readiness`} className="text-secondary hover:underline font-label-sm text-label-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">checklist</span>
                            Readiness
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
