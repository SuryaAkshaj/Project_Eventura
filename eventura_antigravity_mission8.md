# EVENTURA — ANTIGRAVITY MISSION 8
## Admin Panel: Super Admin Dashboard, College & Club Approval, Platform Settings

---

## CRITICAL RULES — READ BEFORE TOUCHING ANY FILE

1. **DO NOT modify any className, color, layout, font, or spacing** — UI is pixel-perfect from Stitch.
2. **DO NOT modify any backend files from previous missions** unless explicitly listed below.
3. **DO NOT modify `prisma/schema.prisma`** — it is complete and migrated.
4. **DO NOT run `prisma migrate`** — schema is already in the database.
5. **Only touch files explicitly listed at the bottom of this prompt.**

---

## PROJECT CONTEXT

### What exists and is working:
- Auth, Events, Registrations, QR, Payments all complete ✅
- Frontend running on `http://localhost:3001`
- Backend running on `http://localhost:4000`
- Super Admin role exists in database with full permissions

### Admin pages already built in frontend (mock data):
- `app/(admin)/admin/dashboard/page.tsx` — platform overview stats
- `app/(admin)/admin/colleges/page.tsx` — college/club approval queue + side-by-side comparison
- `app/(admin)/admin/health/page.tsx` — multi-tenant health metrics

### Confirmed Prisma models:
```
College (id, name, domain, approvalStatus, approvedAt, approvedBy, logoUrl)
Club (id, name, collegeId, approvalStatus, approvedAt)
RoleAssignment (id, userId, roleId, collegeId, clubId, status)
PlatformSettings (id, platformFeeEnabled, platformFeePercent, maintenanceMode)
AuditLog (id, userId, eventId, action, details, ipAddress, createdAt)
User (id, email, firstName, lastName, isEmailVerified, isActive, lastLoginAt)
```

### Confirmed enums:
```typescript
ApprovalStatus: PENDING | APPROVED | REJECTED | SUSPENDED
RoleName: SUPER_ADMIN | COLLEGE_ADMIN | CLUB_PRESIDENT | EVENT_MANAGER | ATTENDEE
```

### Key middleware available:
```typescript
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { prismaAdmin } from '@config/database';
```

---

## PART 1 — BACKEND: ADMIN MODULE

Create all files inside `src/modules/admin/`:

```
src/modules/admin/
├── admin.service.ts
├── admin.controller.ts
└── admin.routes.ts
```

---

### `admin.service.ts`

Implement these functions:

---

#### `getPlatformStats()`

Returns platform-wide overview for the super admin dashboard:

```typescript
export async function getPlatformStats() {
  const [
    totalColleges,
    pendingColleges,
    totalClubs,
    pendingClubs,
    totalUsers,
    totalEvents,
    publishedEvents,
    totalRegistrations,
    totalRevenue,
  ] = await Promise.all([
    prismaAdmin.college.count({ where: { approvalStatus: 'APPROVED' } }),
    prismaAdmin.college.count({ where: { approvalStatus: 'PENDING' } }),
    prismaAdmin.club.count({ where: { approvalStatus: 'APPROVED' } }),
    prismaAdmin.club.count({ where: { approvalStatus: 'PENDING' } }),
    prismaAdmin.user.count(),
    prismaAdmin.event.count(),
    prismaAdmin.event.count({ where: { status: 'PUBLISHED' } }),
    prismaAdmin.registration.count({ where: { status: { not: 'CANCELLED' } } }),
    prismaAdmin.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    }),
  ]);

  return {
    colleges: { total: totalColleges, pending: pendingColleges },
    clubs: { total: totalClubs, pending: pendingClubs },
    users: { total: totalUsers },
    events: { total: totalEvents, published: publishedEvents },
    registrations: { total: totalRegistrations },
    revenue: {
      total: Number(totalRevenue._sum.amount || 0),
      currency: 'INR',
    },
  };
}
```

---

#### `getPendingColleges()`

