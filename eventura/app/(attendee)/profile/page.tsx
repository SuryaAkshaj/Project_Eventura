'use client';
import { useAuthStore } from '@/lib/store/authStore';

export default function ProfilePage() {
  const { user, activeRole, collegeId } = useAuthStore();

  return (
    <div className="flex-grow w-full max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <h1 className="font-display-lg text-display-lg text-on-surface mb-6">My Profile</h1>
      <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        {/* Avatar header */}
        <div className="bg-gradient-to-br from-primary to-secondary-container h-28 relative" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full bg-primary-container border-4 border-surface flex items-center justify-center shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="material-symbols-outlined text-[36px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person
                </span>
              )}
            </div>
            <div className="pb-2">
              <h2 className="font-title-lg text-title-lg text-on-surface">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="font-body-md text-on-surface-variant">{activeRole}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Email</label>
              <p className="font-body-md text-on-surface">{user?.email}</p>
            </div>
            <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Role</label>
              <p className="font-body-md text-on-surface">{activeRole ?? '—'}</p>
            </div>
            {collegeId && (
              <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">College ID</label>
                <p className="font-body-md text-on-surface font-mono text-sm">{collegeId}</p>
              </div>
            )}
            <div className="pt-2">
              <p className="font-body-sm text-on-surface-variant text-center text-sm">
                Profile editing coming soon. Contact support to update your details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
