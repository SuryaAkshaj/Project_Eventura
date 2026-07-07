import { prismaAdmin } from '@config/database';
import { AppError } from '@shared/errors/AppError';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './events.types';
import { getDeadlineStatus } from '@shared/utils/deadline';
import {
  withCache, CacheKeys, CACHE_TTL,
  invalidateEventListCache, invalidateEventCache
} from '@shared/utils/cache';
import { getPagination } from '@shared/utils/pagination';
import { EVENT_LIST_SELECT } from './event.selects';

// ─────────────────────────────────────────────────────────────────────────────
// Visibility filter — builds a Prisma OR condition for which events are visible
// ─────────────────────────────────────────────────────────────────────────────

function visibilityWhere(userContext: { collegeId: string | null; role: string }) {
  const OR: object[] = [
    { visibility: 'PUBLIC' },
    // Open Mode events — always visible to everyone (no college)
    { collegeId: null, visibility: 'PUBLIC' },
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
  const { page, limit, skip } = getPagination(query as any);

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
  if (query.category) {
    where.category = {
      contains: query.category,
      mode: 'insensitive',
    };
  }
  if (query.format) where.format = query.format;
  if (query.isFree !== undefined) where.isFree = query.isFree;
  // Only apply date filters if caller explicitly requests a date range
  if (query.startDateFrom) where.startDate = { ...where.startDate, gte: new Date(query.startDateFrom) };
  if (query.startDateTo) where.startDate = { ...where.startDate, lte: new Date(query.startDateTo) };

  // New filters
  if (query.city) {
    where.college = { ...where.college, city: { contains: query.city, mode: 'insensitive' } };
  }
  if (query.state) {
    where.college = { ...where.college, state: { equals: query.state, mode: 'insensitive' } };
  }
  if (query.collegeId) {
    where.collegeId = query.collegeId;
  }
  if (query.hasPrize) {
    where.prizePool = { gt: 0 };
  }
  if (query.minPrize) {
    where.prizePool = { gte: Number(query.minPrize) };
  }
  if (query.closingSoon) {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    // Merge with existing AND if present
    const closingFilter = {
      OR: [
        { registrationDeadline: { gte: now, lte: sevenDaysLater } },
        { AND: [{ registrationDeadline: null }, { startDate: { gte: now, lte: sevenDaysLater } }] },
      ]
    };
    if (where.AND) {
      where.AND.push(closingFilter);
    } else {
      where.AND = [{ OR: visibilityWhere(userContext) }, closingFilter];
      delete where.OR;
    }
  }
  // Filter by eventType
  if (query.eventType) {
    where.eventType = query.eventType as any;
  }
  if (query.isFest) {
    where.eventType = 'FEST';
  }
  // Exclude sub-events from main listing (sub-events appear on parent fest page)
  where.parentEventId = null;

  const cacheKey = CacheKeys.eventList(
    userContext.collegeId || 'public',
    page,
    JSON.stringify({ category: query.category, format: query.format, isFree: query.isFree })
  );

  return withCache(cacheKey, CACHE_TTL.EVENT_LIST, async () => {
    const [events, total] = await Promise.all([
      prismaAdmin.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy ?? 'startDate']: query.sortOrder ?? 'asc' },
        select: EVENT_LIST_SELECT,
      }),
      prismaAdmin.event.count({ where }),
    ]);

    // Attach deadline status to each event
    const eventsWithDeadline = events.map(event => ({
      ...event,
      deadlineStatus: getDeadlineStatus({
        registrationDeadline: event.registrationDeadline,
        startDate: event.startDate,
      })
    }));

    return {
      events: eventsWithDeadline,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });
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
      college: { select: { id: true, name: true, logoUrl: true, city: true, state: true, slug: true } },
      club: { select: { id: true, name: true, logoUrl: true } },
      sharedWith: { select: { collegeId: true } },
      _count: { select: { registrations: true, subEvents: true } },
      // Include sub-events for Fests
      subEvents: {
        where: { status: 'PUBLISHED' },
        include: {
          _count: { select: { registrations: true } },
        },
        orderBy: { startDate: 'asc' },
      },
      // Include parent event for sub-events
      parentEvent: {
        select: { id: true, title: true, eventType: true }
      },
    },
  });

  if (!event) {
    throw AppError.notFound('Event not found');
  }

  // Visibility check
  const isPublic = event.visibility === 'PUBLIC';
  const isAllPlatform = event.visibility === 'ALL_PLATFORM' && !!userContext.collegeId;
  const isMyCollege = event.visibility === 'ONLY_MY_COLLEGE' && event.collegeId === userContext.collegeId;
  const isShared =
    event.visibility === 'SELECTED_COLLEGES' &&
    (event.sharedWith as Array<{ collegeId: string }>).some((s: { collegeId: string }) => s.collegeId === userContext.collegeId);
  const isOwnCollege = event.collegeId === userContext.collegeId;

  // Published check — organisers of the same college can see drafts
  const canSee =
    isPublic || isAllPlatform || isMyCollege || isShared ||
    (isOwnCollege && event.status !== 'CANCELLED');

  if (!canSee && event.status !== 'PUBLISHED') {
    throw AppError.notFound('Event not found');
  }

  return event;
}