```typescript
export async function getPendingColleges() {
  return prismaAdmin.college.findMany({
    where: { approvalStatus: 'PENDING' },
    include: {
      _count: { select: { clubs: true } },
      roleAssignments: {
        where: { status: 'PENDING' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          role: { select: { name: true } }
        },
        take: 1,
      }
    },
    orderBy: { createdAt: 'asc' }
  });
}
```

---

#### `getAllColleges(query: { page?: number; limit?: number; search?: string; status?: string })`

```typescript
export async function getAllColleges(query: any) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { domain: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.status) where.approvalStatus = query.status;

  const [colleges, total] = await Promise.all([
    prismaAdmin.college.findMany({
      where,
      include: {
        _count: { select: { clubs: true, events: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prismaAdmin.college.count({ where }),
  ]);

  return {
    colleges,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}
```

---

#### `approveCollege(collegeId: string, adminUserId: string)`

```typescript
export async function approveCollege(collegeId: string, adminUserId: string) {
  const college = await prismaAdmin.college.findUnique({ where: { id: collegeId } });
  if (!college) throw { code: 'NOT_FOUND', message: 'College not found', status: 404 };
  if (college.approvalStatus === 'APPROVED') {
    throw { code: 'ALREADY_APPROVED', message: 'College is already approved', status: 400 };
  }

  // Approve college and all pending role assignments for this college
  await prismaAdmin.$transaction([
    prismaAdmin.college.update({
      where: { id: collegeId },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminUserId,
      }
    }),
    prismaAdmin.roleAssignment.updateMany({
      where: { collegeId, status: 'PENDING' },
      data: { status: 'APPROVED' }
    }),
  ]);

  // Create audit log
  await prismaAdmin.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'COLLEGE_APPROVED',
      details: { collegeId, collegeName: college.name }
    }
  });

  return prismaAdmin.college.findUnique({ where: { id: collegeId } });
}
```

---

#### `rejectCollege(collegeId: string, adminUserId: string, reason?: string)`

```typescript
export async function rejectCollege(collegeId: string, adminUserId: string, reason?: string) {
  const college = await prismaAdmin.college.findUnique({ where: { id: collegeId } });
  if (!college) throw { code: 'NOT_FOUND', message: 'College not found', status: 404 };

  await prismaAdmin.$transaction([
    prismaAdmin.college.update({
      where: { id: collegeId },
      data: { approvalStatus: 'REJECTED' }
    }),
    prismaAdmin.roleAssignment.updateMany({
      where: { collegeId, status: 'PENDING' },
      data: { status: 'REJECTED' }
    }),
  ]);

  await prismaAdmin.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'COLLEGE_REJECTED',
      details: { collegeId, collegeName: college.name, reason }
    }
  });

  return { rejected: true };
}
```

---

#### `suspendCollege(collegeId: string, adminUserId: string)`

```typescript
export async function suspendCollege(collegeId: string, adminUserId: string) {
  await prismaAdmin.college.update({
    where: { id: collegeId },
    data: { approvalStatus: 'SUSPENDED' }
  });

  await prismaAdmin.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'COLLEGE_SUSPENDED',
      details: { collegeId }
    }
  });

  return { suspended: true };
}
```

---

#### `getPendingClubs()`

```typescript
export async function getPendingClubs() {
  return prismaAdmin.club.findMany({
    where: { approvalStatus: 'PENDING' },
    include: {
      college: { select: { name: true, domain: true } },
      roleAssignments: {
        where: { status: 'PENDING' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        take: 1,
      }
    },
    orderBy: { createdAt: 'asc' }
  });
}
```

---

#### `approveClub(clubId: string, adminUserId: string)`

