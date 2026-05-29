'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin.api';

const actionColors: Record<string, string> = {
  COLLEGE_APPROVED: 'bg-green-100 text-green-700',
  COLLEGE_REJECTED: 'bg-red-100 text-red-700',
  CLUB_APPROVED: 'bg-green-100 text-green-700',
  CLUB_REJECTED: 'bg-red-100 text-red-700',
  EVENT_CREATED: 'bg-indigo-100 text-indigo-700',
  EVENT_PUBLISHED: 'bg-blue-100 text-blue-700',
  EVENT_CANCELLED: 'bg-red-100 text-red-700',
  EVENT_UPDATED: 'bg-yellow-100 text-yellow-700',
  CERTIFICATE_GENERATED: 'bg-purple-100 text-purple-700',
  PLATFORM_SETTINGS_UPDATED: 'bg-orange-100 text-orange-700',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.getAuditLog({ limit: 100 })
      .then(res => setLogs(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Recent platform activity ({logs.length} entries)</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <span className="material-symbols-outlined text-[48px] text-gray-300 mb-3 block">history</span>
          <p className="font-medium">No audit entries yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[log.action] ?? 'bg-gray-100 text-gray-700'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
