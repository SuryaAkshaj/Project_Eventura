export const PERMISSIONS = {
  EVENTS: {
    READ: 'events:read',
    WRITE: 'events:write',
    DELETE: 'events:delete',
    PUBLISH: 'events:publish',
  },
  SCANNER: {
    USE: 'scanner:use',
    VIEW_HISTORY: 'scanner:history',
  },
  FINANCE: {
    READ: 'finance:read',
    MANAGE: 'finance:manage',
  },
  MEMBERS: {
    READ: 'members:read',
    MANAGE: 'members:manage',
  },
  ADMIN: {
    PLATFORM: 'admin:platform',
    APPROVE: 'admin:approve',
  },
} as const;

// Union type of all permission strings
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];