```typescript
export async function approveClub(clubId: string, adminUserId: string) {
  const club = await prismaAdmin.club.findUnique({
    where: { id: clubId },
    include: { college: { select: { name: true, approvalStatus: true } } }
  });
  if (!club) throw { code: 'NOT_FOUND', message: 'Club not found', status: 404 };
  if (club.college.approvalStatus !== 'APPROVED') {
    throw { code: 'COLLEGE_NOT_APPROVED', message: 'Parent college must be approved first', status: 400 };
  }

  await prismaAdmin.$transaction([
    prismaAdmin.club.update({
      where: { id: clubId },
      data: { approvalStatus: 'APPROVED', approvedAt: new Date() }
    }),
    prismaAdmin.roleAssignment.updateMany({
      where: { clubId, status: 'PENDING' },
      data: { status: 'APPROVED' }
    }),
  ]);

  await prismaAdmin.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'CLUB_APPROVED',
      details: { clubId, clubName: club.name }
    }
  });

  return prismaAdmin.club.findUnique({ where: { id: clubId } });
}
```

---

#### `rejectClub(clubId: string, adminUserId: string, reason?: string)`

Mirror of `rejectCollege` but for clubs. Set `approvalStatus: 'REJECTED'` on club and all pending role assignments with `clubId`.

---

#### `getAllUsers(query: { page?: number; limit?: number; search?: string; role?: string })`

```typescript
export async function getAllUsers(query: any) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prismaAdmin.user.findMany({
      where,
      include: {
        roleAssignments: {
          where: { status: 'APPROVED' },
          include: {
            role: { select: { name: true } },
            college: { select: { name: true } },
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prismaAdmin.user.count({ where }),
  ]);

  return {
    users: users.map(u => ({ ...u, passwordHash: undefined })), // Never expose password
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}
```

---

#### `getPlatformSettings()`

```typescript
export async function getPlatformSettings() {
  let settings = await prismaAdmin.platformSettings.findUnique({
    where: { id: 'singleton' }
  });

  // Create default settings if not exists
  if (!settings) {
    settings = await prismaAdmin.platformSettings.create({
      data: {
        id: 'singleton',
        platformFeeEnabled: false,
        platformFeePercent: 2.5,
        maintenanceMode: false,
      }
    });
  }

  return settings;
}
```

---

#### `updatePlatformSettings(data: { platformFeeEnabled?: boolean; platformFeePercent?: number; maintenanceMode?: boolean }, adminUserId: string)`

```typescript
export async function updatePlatformSettings(data: any, adminUserId: string) {
  const settings = await prismaAdmin.platformSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: {
      id: 'singleton',
      platformFeeEnabled: data.platformFeeEnabled ?? false,
      platformFeePercent: data.platformFeePercent ?? 2.5,
      maintenanceMode: data.maintenanceMode ?? false,
    }
  });

  await prismaAdmin.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'PLATFORM_SETTINGS_UPDATED',
      details: data
    }
  });

  return settings;
}
```

---

#### `getAuditLog(query: { page?: number; limit?: number; action?: string })`

```typescript
export async function getAuditLog(query: any) {
  const page = query.page || 1;
  const limit = query.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.action) where.action = { contains: query.action, mode: 'insensitive' };

  const [logs, total] = await Promise.all([
    prismaAdmin.auditLog.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prismaAdmin.auditLog.count({ where }),
  ]);

  return {
    logs,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}
```

---

#### `getMultiTenantHealth()`

Returns per-college health metrics for the health dashboard:

```typescript
export async function getMultiTenantHealth() {
  const colleges = await prismaAdmin.college.findMany({
    where: { approvalStatus: 'APPROVED' },
    include: {
      _count: {
        select: {
          clubs: true,
          events: true,
        }
      }
    }
  });

  const healthData = await Promise.all(colleges.map(async (college) => {
    const [activeEvents, totalUsers, totalRevenue] = await Promise.all([
      prismaAdmin.event.count({
        where: { collegeId: college.id, status: 'PUBLISHED' }
      }),
      prismaAdmin.roleAssignment.count({
        where: { collegeId: college.id, status: 'APPROVED' }
      }),
      prismaAdmin.payment.aggregate({
        where: {
          status: 'PAID',
          registration: { event: { collegeId: college.id } }
        },
        _sum: { amount: true }
      }),
    ]);

    return {
      id: college.id,
      name: college.name,
      domain: college.domain,
      totalClubs: college._count.clubs,
      totalEvents: college._count.events,
      activeEvents,
      totalUsers,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      status: 'healthy', // Could add health checks later
    };
  }));

  return healthData;
}
```

