'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api/admin.api';
import { ShimmerTableRow } from '@/components/ui/Shimmer';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(() => {
    setIsLoading(true);
    adminApi.getAllUsers({ search: search || undefined })
      .then(res => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900">All Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{users.length} users found</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">College</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {[...Array(8)].map((_, i) => <ShimmerTableRow key={i} />)}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">College</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No users found.
                  </td>
                </tr>
              ) : users.map(user => {
                // Resolve role from multiple possible response shapes
                const firstAssignment = user.roleAssignments?.[0];
                const rawRole: string =
                  firstAssignment?.role?.name   // Shape A: { role: { name: "CLUB_PRESIDENT" } }
                  ?? firstAssignment?.roleName  // Shape B: { roleName: "CLUB_PRESIDENT" }
                  ?? firstAssignment?.role      // Shape C: role is a plain string
                  ?? 'ATTENDEE';

                const formattedRole = rawRole
                  .split('_')
                  .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                  .join(' ');

                const roleBadgeClass: Record<string, string> = {
                  SUPER_ADMIN: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
                  COLLEGE_ADMIN: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
                  CLUB_PRESIDENT: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
                  EVENT_MANAGER: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
                  ATTENDEE: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                };
                const badgeClass = roleBadgeClass[rawRole] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';

                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {user.firstName} {user.lastName}
                      {!user.isEmailVerified && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">Unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}>
                        {formattedRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {user.roleAssignments?.[0]?.college?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
