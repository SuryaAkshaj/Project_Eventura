'use client';

import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/store/authStore';

interface Role {
  roleAssignmentId: string;
  role: string;
  collegeId: string | null;
  collegeName?: string;
  clubId: string | null;
  clubName?: string;
}

interface Props {
  roles: Role[];
  user: any;
  onClose: () => void;
}

const roleIcons: Record<string, string> = {
  SUPER_ADMIN: 'admin_panel_settings',
  COLLEGE_ADMIN: 'business_center',
  CLUB_PRESIDENT: 'groups',
  EVENT_MANAGER: 'event',
  ATTENDEE: 'person',
};

export default function RoleSwitcherModal({ roles, user, onClose }: Props) {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleSelect = async (role: Role) => {
    try {
      const res = await authApi.contextSwitch({
        roleId: role.roleAssignmentId,
        collegeId: role.collegeId,
        clubId: role.clubId,
      });
      const { accessToken } = res.data.data;
      setAuth(user, accessToken, {
        role: role.role,
        collegeId: role.collegeId,
        clubId: role.clubId,
      });

      // Set the middleware cookie so Next.js doesn't bounce on the next navigation
      document.cookie = `eventura-auth=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`;

      if (role.role === 'ATTENDEE') router.push('/dashboard');
      else if (['COLLEGE_ADMIN', 'CLUB_PRESIDENT', 'EVENT_MANAGER'].includes(role.role)) router.push('/org/dashboard');
      else if (role.role === 'SUPER_ADMIN') router.push('/admin/dashboard');
      else router.push('/dashboard');
    } catch (err) {
      console.error('Context switch failed', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-margin-mobile">
      <div className="bg-surface border border-outline-variant rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-lg border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Select your role</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">You have multiple roles — choose which context to log into.</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="p-lg flex flex-col gap-md">
          {roles.map((role) => (
            <button
              key={role.roleAssignmentId}
              onClick={() => handleSelect(role)}
              className="w-full flex items-center gap-md p-md border border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container-low transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-on-primary-container text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {roleIcons[role.role] ?? 'person'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-body-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                  {role.role.replace(/_/g, ' ')}
                </p>
                {role.collegeName && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{role.collegeName}{role.clubName ? ` · ${role.clubName}` : ''}</p>
                )}
              </div>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