---

### `admin.controller.ts`

```typescript
import { asyncHandler } from '@shared/utils/asyncHandler';
import * as adminService from './admin.service';

export const getPlatformStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getPlatformStats();
  return res.json({ success: true, data: stats });
});

export const getPendingColleges = asyncHandler(async (req, res) => {
  const colleges = await adminService.getPendingColleges();
  return res.json({ success: true, data: colleges });
});

export const getAllColleges = asyncHandler(async (req, res) => {
  const result = await adminService.getAllColleges(req.query);
  return res.json({ success: true, data: result.colleges, meta: result.meta });
});

export const approveCollege = asyncHandler(async (req, res) => {
  const college = await adminService.approveCollege(req.params.id, req.user!.sub);
  return res.json({ success: true, data: college, message: 'College approved successfully' });
});

export const rejectCollege = asyncHandler(async (req, res) => {
  const result = await adminService.rejectCollege(req.params.id, req.user!.sub, req.body.reason);
  return res.json({ success: true, data: result, message: 'College rejected' });
});

export const suspendCollege = asyncHandler(async (req, res) => {
  const result = await adminService.suspendCollege(req.params.id, req.user!.sub);
  return res.json({ success: true, data: result, message: 'College suspended' });
});

export const getPendingClubs = asyncHandler(async (req, res) => {
  const clubs = await adminService.getPendingClubs();
  return res.json({ success: true, data: clubs });
});

export const approveClub = asyncHandler(async (req, res) => {
  const club = await adminService.approveClub(req.params.id, req.user!.sub);
  return res.json({ success: true, data: club, message: 'Club approved successfully' });
});

export const rejectClub = asyncHandler(async (req, res) => {
  const result = await adminService.rejectClub(req.params.id, req.user!.sub, req.body.reason);
  return res.json({ success: true, data: result, message: 'Club rejected' });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);
  return res.json({ success: true, data: result.users, meta: result.meta });
});

export const getPlatformSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.getPlatformSettings();
  return res.json({ success: true, data: settings });
});

export const updatePlatformSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.updatePlatformSettings(req.body, req.user!.sub);
  return res.json({ success: true, data: settings, message: 'Settings updated' });
});

export const getAuditLog = asyncHandler(async (req, res) => {
  const result = await adminService.getAuditLog(req.query);
  return res.json({ success: true, data: result.logs, meta: result.meta });
});

export const getMultiTenantHealth = asyncHandler(async (req, res) => {
  const health = await adminService.getMultiTenantHealth();
  return res.json({ success: true, data: health });
});
```

---

### `admin.routes.ts`

```typescript
import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import * as adminController from './admin.controller';

const router = Router();

// All admin routes require SUPER_ADMIN role
router.use(authMiddleware, requireRole('SUPER_ADMIN'));

// Platform stats
router.get('/stats', adminController.getPlatformStats);

// Colleges
router.get('/colleges', adminController.getAllColleges);
router.get('/colleges/pending', adminController.getPendingColleges);
router.post('/colleges/:id/approve', adminController.approveCollege);
router.post('/colleges/:id/reject', adminController.rejectCollege);
router.post('/colleges/:id/suspend', adminController.suspendCollege);

// Clubs
router.get('/clubs/pending', adminController.getPendingClubs);
router.post('/clubs/:id/approve', adminController.approveClub);
router.post('/clubs/:id/reject', adminController.rejectClub);

// Users
router.get('/users', adminController.getAllUsers);

// Platform settings
router.get('/settings', adminController.getPlatformSettings);
router.patch('/settings', adminController.updatePlatformSettings);

// Audit log
router.get('/audit', adminController.getAuditLog);

// Multi-tenant health
router.get('/health', adminController.getMultiTenantHealth);

export default router;
```

---

## PART 2 — REGISTER ADMIN ROUTES IN APP.TS

Add to `src/app.ts` — only these two lines:

