import { prismaAdmin } from '@config/database';
import { AppError } from '@shared/errors/AppError';
import { CollegeQuery, UserQuery, AuditQuery } from '@shared/types/query.types';

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

export async function getAllColleges(query: CollegeQuery) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
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

export async function approveCollege(collegeId: string, adminUserId: string) {
  const college = await prismaAdmin.college.findUnique({ where: { id: collegeId } });
  if (!college) throw AppError.notFound('College not found');
  if (college.approvalStatus === 'APPROVED') {
    throw AppError.badRequest('College is already approved');
  }

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

  await prismaAdmin.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'COLLEGE_APPROVED',
      details: { collegeId, collegeName: college.name }
    }
  });

  return prismaAdmin.college.findUnique({ where: { id: collegeId } });
}

export async function rejectCollege(collegeId: string, adminUserId: string, reason?: string) {
  const college = await prismaAdmin.college.findUnique({ where: { id: collegeId } });
  if (!college) throw AppError.notFound('College not found');

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

export async function approveClub(clubId: string, adminUserId: string) {
  const club = await prismaAdmin.club.findUnique({
    where: { id: clubId },
    include: { college: { select: { name: true, approvalStatus: true } } }
  });
  if (!club) throw AppError.notFound('Club not found');
  if (club.college.approvalStatus !== 'APPROVED') {
    throw new AppError('COLLEGE_NOT_APPROVED', 'Parent college must be approved first', 400);
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

export async function rejectClub(clubId: string, adminUserId: string, reason?: string) {
  const club = await prismaAdmin.club.findUnique({ where: { id: clubId } });
  if (!club) throw AppError.notFound('Club not found');

  await prismaAdmin.$transaction([
    prismaAdmin.club.update({
      where: { id: clubId },
      data: { approvalStatus: 'REJECTED' }
    }),
    prismaAdmin.roleAssignment.updateMany({
      where: { clubId, status: 'PENDING' },
      data: { status: 'REJECTED' }
    }),
  ]);

  await prismaAdmin.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'CLUB_REJECTED',
      details: { clubId, clubName: club.name, reason }
    }
  });

  return { rejected: true };
}

export async function getAllUsers(query: UserQuery) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
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
    users: users.map(u => ({ ...u, passwordHash: undefined })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}

export async function getPlatformSettings() {
  let settings = await prismaAdmin.platformSettings.findUnique({
    where: { id: 'singleton' }
  });

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

export async function getAuditLog(query: AuditQuery) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 50;
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

export async function getAllEvents(query: { page?: number; limit?: number; search?: string; status?: string }) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.status) where.status = query.status;

  const [events, total] = await Promise.all([
    prismaAdmin.event.findMany({
      where,
      include: {
        college: { select: { id: true, name: true, domain: true } },
        club: { select: { id: true, name: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prismaAdmin.event.count({ where }),
  ]);

  return {
    events,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getMultiTenantHealth() {
  // Single query to get all colleges with counts
  const colleges = await prismaAdmin.college.findMany({
    where: { approvalStatus: 'APPROVED' },
    include: {
      _count: {
        select: {
          clubs: { where: { approvalStatus: 'APPROVED' } },
          events: true,
        }
      }
    }
  });

  // Get active events count per college in one query
  const activeEventCounts = await prismaAdmin.event.groupBy({
    by: ['collegeId'],
    where: { status: 'PUBLISHED' },
    _count: { id: true }
  });

  // Get user counts per college in one query
  const userCounts = await prismaAdmin.roleAssignment.groupBy({
    by: ['collegeId'],
    where: { status: 'APPROVED' },
    _count: { id: true }
  });

  // Get per-college revenue in one raw query (avoids N+1 on nested relation)
  const collegeRevenues = await prismaAdmin.$queryRaw<{ collegeId: string; total: number }[]>`
    SELECT e."collegeId", COALESCE(SUM(p.amount), 0) as total
    FROM "Payment" p
    JOIN "Registration" r ON p."registrationId" = r.id
    JOIN "Event" e ON r."eventId" = e.id
    WHERE p.status = 'PAID'
    GROUP BY e."collegeId"
  `;

  // Build lookup maps for O(1) access
  const activeMap = new Map(activeEventCounts.map(r => [r.collegeId, r._count.id]));
  const userMap = new Map(userCounts.map(r => [r.collegeId, r._count.id]));
  const revenueMap = new Map(collegeRevenues.map(r => [r.collegeId, Number(r.total)]));

  return colleges.map(college => ({
    id: college.id,
    name: college.name,
    domain: college.domain,
    totalClubs: college._count.clubs,
    totalEvents: college._count.events,
    activeEvents: activeMap.get(college.id) || 0,
    totalUsers: userMap.get(college.id) || 0,
    totalRevenue: revenueMap.get(college.id) || 0,
    status: 'healthy',
  }));
}