// ─────────────────────────────────────────────────────────────────────────────
// createEvent
// ─────────────────────────────────────────────────────────────────────────────

export async function createEvent(
  dto: CreateEventDto,
  organizerContext: { userId: string; collegeId: string | null; clubId?: string | null; accountMode?: string | null },
) {
  // ── Open Mode: create event without a college ─────────────────────────────
  if (organizerContext.accountMode === 'OPEN') {
    const event = await prismaAdmin.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        eventType: (dto.eventType ?? 'OTHER') as any,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        venue: dto.venue,
        onlineLink: dto.onlineLink,
        isFree: dto.isFree ?? ((dto.ticketPrice ?? 0) === 0),
        ticketPrice: dto.ticketPrice ?? 0,
        maxCapacity: dto.maxCapacity,
        visibility: 'PUBLIC',         // Open Mode events are always public
        status: 'PUBLISHED',          // Open Mode events publish instantly
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : undefined,
        prizePool: dto.prizePool ?? undefined,
        category: dto.category,
        format: dto.format,
        bannerUrl: dto.bannerUrl,
        createdById: organizerContext.userId,
        publishedAt: new Date(),
        // collegeId is NULL for Open Mode events
      },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    // Audit log
    await prismaAdmin.auditLog.create({
      data: {
        userId: organizerContext.userId,
        eventId: event.id,
        action: 'EVENT_CREATED',
        details: { title: event.title, mode: 'OPEN' },
      },
    });

    return event;
  }

  // ── College Mode: existing logic unchanged ───────────────────────────────
  const collegeId = organizerContext.collegeId!;
  if (dto.clubId) {
    const club = await prismaAdmin.club.findFirst({
      where: { id: dto.clubId, collegeId },
    });
    if (!club) {
      throw AppError.badRequest('Club does not belong to your college');
    }
  }

  const event = await prismaAdmin.event.create({
    data: {
      title: dto.title,
      description: dto.description,
      bannerUrl: dto.bannerUrl,
      collegeId,
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
      prizePool: dto.prizePool ?? undefined,
      registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : undefined,
      teamSizeMin: dto.teamSizeMin ?? undefined,
      teamSizeMax: dto.teamSizeMax ?? undefined,
      contactEmail: dto.contactEmail ?? undefined,
      contactPhone: dto.contactPhone ?? undefined,
      // Event type system
      eventType: (dto.eventType ?? 'OTHER') as any,
      parentEventId: dto.parentEventId ?? null,
      // Fest-specific
      accommodation: dto.accommodation ?? false,
      accommodationInfo: dto.accommodationInfo,
      guestPerformers: dto.guestPerformers,
      sponsorNames: dto.sponsorNames,
      festEdition: dto.festEdition,
      // Competition-specific
      competitionRules: dto.competitionRules,
      judgingCriteria: dto.judgingCriteria,
      submissionFormat: dto.submissionFormat,
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

  await invalidateEventListCache(collegeId);

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
    throw AppError.notFound('Event not found or you do not have permission to edit it');
  }

  if (existing.status === 'CANCELLED' || existing.status === 'COMPLETED') {
    throw AppError.badRequest('Cannot edit a cancelled or completed event');
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
      ...(dto.prizePool !== undefined && { prizePool: dto.prizePool }),
      ...(dto.registrationDeadline !== undefined && {
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : null,
      }),
      ...(dto.teamSizeMin !== undefined && { teamSizeMin: dto.teamSizeMin }),
      ...(dto.teamSizeMax !== undefined && { teamSizeMax: dto.teamSizeMax }),
      ...(dto.contactEmail !== undefined && { contactEmail: dto.contactEmail }),
      ...(dto.contactPhone !== undefined && { contactPhone: dto.contactPhone }),
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

  await invalidateEventListCache(organizerContext.collegeId);
  await invalidateEventCache(eventId);

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// getSubEvents — fetch published sub-events for a fest
// ─────────────────────────────────────────────────────────────────────────────

export async function getSubEvents(parentEventId: string) {
  return prismaAdmin.event.findMany({
    where: {
      parentEventId,
      status: 'PUBLISHED',
    },
    include: {
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: 'asc' },
  });
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
      _count: { select: { subEvents: true } },
    },
  });

  if (!event) {
    throw AppError.notFound('Event not found');
  }

  const checks: Record<string, boolean> = {
    title: !!event.title,
    description: !!event.description,
    banner: !!event.bannerUrl,
    dates: !!event.startDate && !!event.endDate,
    location: !!event.venue || !!event.onlineLink,
    capacity: !!event.maxCapacity,
    payment: event.isFree
      ? true
      : !!(event.college?.razorpayAccount?.isVerified),
    // Type-specific checks:
    sessions: event.eventType === 'FEST'
      ? (event._count.subEvents > 0 || event.sessions.length > 0)
      : event.sessions.length > 0,
    rules: event.eventType === 'COMPETITION'
      ? !!event.competitionRules
      : true, // Not required for non-competitions
    registrationDeadline: !!event.registrationDeadline,
  };

  const scoreMap: Record<string, number> = {
    title: 10,
    description: 10,
    banner: 10,
    dates: 15,
    location: 15,
    capacity: 10,
    payment: 15,
    sessions: 10,
    rules: 5,
    registrationDeadline: 5,
  };

  const score = Object.entries(checks).reduce((sum, [key, passed]) => {
    return sum + (passed ? (scoreMap[key] || 0) : 0);
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
    eventType: event.eventType,
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
    throw AppError.notFound('Event not found');
  }

  if (event.status !== 'DRAFT') {
    throw AppError.badRequest('Only draft events can be published');
  }

  // Check readiness
  const readiness = await getReadinessScore(eventId, organizerContext);
  if (!readiness.canPublish) {
    throw AppError.badRequest(`Complete the readiness checklist before publishing (score: ${readiness.score}/100, minimum: 60)`);
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

  await invalidateEventListCache(organizerContext.collegeId);
  await invalidateEventCache(eventId);

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
    throw AppError.notFound('Event not found');
  }

  if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
    throw AppError.badRequest('Event is already cancelled or completed');
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

  await invalidateEventListCache(organizerContext.collegeId);
  await invalidateEventCache(eventId);

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
    throw AppError.notFound('Event not found');
  }

  if (event.status !== 'DRAFT') {
    throw AppError.badRequest('Only draft events can be deleted');
  }

  if (event._count.registrations > 0) {
    throw AppError.badRequest('Cannot delete an event that has registrations');
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
  const { page, limit, skip } = getPagination(query as any);

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
    throw AppError.notFound('Event not found');
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