```typescript
import adminRoutes from '@modules/admin/admin.routes';
app.use('/admin', adminRoutes);
```

---

## PART 3 — CREATE SUPER ADMIN USER

The seeded data has colleges and clubs but we need a Super Admin user to test with. Add to a new file `prisma/seed-admin.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  // Get or create SUPER_ADMIN role
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      permissions: {
        create: [
          { action: 'admin:platform' },
          { action: 'admin:approve' },
          { action: 'events:read' },
          { action: 'events:write' },
          { action: 'finance:read' },
          { action: 'finance:manage' },
        ]
      }
    }
  });

  // Create Super Admin user
  const passwordHash = await bcrypt.hash('Admin@1234', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@eventura.app' },
    update: {},
    create: {
      email: 'admin@eventura.app',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      isEmailVerified: true,
    }
  });

  // We need a college for the role assignment (use first approved college)
  const college = await prisma.college.findFirst({
    where: { approvalStatus: 'APPROVED' }
  });

  if (!college) {
    console.log('❌ No approved college found — run main seed first');
    return;
  }

  // Create role assignment
  await prisma.roleAssignment.upsert({
    where: {
      userId_roleId_collegeId_clubId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        collegeId: college.id,
        clubId: null,
      }
    },
    update: { status: 'APPROVED' },
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
      collegeId: college.id,
      status: 'APPROVED',
    }
  });

  // Create platform settings if not exists
  await prisma.platformSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      platformFeeEnabled: false,
      platformFeePercent: 2.5,
      maintenanceMode: false,
    }
  });

  console.log('✅ Super Admin created:');
  console.log('   Email: admin@eventura.app');
  console.log('   Password: Admin@1234');
  await prisma.$disconnect();
}

seedAdmin().catch(console.error);
```

Add to `package.json` scripts:
```json
"db:seed-admin": "ts-node prisma/seed-admin.ts"
```

Then run:
```bash
npm run db:seed-admin
```

---

## PART 4 — FRONTEND: ADMIN API CLIENT

Create `eventura/lib/api/admin.api.ts`:

```typescript
import apiClient from './client';

export const adminApi = {
  // Stats
  getStats: () => apiClient.get('/admin/stats'),

  // Colleges
  getAllColleges: (params?: any) => apiClient.get('/admin/colleges', { params }),
  getPendingColleges: () => apiClient.get('/admin/colleges/pending'),
  approveCollege: (id: string) => apiClient.post(`/admin/colleges/${id}/approve`),
  rejectCollege: (id: string, reason?: string) => apiClient.post(`/admin/colleges/${id}/reject`, { reason }),
  suspendCollege: (id: string) => apiClient.post(`/admin/colleges/${id}/suspend`),

  // Clubs
  getPendingClubs: () => apiClient.get('/admin/clubs/pending'),
  approveClub: (id: string) => apiClient.post(`/admin/clubs/${id}/approve`),
  rejectClub: (id: string, reason?: string) => apiClient.post(`/admin/clubs/${id}/reject`, { reason }),

  // Users
  getAllUsers: (params?: any) => apiClient.get('/admin/users', { params }),

  // Settings
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data: any) => apiClient.patch('/admin/settings', data),

  // Audit
  getAuditLog: (params?: any) => apiClient.get('/admin/audit', { params }),

  // Health
  getHealth: () => apiClient.get('/admin/health'),
};
```

---

## PART 5 — WIRE SUPER ADMIN DASHBOARD

File: `eventura/app/(admin)/admin/dashboard/page.tsx`

### Add `"use client"` at top if not present.

### Add state:
```typescript
const [stats, setStats] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);
const { user } = useAuthStore();
```

### Fetch stats:
```typescript
useEffect(() => {
  adminApi.getStats()
    .then(res => setStats(res.data.data))
    .catch(console.error)
    .finally(() => setIsLoading(false));
}, []);
```

