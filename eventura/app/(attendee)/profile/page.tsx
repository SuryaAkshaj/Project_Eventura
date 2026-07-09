'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';
import { ShimmerLine } from '@/components/ui/Shimmer';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, activeRole } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Username state
  const [username, setUsername] = useState<string | null>(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);

  useEffect(() => {
    apiClient.get('/auth/me')
      .then(res => setProfile(res.data.data))
      .catch(() => {
        if (user) setProfile(user);
        else setError('Failed to load profile');
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch username
  useEffect(() => {
    apiClient.get('/auth/me/username')
      .then(res => {
        setUsername(res.data.data.username);
        setNewUsername(res.data.data.username || '');
      })
      .catch(() => {});
  }, []);

  // Save username
  const handleSaveUsername = async () => {
    setUsernameError('');
    setUsernameSaving(true);
    try {
      await apiClient.patch('/auth/me/username', { username: newUsername });
      setUsername(newUsername);
      setEditingUsername(false);
    } catch (err: any) {
      setUsernameError(err.response?.data?.error?.message || 'Failed to update username');
    } finally {
      setUsernameSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="h-36 bg-gray-200 animate-pulse" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-300 animate-pulse border-4 border-white" />
              <div className="pb-1 space-y-2 flex-1">
                <ShimmerLine className="h-6 w-48" />
                <ShimmerLine className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <ShimmerLine className="h-3 w-20" />
                  <ShimmerLine className="h-5 w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-indigo-600 hover:underline text-sm">
          Try again
        </button>
      </div>
    );
  }

  const initials = `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase() || '?';
  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User';
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    COLLEGE_ADMIN: 'College Admin',
    CLUB_PRESIDENT: 'Club President',
    EVENT_MANAGER: 'Event Manager',
    ATTENDEE: 'Attendee',
  };
  const roleDisplay = roleLabels[activeRole ?? 'ATTENDEE'] || (activeRole ?? 'ATTENDEE').replace(/_/g, ' ');
  const roleColor: Record<string, string> = {
    'Super Admin': 'text-purple-600',
    'College Admin': 'text-blue-600',
    'Club President': 'text-indigo-600',
    'Event Manager': 'text-amber-600',
    'Attendee': 'text-green-600',
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

        {/* Banner — gradient header */}
        <div className="h-36 bg-gradient-to-tr from-indigo-900 via-indigo-700 to-indigo-500 relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute top-4 right-20 w-20 h-20 rounded-full bg-white/5" />

          {/* Action buttons top-right */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Link
              href="/forgot-password"
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors font-medium"
            >
              Reset Password
            </Link>
            <button
              disabled
              className="text-xs bg-white/10 text-white/60 px-3 py-1.5 rounded-lg font-medium cursor-not-allowed"
              title="Coming soon"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="px-6 pb-8">
          {/* Avatar + name row */}
          <div className="flex items-end gap-4 -mt-10 mb-6">
            <div className="w-20 h-20 rounded-full bg-indigo-700 border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="pb-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{fullName}</h1>
              <p className={`text-sm font-semibold ${roleColor[roleDisplay] || 'text-indigo-600'}`}>
                {roleDisplay}
              </p>
            </div>
          </div>

          {/* Info grid — 2 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
              <p className="text-gray-900 font-medium truncate">{profile?.email || '—'}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Role</p>
              <p className={`font-semibold ${roleColor[roleDisplay] || 'text-indigo-600'}`}>
                {roleDisplay}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Email Verification
              </p>
              {profile?.isEmailVerified ? (
                <p className="text-green-600 font-semibold flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-xs">✓</span>
                  Verified
                </p>
              ) : (
                <p className="text-amber-600 font-semibold flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs">!</span>
                  Not verified
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Account ID
              </p>
              <p className="text-gray-500 font-mono text-sm truncate">
                {profile?.id?.slice(0, 8).toUpperCase() || '—'}
              </p>
            </div>
          </div>

          {/* Public Profile section */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Public Profile
            </p>

            {username ? (
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-xs text-indigo-600 mb-1 font-medium">Your profile URL</p>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-indigo-800 font-mono flex-1">
                    eventura.app/u/{username}
                  </p>
                  <a
                    href={`/u/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                  >
                    View
                  </a>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Share on LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://project-eventura.vercel.app/u/${username}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Share on LinkedIn →
                </a>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Set a username to get your public profile</p>
                <button
                  onClick={() => setEditingUsername(true)}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                >
                  Set Username
                </button>
              </div>
            )}

            {/* Username edit form */}
            {editingUsername && (
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {usernameError && (
                  <p className="text-xs text-red-500">{usernameError}</p>
                )}
                <p className="text-xs text-gray-400">
                  3-30 characters. Lowercase letters, numbers, and hyphens only.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUsername}
                    disabled={usernameSaving || newUsername.length < 3}
                    className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {usernameSaving ? 'Saving...' : 'Save Username'}
                  </button>
                  <button
                    onClick={() => { setEditingUsername(false); setUsernameError(''); }}
                    className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Links</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/my-tickets"
                className="text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors">
                My Tickets
              </Link>
              <Link href="/certificates"
                className="text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors">
                My Certificates
              </Link>
              <Link href="/events"
                className="text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors">
                Discover Events
              </Link>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            To update your name or organisation details, contact{' '}
            <a href="mailto:support@eventura.app" className="text-indigo-500 hover:underline">
              support@eventura.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
