import { prismaAdmin } from '@config/database';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './events.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildAppError(message: string, statusCode = 400): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

// ─────────────────────────────────────────────────────────────────────────────
// Visibility filter — builds a Prisma OR condition for which events are visible
// ─────────────────────────────────────────────────────────────────────────────

function visibilityWhere(userContext: { collegeId: string | null; role: string }) {
  const OR: object[] = [
    { visibility: 'PUBLIC' },
  ];

  if (userContext.collegeId) {
    OR.push({ visibility: 'ALL_PLATFORM' });
    OR.push({ visibility: 'ONLY_MY_COLLEGE', collegeId: userContext.collegeId });
    OR.push({
      visibility: 'SELECTED_COLLEGES',
      sharedWith: { some: { collegeId: userContext.collegeId } },
    });
  }

  return OR;
}

// ─────────────────────────────────────────────────────────────────────────────
// getEvents — paginated browse for attendees / public
// ─────────────────────────────────────────────────────────────────────────────

export async function getEvents(
  query: EventQueryDto,
  userContext: { collegeId: string | null; role: string },
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;
  const skip = (page - 1) * limit;

  const where: any = {
    status: 'PUBLISHED',
    OR: visibilityWhere(userContext),
  };

  // Apply optional filters only when provided
  if (query.search) {
    // Combine visibility + search using AND so both conditions apply
    where.AND = [
      { OR: visibilityWhere(userContext) },
      {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      },
    ];
    delete where.OR;
  }
  if (query.category) where.category = query.category;
  if (query.format) where.format = query.format;
  if (query.isFree !== undefined) where.isFree = query.isFree;
  // Only apply date filters if caller explicitly requests a date range
  if (query.startDateFrom) where.startDate = { ...where.startDate, gte: new Date(query.startDateFrom) };
  if (query.startDateTo) where.startDate = { ...where.startDate, lte: new Date(query.startDateTo) };

  const [events, total] = await Promise.all([
    prismaAdmin.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [query.sortBy ?? 'startDate']: query.sortOrder ?? 'asc' },
      include: {
        college: { select: { id: true, name: true, logoUrl: true } },
        club: { select: { id: true, name: true, logoUrl: true } },
        _count: { select: { registrations: true } },
      },
    }),
    prismaAdmin.event.count({ where }),
  ]);

  return {
    events,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// getEventById — full detail for a single event
// ─────────────────────────────────────────────────────────────────────────────

export async function getEventById(
  eventId: string,
  userContext: { collegeId: string | null; role: string },
) {
  const event = await prismaAdmin.event.findUnique({
    where: { id: eventId },
    include: {
      sessions: { orderBy: { startTime: 'asc' } },
      college: { select: { id: true, name: true, logoUrl: true } },
      club: { select: { id: true, name: true, logoUrl: true } },
      sharedWith: { select: { collegeId: true } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) {
    throw buildAppError('Event not found', 404);
  }

  // Visibility check
  const isPublic = event.visibility === 'PUBLIC';
  const isAllPlatform = event.visibility === 'ALL_PLATFORM' && !!userContext.collegeId;
  const isMyCollege = event.visibility === 'ONLY_MY_COLLEGE' && event.collegeId === userContext.collegeId;
  const isShared =
    event.visibility === 'SELECTED_COLLEGES' &&
    event.sharedWith.some(s => s.collegeId === userContext.collegeId);
  const isOwnCollege = event.collegeId === userContext.collegeId;

  // Published check — organisers of the same college can see drafts
  const canSee =
    isPublic || isAllPlatform || isMyCollege || isShared ||
    (isOwnCollege && event.status !== 'CANCELLED');

  if (!canSee && event.status !== 'PUBLISHED') {
    throw buildAppError('Event not found', 404);
  }

  return event;
}

// ─────────────────────────────────────────────────────────────────────────────
// createEvent
// ─────────────────────────────────────────────────────────────────────────────

export async function createEvent(
  dto: CreateEventDto,
  organizerContext: { userId: string; collegeId: string; clubId?: string | null },
) {
  // Validate clubId belongs to organizer's college
  if (dto.clubId) {
    const club = await prismaAdmin.club.findFirst({
      where: { id: dto.clubId, collegeId: organizerContext.collegeId },
    });
    if (!club) {
      throw buildAppError('Club does not belong to your college', 400);
    }
  }

  const event = await prismaAdmin.event.create({
    data: {
      title: dto.title,
      description: dto.description,
      bannerUrl: dto.bannerUrl,
      collegeId: organizerContext.collegeId,
      clubId: dto.clubId ?? organizerContext.clubId ?? null,
      visibility: dto.visibility as any,
      status: 'DRAFT',
      category: dto.category,
      format: dto.format,
      venue: dto.venue,
      onlineLink: dto.onlineLink,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      timezone: dto.timezone ?? 'Asia/Kolkata',
      maxCapacity: dto.maxCapacity,
      isMultiDay: dto.isMultiDay ?? false,
      ticketPrice: dto.ticketPrice ?? 0,
      isFree: (dto.ticketPrice ?? 0) === 0,
      // Sessions via nested create
      sessions: dto.sessions
        ? {
            create: dto.sessions.map(s => ({
              title: s.title,
              startTime: new Date(s.startTime),
              endTime: new Date(s.endTime),
              venue: s.venue,
              speakerName: s.speakerName,
            })),
          }
        : undefined,
      // SharedEvent records for SELECTED_COLLEGES
      sharedWith: dto.visibility === 'SELECTED_COLLEGES' && dto.selectedCollegeIds
        ? {
            create: dto.selectedCollegeIds.map(cid => ({ collegeId: cid })),
          }
        : undefined,
    },
    include: {
      sessions: true,
      college: { select: { id: true, name: true } },
      club: { select: { id: true, name: true } },
    },
  });

  // Audit log
  await prismaAdmin.auditLog.create({
    data: {
      userId: organizerContext.userId,
      eventId: event.id,
      action: 'EVENT_CREATED',
      details: { title: event.title },
    },
  });

  return event;
}

// ─────────────────────────────────────────────────────────────────────────────
// updateEvent
// ─────────────────────────────────────────────────────────────────────────────

export async function updateEvent(
  eventId: string,
  dto: UpdateEventDto,
  organizerContext: { userId: string; collegeId: string },
) {
  const existing = await prismaAdmin.event.findFirst({
    where: { id: eventId, collegeId: organizerContext.collegeId },
  });

  if (!existing) {
    throw buildAppError('Event not found or you do not have permission to edit it', 404);
  }

  if (existing.status === 'CANCELLED' || existing.status === 'COMPLETED') {
    throw buildAppError('Cannot edit a cancelled or completed event', 400);
  }

  // If visibility changes to SELECTED_COLLEGES, replace SharedEvent records
  if (dto.visibility === 'SELECTED_COLLEGES' && dto.selectedCollegeIds) {
    await prismaAdmin.sharedEvent.deleteMany({ where: { eventId } });
  }

  // If sessions provided, replace all sessions
  if (dto.sessions) {
    await prismaAdmin.eventSession.deleteMany({ where: { eventId } });
  }

  const updated = await prismaAdmin.event.update({
    where: { id: eventId },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.bannerUrl !== undefined && { bannerUrl: dto.bannerUrl }),
      ...(dto.visibility !== undefined && { visibility: dto.visibility as any }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.format !== undefined && { format: dto.format }),
      ...(dto.venue !== undefined && { venue: dto.venue }),
      ...(dto.onlineLink !== undefined && { onlineLink: dto.onlineLink }),
      ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
      ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      ...(dto.timezone !== undefined && { timezone: dto.timezone }),
      ...(dto.maxCapacity !== undefined && { maxCapacity: dto.maxCapacity }),
      ...(dto.isMultiDay !== undefined && { isMultiDay: dto.isMultiDay }),
      ...(dto.ticketPrice !== undefined && {
        ticketPrice: dto.ticketPrice,
        isFree: dto.ticketPrice === 0,
      }),
      ...(dto.visibility === 'SELECTED_COLLEGES' && dto.selectedCollegeIds && {
        sharedWith: {
          create: dto.selectedCollegeIds.map(cid => ({ collegeId: cid })),
        },
      }),
      ...(dto.sessions && {
        sessions: {
          create: dto.sessions.map(s => ({
            title: s.title,
            startTime: new Date(s.startTime),
            endTime: new Date(s.endTime),
            venue: s.venue,
            speakerName: s.speakerName,
          })),
        },
      }),
    },
    include: {
      sessions: true,
      college: { select: { id: true, name: true } },
      club: { select: { id: true, name: true } },
    },
  });

  await prismaAdmin.auditLog.create({
    data: {
      userId: organizerContext.userId,
      eventId,
      action: 'EVENT_UPDATED',
      details: { fields: Object.keys(dto) },
    },
  });

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// getReadinessScore
// ─────────────────────────────────────────────────────────────────────────────

export async function getReadinessScore(
  eventId: string,
  organizerContext: { userId: string; collegeId: string },
) {
  const event = await prismaAdmin.event.findFirst({
    where: { id: eventId, collegeId: organizerContext.collegeId },
    include: {
      sessions: { select: { id: true } },
      college: { include: { razorpayAccount: true } },
    },
  });

  if (!event) {
    throw buildAppError('Event not found', 404);
  }

  const checks = {
    title: !!event.title,
    description: !!event.description,
    banner: !!event.bannerUrl,
    dates: !!event.startDate && !!event.endDate,
    location: !!event.venue || !!event.onlineLink,
    capacity: !!event.maxCapacity,
    payment: event.isFree
      ? true
      : !!(event.college.razorpayAccount?.isVerified),
    sessions: event.sessions.length > 0,
  };

  const scoreMap = {
    title: 10,
    description: 10,
    banner: 10,
    dates: 15,
    location: 15,
    capacity: 10,
    payment: 20,
    sessions: 10,
  };

  const score = (Object.keys(checks) as Array<keyof typeof checks>).reduce((acc, key) => {
    return acc + (checks[key] ? scoreMap[key] : 0);
  }, 0);

  // Persist score
  await prismaAdmin.event.update({
    where: { id: eventId },
    data: { readinessScore: score },
  });

  return {
    score,
    checks,
    canPublish: score >= 60,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// publishEvent
// ─────────────────────────────────────────────────────────────────────────────

export async function publishEvent(
  eventId: string,
  organizerContext: { userId: string; collegeId: string },
) {
  const event = await prismaAdmin.event.findFirst({
    where: { id: eventId, collegeId: organizerContext.collegeId },
  });

  if (!event) {
    throw buildAppError('Event not found', 404);
  }

  if (event.status !== 'DRAFT') {
    throw buildAppError('Only draft events can be published', 400);
  }

  // Check readiness
  const readiness = await getReadinessScore(eventId, organizerContext);
  if (!readiness.canPublish) {
    throw buildAppError(`Complete the readiness checklist before publishing (score: ${readiness.score}/100, minimum: 60)`, 400);
  }

  const updated = await prismaAdmin.event.update({
    where: { id: eventId },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });

  await prismaAdmin.auditLog.create({
    data: {
      userId: organizerContext.userId,
      eventId,
      action: 'EVENT_PUBLISHED',
    },
  });

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// cancelEvent
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelEvent(
  eventId: string,
  organizerContext: { userId: string; collegeId: string },
) {
  const event = await prismaAdmin.event.findFirst({
    where: { id: eventId, collegeId: organizerContext.collegeId },
  });

  if (!event) {
    throw buildAppError('Event not found', 404);
  }

  if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
    throw buildAppError('Event is already cancelled or completed', 400);
  }

  // Get all paid registrations and mark as refunded
  const paidRegistrations = await prismaAdmin.registration.findMany({
    where: { eventId, paymentStatus: 'PAID' },
    include: { payment: true },
  });

  for (const reg of paidRegistrations) {
    if (reg.payment) {
      await prismaAdmin.payment.update({
        where: { id: reg.payment.id },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      });
    }
  }

  const updated = await prismaAdmin.event.update({
    where: { id: eventId },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });

  await prismaAdmin.auditLog.create({
    data: {
      userId: organizerContext.userId,
      eventId,
      action: 'EVENT_CANCELLED',
      details: { refundedCount: paidRegistrations.length },
    },
  });

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// deleteEvent
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteEvent(
  eventId: string,
  organizerContext: { userId: string; collegeId: string },
) {
  const event = await prismaAdmin.event.findFirst({
    where: { id: eventId, collegeId: organizerContext.collegeId },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) {
    throw buildAppError('Event not found', 404);
  }

  if (event.status !== 'DRAFT') {
    throw buildAppError('Only draft events can be deleted', 400);
  }

  if (event._count.registrations > 0) {
    throw buildAppError('Cannot delete an event that has registrations', 400);
  }

  await prismaAdmin.event.delete({ where: { id: eventId } });

  return { deleted: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// getOrgEvents — all events for organiser's college (all statuses)
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrgEvents(
  organizerContext: { collegeId: string },
  query: EventQueryDto,
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;
  const skip = (page - 1) * limit;

  const where: any = {
    collegeId: organizerContext.collegeId,
    ...(query.search && {
      OR: [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ],
    }),
    ...(query.category && { category: query.category }),
    ...(query.format && { format: query.format }),
    ...(query.status && { status: query.status }),
    ...(query.isFree !== undefined && { isFree: query.isFree }),
    ...(query.startDateFrom && { startDate: { gte: new Date(query.startDateFrom) } }),
    ...(query.startDateTo && { startDate: { lte: new Date(query.startDateTo) } }),
  };

  const [events, total] = await Promise.all([
    prismaAdmin.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      include: {
        college: { select: { id: true, name: true, logoUrl: true } },
        club: { select: { id: true, name: true } },
        _count: { select: { registrations: true } },
      },
    }),
    prismaAdmin.event.count({ where }),
  ]);

  return {
    events,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// getEventStats — live stats for the management hub
// ─────────────────────────────────────────────────────────────────────────────

export async function getEventStats(
  eventId: string,
  organizerContext: { collegeId: string },
) {
  const event = await prismaAdmin.event.findFirst({
    where: { id: eventId, collegeId: organizerContext.collegeId },
  });

  if (!event) {
    throw buildAppError('Event not found', 404);
  }

  const [registrationStats, recentCheckIns] = await Promise.all([
    prismaAdmin.registration.groupBy({
      by: ['status'],
      where: { eventId },
      _count: { status: true },
    }),
    prismaAdmin.scanLog.findMany({
      where: {
        registration: { eventId },
        result: 'SUCCESS',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        registration: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
    }),
  ]);

  // Calculate revenue from paid registrations
  const paidRegs = await prismaAdmin.registration.findMany({
    where: { eventId, paymentStatus: 'PAID' },
    include: { payment: { select: { amount: true } } },
  });

  const revenue = paidRegs.reduce((sum, reg) => {
    return sum + (reg.payment ? Number(reg.payment.amount) : 0);
  }, 0);

  const counts = {
    REGISTERED: 0,
    WAITLISTED: 0,
    CANCELLED: 0,
    CHECKED_IN: 0,
  };

  for (const row of registrationStats) {
    counts[row.status] = row._count.status;
  }

  const totalRegistrations = counts.REGISTERED + counts.CHECKED_IN;
  const checkInRate = totalRegistrations > 0
    ? Math.round((counts.CHECKED_IN / totalRegistrations) * 100)
    : 0;

  return {
    totalRegistrations,
    checkedIn: counts.CHECKED_IN,
    waitlisted: counts.WAITLISTED,
    cancelled: counts.CANCELLED,
    revenue,
    checkInRate,
    recentCheckIns,
  };
}