### Wire stat cards to real data:
- Total colleges → `stats?.colleges?.total`
- Pending approval → `stats?.colleges?.pending + stats?.clubs?.pending`
- Total users → `stats?.users?.total`
- Total events → `stats?.events?.total`
- Published events → `stats?.events?.published`
- Total registrations → `stats?.registrations?.total`
- Total revenue → `'₹' + Number(stats?.revenue?.total || 0).toLocaleString('en-IN')`

### Wire admin name:
Replace mock name with `user?.firstName + ' ' + user?.lastName`

### Pending approvals alert:
If `stats?.colleges?.pending > 0 || stats?.clubs?.pending > 0` → show alert banner:
```tsx
{(stats?.colleges?.pending > 0 || stats?.clubs?.pending > 0) && (
  <div className="...existing alert styling...">
    {stats.colleges.pending + stats.clubs.pending} items pending approval
    <a href="/admin/colleges" className="...">Review now →</a>
  </div>
)}
```

---

## PART 6 — WIRE COLLEGES APPROVAL PAGE

File: `eventura/app/(admin)/admin/colleges/page.tsx`

This page has two states: the queue view and the side-by-side comparison view.

### Add state:
```typescript
const [pendingColleges, setPendingColleges] = useState<any[]>([]);
const [pendingClubs, setPendingClubs] = useState<any[]>([]);
const [allColleges, setAllColleges] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [showComparison, setShowComparison] = useState(false);
const [selectedItem, setSelectedItem] = useState<any>(null);
const [isProcessing, setIsProcessing] = useState(false);
const [activeTab, setActiveTab] = useState<'colleges' | 'clubs'>('colleges');
```

### Fetch data:
```typescript
const fetchData = async () => {
  setIsLoading(true);
  try {
    const [pendingCollegesRes, pendingClubsRes, allCollegesRes] = await Promise.all([
      adminApi.getPendingColleges(),
      adminApi.getPendingClubs(),
      adminApi.getAllColleges({ limit: 50 }),
    ]);
    setPendingColleges(pendingCollegesRes.data.data);
    setPendingClubs(pendingClubsRes.data.data);
    setAllColleges(allCollegesRes.data.data);
  } catch (err) {
    console.error('Failed to fetch admin data', err);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => { fetchData(); }, []);
```

### Wire pending colleges list:
Map `pendingColleges` to existing queue card components:
- College name → `college.name`
- Domain → `college.domain`
- Submitted by → `college.roleAssignments[0]?.user.email`
- Date submitted → `new Date(college.createdAt).toLocaleDateString('en-IN')`
- "Review" button → `setSelectedItem(college); setShowComparison(true)`

### Wire pending clubs list:
Map `pendingClubs` similarly showing club name, parent college name, submitted by.

### Wire approve/reject actions:

```typescript
const handleApprove = async (type: 'college' | 'club', id: string) => {
  setIsProcessing(true);
  try {
    if (type === 'college') await adminApi.approveCollege(id);
    else await adminApi.approveClub(id);
    await fetchData(); // Refresh list
    setShowComparison(false);
  } catch (err: any) {
    alert(err.response?.data?.error?.message || 'Action failed');
  } finally {
    setIsProcessing(false);
  }
};

const handleReject = async (type: 'college' | 'club', id: string) => {
  const reason = prompt('Reason for rejection (optional):');
  setIsProcessing(true);
  try {
    if (type === 'college') await adminApi.rejectCollege(id, reason || undefined);
    else await adminApi.rejectClub(id, reason || undefined);
    await fetchData();
    setShowComparison(false);
  } catch (err: any) {
    alert(err.response?.data?.error?.message || 'Action failed');
  } finally {
    setIsProcessing(false);
  }
};
```

### Wire comparison view:
When `showComparison` is true and `selectedItem` is set:
- Show side-by-side: left panel = submission details, right panel = existing similar colleges (from `allColleges`)
- Approve button → `handleApprove('college', selectedItem.id)`
- Reject button → `handleReject('college', selectedItem.id)`
- Close button → `setShowComparison(false)`

### Wire tab switching:
- Colleges tab → `setActiveTab('colleges')`
- Clubs tab → `setActiveTab('clubs')`
- Show badge counts: `pendingColleges.length` and `pendingClubs.length`

