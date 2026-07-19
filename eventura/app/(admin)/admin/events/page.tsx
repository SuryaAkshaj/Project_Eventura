'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api/admin.api';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  PUBLISHED: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  CANCELLED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  COMPLETED: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEvents = useCallback(() => {
    setIsLoading(true);
    adminApi.getAllEvents({ limit: 50, ...(search ? { search } : {}) })
      .then(res => setEvents(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900">All Events</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform-wide event overview</p>
        </div>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-[48px] text-gray-300 mb-3 block">event_busy</span>
          <p className="font-medium">No published events found.</p>
          <p className="text-sm mt-1">Events will appear here once organisers publish them.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">College</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Registrations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{event.title}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{event.college?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{event._count?.registrations ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
