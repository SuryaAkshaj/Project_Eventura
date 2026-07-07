import { useAuthStore } from '@/lib/store/authStore';

export interface OrgLabels {
  team: string;
  members: string;
  teamAdmin: string;
  guests: string;
}

const DEFAULT_LABELS: OrgLabels = {
  team: 'Club',
  members: 'Students',
  teamAdmin: 'Club President',
  guests: 'Students',
};

/**
 * Returns dynamic org labels from the JWT.
 * College/University users get: Club, Students, Club President
 * Company users get: Department, Employees, Department Head
 * etc.
 * Defaults to college language so existing UI is unchanged.
 */
export function useOrgLabels(): OrgLabels {
  const labels = useAuthStore(s => s.activeContext?.labels);
  return labels || DEFAULT_LABELS;
}

export function useOrgType(): string | null {
  return useAuthStore(s => s.activeContext?.orgType ?? null);
}

export function useAccountMode(): 'COLLEGE' | 'OPEN' | null {
  return useAuthStore(s => s.activeContext?.accountMode ?? null);
}

export function useIsOpenMode(): boolean {
  return useAuthStore(s => s.activeContext?.accountMode === 'OPEN');
}