---

## PART 7 — WIRE MULTI-TENANT HEALTH DASHBOARD

File: `eventura/app/(admin)/admin/health/page.tsx`

### Add state:
```typescript
const [healthData, setHealthData] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);
```

### Fetch health data:
```typescript
useEffect(() => {
  adminApi.getHealth()
    .then(res => setHealthData(res.data.data))
    .catch(console.error)
    .finally(() => setIsLoading(false));
}, []);
```

### Wire health cards/table to real data:
Map `healthData` to existing per-college health cards:
- College name → `college.name`
- Total clubs → `college.totalClubs`
- Total events → `college.totalEvents`
- Active events → `college.activeEvents`
- Total users → `college.totalUsers`
- Revenue → `'₹' + college.totalRevenue.toLocaleString('en-IN')`
- Status indicator → `college.status` (always `healthy` for now)

---

## PART 8 — CREATE PLATFORM SETTINGS PAGE

Create `eventura/app/(admin)/admin/settings/page.tsx`:

```tsx
'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin.api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.getSettings()
      .then(res => setSettings(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminApi.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Match existing admin page design system — Deep Indigo (#2E3192)
  // Show three settings:
  // 1. Platform Fee Toggle (on/off switch) → settings.platformFeeEnabled
  // 2. Platform Fee Percentage (number input, 0-10) → settings.platformFeePercent
  // 3. Maintenance Mode Toggle → settings.maintenanceMode
  // Save button with loading state
  // Success message when saved
}
```

---

## PART 9 — UPDATE ADMIN SIDEBAR NAVIGATION

File: `eventura/components/layout/AdminSidebar.tsx`

Add Settings link to sidebar navigation (only if not already present):
```tsx
{ href: '/admin/settings', label: 'Settings', icon: '⚙️' }
```

---

## VERIFICATION STEPS

Run all of these. Do not stop until all pass:

**Backend:**
```bash
# 1. TypeScript check
cd eventura-api && npx tsc --noEmit

# 2. Seed admin user
npm run db:seed-admin

# 3. Restart server
npm run dev

# 4. Login as Super Admin
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventura.app","password":"Admin@1234"}'

# 5. Copy token and test admin endpoints
curl http://localhost:4000/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

curl http://localhost:4000/admin/colleges/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"

curl http://localhost:4000/admin/health \
  -H "Authorization: Bearer ADMIN_TOKEN"

curl http://localhost:4000/admin/settings \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

All must return `{ success: true }` ✅

**Frontend:**
```bash
cd eventura && npx tsc --noEmit
```

1. `npx tsc --noEmit` → 0 errors ✅
2. `npm run dev` → starts with no errors ✅
3. Login as `admin@eventura.app` / `Admin@1234` → redirects to `/admin/dashboard` ✅
4. Dashboard shows real stats ✅
5. Open `/admin/colleges` → pending queue shows real data ✅
6. Click Review on a pending college → comparison view opens ✅
7. Click Approve → college approved, list refreshes ✅
8. Open `/admin/health` → per-college health data shows ✅
9. Open `/admin/settings` → platform fee toggle works ✅

---

## FILES ALLOWED TO TOUCH — COMPLETE LIST

**Backend — create new:**
- `src/modules/admin/admin.service.ts`
- `src/modules/admin/admin.controller.ts`
- `src/modules/admin/admin.routes.ts`
- `prisma/seed-admin.ts`

**Backend — modify existing:**
- `src/app.ts` — add 2 lines only (import + app.use)
- `package.json` — add 1 script only

**Frontend — create new:**
- `lib/api/admin.api.ts`
- `app/(admin)/admin/settings/page.tsx`

**Frontend — modify existing:**
- `app/(admin)/admin/dashboard/page.tsx`
- `app/(admin)/admin/colleges/page.tsx`
- `app/(admin)/admin/health/page.tsx`
- `components/layout/AdminSidebar.tsx`

**Everything else → DO NOT TOUCH.**
