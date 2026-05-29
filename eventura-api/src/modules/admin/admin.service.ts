import { prismaAdmin } from '@config/database';

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

export async function approveCollege(collegeId: string, adminUserId: string) {
  const college = await prismaAdmin.college.findUnique({ where: { id: collegeId } });
  if (!college) throw { code: 'NOT_FOUND', message: 'College not found', status: 404 };
  if (college.approvalStatus === 'APPROVED') {
    throw { code: 'ALREADY_APPROVED', message: 'College is already approved', status: 400 };
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

export async function rejectClub(clubId: string, adminUserId: string, reason?: string) {
  const club = await prismaAdmin.club.findUnique({ where: { id: clubId } });
  if (!club) throw { code: 'NOT_FOUND', message: 'Club not found', status: 404 };

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
      status: 'healthy',
    };
  }));

  return healthData;
}
