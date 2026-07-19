'use client';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';

export default function AdminProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(user);

  useEffect(() => {
    apiClient.get('/auth/me')
      .then(res => setProfile(res.data.data))
      .catch(() => setProfile(user));
  }, []);

  const initials = `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Admin Profile</h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-700 to-indigo-500" />
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-4">
            <div className="w-16 h-16 rounded-full bg-indigo-700 border-4 border-white flex items-center justify-center text-white text-xl font-bold">
              {initials || 'SA'}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile?.firstName} {profile?.lastName}</h2>
          <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">Super Admin</p>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-950 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Email</p>
              <p className="text-gray-900 dark:text-gray-100">{profile?.email}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Role</p>
              <p className="text-gray-900 dark:text-gray-100">SUPER ADMIN</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
