# EVENTURA — ANTIGRAVITY MISSION 5A
## Events Module: Complete Backend

---

## CRITICAL RULES — READ BEFORE TOUCHING ANY FILE

1. **DO NOT modify any existing files** except `src/app.ts` (one line addition only)
2. **DO NOT modify `prisma/schema.prisma`** — it is complete and migrated
3. **DO NOT run `prisma migrate`** — schema is already in the database
4. **DO NOT modify any auth module files** — auth is complete and working
5. **Only create new files inside `src/modules/events/` and `src/modules/colleges/`**

---

## PROJECT CONTEXT

### What exists and is working:
- Backend running on `http://localhost:4000`
- Auth fully working — JWT, RBAC middleware, tenant middleware all operational
- Database seeded with 3 colleges, 5 clubs, users with roles
- `src/modules/auth/` — complete, do not touch
- `src/modules/health/` — complete, do not touch
- `src/modules/colleges/colleges.routes.ts` — has one endpoint `GET /colleges/approved`, extend this file

### Confirmed working endpoints:
- `POST /auth/login` ✅
- `GET /colleges/approved` ✅

### Key middleware available (import and use these):
```typescript
import { authenticate } from '@middleware/auth.middleware';
import { requireRole, requirePermission } from '@middleware/rbac.middleware';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { apiResponse } from '@shared/utils/apiResponse';
import { prisma, prismaAdmin } from '@config/database';
```

### Confirmed Prisma models relevant to events:
```
Event, EventSession, SharedEvent, Registration, 
Waitlist, EventFeedback, College, Club, User
```

### Confirmed enums in schema:
```typescript
EventVisibility: ONLY_MY_COLLEGE | SELECTED_COLLEGES | ALL_PLATFORM | PUBLIC
EventStatus: DRAFT | PENDING_REVIEW | PUBLISHED | CANCELLED | COMPLETED
PaymentStatus: FREE | PENDING | PAID | FAILED | REFUNDED
RegistrationStatus: REGISTERED | WAITLISTED | CANCELLED | CHECKED_IN
```

---

## PART 1 — EVENTS MODULE STRUCTURE

Create these files inside `src/modules/events/`:

```
src/modules/events/
├── events.types.ts
├── events.validation.ts
├── events.service.ts
├── events.controller.ts
└── events.routes.ts
```

---

## PART 2 — EVENTS TYPES

### `src/modules/events/events.types.ts`

```typescript
export interface CreateEventDto {
  title: string;
  description?: string;
  bannerUrl?: string;
  clubId?: string;
  visibility: 'ONLY_MY_COLLEGE' | 'SELECTED_COLLEGES' | 'ALL_PLATFORM' | 'PUBLIC';
  category?: string;
  format?: string;
  venue?: string;
  onlineLink?: string;
  startDate: string;        // ISO string
  endDate: string;          // ISO string
  timezone?: string;
  maxCapacity?: number;
  isMultiDay?: boolean;
  ticketPrice?: number;
  selectedCollegeIds?: string[];   // For SELECTED_COLLEGES visibility
  sessions?: CreateSessionDto[];
}

export interface CreateSessionDto {
  title: string;
  startTime: string;
  endTime: string;
  venue?: string;
  speakerName?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface EventQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  format?: string;
  visibility?: string;
  status?: string;
  collegeId?: string;
  isFree?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: 'startDate' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}
```

---

## PART 3 — EVENTS VALIDATION

### `src/modules/events/events.validation.ts`

Use Zod for all validation:

```typescript
import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  bannerUrl: z.string().url().optional(),
  clubId: z.string().uuid().optional(),
  visibility: z.enum(['ONLY_MY_COLLEGE', 'SELECTED_COLLEGES', 'ALL_PLATFORM', 'PUBLIC']),
  category: z.string().optional(),
  format: z.enum(['In-Person', 'Online', 'Hybrid']).optional(),
  venue: z.string().optional(),
  onlineLink: z.string().url().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string().default('Asia/Kolkata'),
  maxCapacity: z.number().int().positive().optional(),
  isMultiDay: z.boolean().default(false),
  ticketPrice: z.number().min(0).default(0),
  selectedCollegeIds: z.array(z.string().uuid()).optional(),
  sessions: z.array(z.object({
    title: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    venue: z.string().optional(),
    speakerName: z.string().optional(),
  })).optional(),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
}).refine(data => {
  if (data.visibility === 'SELECTED_COLLEGES') {
    return data.selectedCollegeIds && data.selectedCollegeIds.length > 0;
  }
  return true;
}, {
  message: 'selectedCollegeIds is required when visibility is SELECTED_COLLEGES',
  path: ['selectedCollegeIds'],
});

export const updateEventSchema = createEventSchema.partial();

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  format: z.string().optional(),
  isFree: z.coerce.boolean().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  sortBy: z.enum(['startDate', 'createdAt', 'title']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
```

---

## PART 4 — EVENTS SERVICE

### `src/modules/events/events.service.ts`

Implement these functions using `prismaAdmin` for all queries (tenant filtering is handled manually via the JWT collegeId):

---

#### `getEvents(query: EventQueryDto, userContext: { collegeId: string; role: string })`

Returns paginated list of events visible to the user based on their role and college.

Visibility logic — an event is visible to a user if ANY of these are true:
- `event.visibility === 'PUBLIC'`
- `event.visibility === 'ALL_PLATFORM'` AND user is authenticated
- `event.visibility === 'ONLY_MY_COLLEGE'` AND `event.collegeId === userContext.collegeId`
- `event.visibility === 'SELECTED_COLLEGES'` AND a `SharedEvent` record exists with `collegeId === userContext.collegeId`

Only return events with `status === 'PUBLISHED'` unless the requester is the event organiser.

Apply filters from query: search (title/description ILIKE), category, format, isFree, startDateFrom, startDateTo.

Apply pagination: `skip = (page - 1) * limit`, `take = limit`.

Return:
```typescript
{
  events: Event[],  // with college and club names included
  meta: { total, page, limit, totalPages }
}
```

---

#### `getEventById(eventId: string, userContext: { collegeId: string; role: string })`

Returns single event with full details including:
- `sessions` (all EventSessions)
- `college` (name, logoUrl)
- `club` (name, logoUrl)
- `_count.registrations` (total registrations)
- `readinessScore`

Apply same visibility check as `getEvents`. Throw 404 if not found or not visible.

---

#### `createEvent(dto: CreateEventDto, organizerContext: { userId: string; collegeId: string; clubId?: string })`

- Validate `clubId` belongs to `organizerContext.collegeId` if provided
- Set `isFree: dto.ticketPrice === 0`
- Set `status: 'DRAFT'`
- Create event with `collegeId` from organizer context
- If `visibility === 'SELECTED_COLLEGES'` → create `SharedEvent` records for each `selectedCollegeId`
- If `sessions` provided → create `EventSession` records
- Create `AuditLog` entry: `action: 'EVENT_CREATED'`
- Return created event

---

#### `updateEvent(eventId: string, dto: UpdateEventDto, organizerContext: { userId: string; collegeId: string })`

- Verify event exists AND `event.collegeId === organizerContext.collegeId` (organiser can only edit their own college's events)
- Verify event status is not `CANCELLED` or `COMPLETED`
- If `visibility` changed to `SELECTED_COLLEGES` → delete existing `SharedEvent` records and create new ones
- If `sessions` provided → delete existing sessions and recreate
- Create `AuditLog` entry: `action: 'EVENT_UPDATED'`
- Return updated event

---

#### `publishEvent(eventId: string, organizerContext: { userId: string; collegeId: string })`

- Verify ownership
- Verify `status === 'DRAFT'`
- Check readiness score — if below 60, throw error with message "Complete the readiness checklist before publishing"
- Set `status: 'PUBLISHED'`, `publishedAt: new Date()`
- Create `AuditLog` entry: `action: 'EVENT_PUBLISHED'`
- Return updated event

---

#### `cancelEvent(eventId: string, organizerContext: { userId: string; collegeId: string })`

- Verify ownership
- Verify status is not already `CANCELLED` or `COMPLETED`
- Set `status: 'CANCELLED'`, `cancelledAt: new Date()`
- Get all PAID registrations for this event
- For each paid registration → update `Payment.status: 'REFUNDED'` (actual Razorpay refund comes in Mission 8)
- Create `AuditLog` entry: `action: 'EVENT_CANCELLED'`
- Return updated event

---

#### `deleteEvent(eventId: string, organizerContext: { userId: string; collegeId: string })`

- Verify ownership
- Only allow delete if `status === 'DRAFT'`
- Throw error if event has any registrations
- Delete event (cascade deletes sessions and shared events)
- Return `{ deleted: true }`

---

#### `getReadinessScore(eventId: string, organizerContext: { userId: string; collegeId: string })`

Calculates a 0-100 readiness score based on these checks:

| Check | Points |
|-------|--------|
| Title is set | 10 |
| Description is set | 10 |
| Banner image uploaded | 10 |
| Start and end date set | 15 |
| Venue or online link set | 15 |
| Max capacity set | 10 |
| If paid: Razorpay account connected and verified | 20 |
| At least one session defined | 10 |

Return:
```typescript
{
  score: number,          // 0-100
  checks: {
    title: boolean,
    description: boolean,
    banner: boolean,
    dates: boolean,
    location: boolean,
    capacity: boolean,
    payment: boolean,
    sessions: boolean,
  },
  canPublish: boolean     // score >= 60
}
```

Also update `event.readinessScore` in the database.

---

#### `getOrgEvents(organizerContext: { collegeId: string }, query: EventQueryDto)`

Returns all events for a college/club regardless of status (DRAFT, PUBLISHED, CANCELLED etc.).
Used for the organiser dashboard — they can see all their events.

---

#### `getEventStats(eventId: string, organizerContext: { collegeId: string })`

Returns live stats for the live management hub:
```typescript
{
  totalRegistrations: number,
  checkedIn: number,
  waitlisted: number,
  cancelled: number,
  revenue: number,           // sum of paid registrations
  checkInRate: number,       // percentage
  recentCheckIns: ScanLog[]  // last 10 check-ins
}
```

---

## PART 5 — EVENTS CONTROLLER

### `src/modules/events/events.controller.ts`

Wrap all service calls with `asyncHandler`. Use `apiResponse` for all responses.

```typescript
// Public / Attendee endpoints
export const getEvents = asyncHandler(async (req, res) => {
  const query = eventQuerySchema.parse(req.query);
  const userContext = {
    collegeId: req.user?.activeContext?.collegeId || null,
    role: req.user?.activeContext?.role || 'PUBLIC',
  };
  const result = await eventsService.getEvents(query, userContext);
  return apiResponse.paginated(res, result.events, result.meta);
});

export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userContext = {
    collegeId: req.user?.activeContext?.collegeId || null,
    role: req.user?.activeContext?.role || 'PUBLIC',
  };
  const event = await eventsService.getEventById(id, userContext);
  return apiResponse.success(res, event);
});

// Organiser endpoints (require authentication + organiser role)
export const createEvent = asyncHandler(async (req, res) => {
  const dto = createEventSchema.parse(req.body);
  const organizerContext = {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId,
    clubId: req.user!.activeContext.clubId,
  };
  const event = await eventsService.createEvent(dto, organizerContext);
  return apiResponse.created(res, event, 'Event created successfully');
});

export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dto = updateEventSchema.parse(req.body);
  const organizerContext = {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId,
  };
  const event = await eventsService.updateEvent(id, dto, organizerContext);
  return apiResponse.success(res, event, 'Event updated successfully');
});

export const publishEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await eventsService.publishEvent(id, {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId,
  });
  return apiResponse.success(res, event, 'Event published successfully');
});

export const cancelEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await eventsService.cancelEvent(id, {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId,
  });
  return apiResponse.success(res, event, 'Event cancelled');
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await eventsService.deleteEvent(id, {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId,
  });
  return apiResponse.success(res, result, 'Event deleted');
});

export const getReadinessScore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await eventsService.getReadinessScore(id, {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId,
  });
  return apiResponse.success(res, result);
});

export const getOrgEvents = asyncHandler(async (req, res) => {
  const query = eventQuerySchema.parse(req.query);
  const result = await eventsService.getOrgEvents(
    { collegeId: req.user!.activeContext.collegeId },
    query
  );
  return apiResponse.paginated(res, result.events, result.meta);
});

export const getEventStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stats = await eventsService.getEventStats(id, {
    collegeId: req.user!.activeContext.collegeId,
  });
  return apiResponse.success(res, stats);
});
```

---

## PART 6 — EVENTS ROUTES

### `src/modules/events/events.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import * as eventsController from './events.controller';

const router = Router();

// ─── Public / Attendee Routes ────────────────────────────────────────────────
// GET /events — browse all visible events (auth optional)
router.get('/', eventsController.getEvents);

// GET /events/:id — get single event detail (auth optional)
router.get('/:id', eventsController.getEventById);

// ─── Organiser Routes (require auth + organiser role) ─────────────────────────
// GET /events/org/my-events — get all events for my college/club
router.get(
  '/org/my-events',
  authenticate,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.getOrgEvents
);

// POST /events — create new event
router.post(
  '/',
  authenticate,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.createEvent
);

// PATCH /events/:id — update event
router.patch(
  '/:id',
  authenticate,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.updateEvent
);

// POST /events/:id/publish — publish event
router.post(
  '/:id/publish',
  authenticate,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.publishEvent
);

// POST /events/:id/cancel — cancel event
router.post(
  '/:id/cancel',
  authenticate,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.cancelEvent
);

// DELETE /events/:id — delete draft event
router.delete(
  '/:id',
  authenticate,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.deleteEvent
);

// GET /events/:id/readiness — get readiness score
router.get(
  '/:id/readiness',
  authenticate,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.getReadinessScore
);

// GET /events/:id/stats — get live event stats
router.get(
  '/:id/stats',
  authenticate,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT', 'EVENT_MANAGER'),
  eventsController.getEventStats
);

export default router;
```

---

## PART 7 — EXTEND COLLEGES ROUTES

Extend `src/modules/colleges/colleges.routes.ts` — **add to existing file, do not replace it:**

```typescript
// GET /colleges — get all colleges (Super Admin only)
router.get(
  '/',
  authenticate,
  requireRole('SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const colleges = await prismaAdmin.college.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { clubs: true, events: true } } }
    });
    return apiResponse.success(res, colleges);
  })
);

// GET /colleges/:id/clubs — get clubs for a college
router.get(
  '/:id/clubs',
  authenticate,
  asyncHandler(async (req, res) => {
    const clubs = await prismaAdmin.club.findMany({
      where: {
        collegeId: req.params.id,
        approvalStatus: 'APPROVED'
      },
      orderBy: { name: 'asc' }
    });
    return apiResponse.success(res, clubs);
  })
);
```

---

## PART 8 — REGISTER ROUTES IN APP.TS

Add to `src/app.ts` — **only these two lines, nothing else:**

```typescript
import eventsRoutes from '@modules/events/events.routes';
app.use('/events', eventsRoutes);
```

---

## PART 9 — SEED EVENTS DATA

The database currently has colleges and users but no events. Add seed events by running this script — create `prisma/seed-events.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedEvents() {
  // Get Woxsen college and its first club
  const woxsen = await prisma.college.findFirst({ 
    where: { name: 'Woxsen University' },
    include: { clubs: { where: { approvalStatus: 'APPROVED' } } }
  });
  
  if (!woxsen) {
    console.log('Woxsen college not found — run main seed first');
    return;
  }

  const club = woxsen.clubs[0];

  const events = await Promise.all([
    // Published free event — visible to all
    prisma.event.create({
      data: {
        title: 'TechFest 2026 — Annual Technology Festival',
        description: 'Join us for the biggest tech event of the year featuring workshops, hackathons, and speaker sessions from industry leaders.',
        collegeId: woxsen.id,
        clubId: club?.id,
        visibility: 'ALL_PLATFORM',
        status: 'PUBLISHED',
        category: 'Technical',
        format: 'In-Person',
        venue: 'Woxsen University Main Auditorium',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        maxCapacity: 500,
        ticketPrice: 0,
        isFree: true,
        readinessScore: 90,
        publishedAt: new Date(),
        sessions: {
          create: [
            { title: 'Opening Keynote', startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), speakerName: 'Dr. Rajesh Kumar' },
            { title: 'AI/ML Workshop', startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(), venue: 'Lab Block A' },
          ]
        }
      }
    }),

    // Published paid event — only my college
    prisma.event.create({
      data: {
        title: 'Design Thinking Bootcamp',
        description: 'A two-day immersive bootcamp on design thinking methodology and UX research techniques.',
        collegeId: woxsen.id,
        visibility: 'ONLY_MY_COLLEGE',
        status: 'PUBLISHED',
        category: 'Workshop',
        format: 'In-Person',
        venue: 'Design Studio, Block C',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        maxCapacity: 50,
        ticketPrice: 499,
        isFree: false,
        readinessScore: 85,
        publishedAt: new Date(),
      }
    }),

    // Draft event
    prisma.event.create({
      data: {
        title: 'Entrepreneurship Summit 2026',
        description: 'Connect with founders, investors, and mentors at our annual entrepreneurship summit.',
        collegeId: woxsen.id,
        visibility: 'ALL_PLATFORM',
        status: 'DRAFT',
        category: 'Networking',
        format: 'Hybrid',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
        maxCapacity: 200,
        ticketPrice: 999,
        isFree: false,
        readinessScore: 40,
      }
    }),
  ]);

  console.log(`✅ Seeded ${events.length} events`);
  await prisma.$disconnect();
}

seedEvents().catch(console.error);
```

Add to `package.json` scripts:
```json
"db:seed-events": "ts-node prisma/seed-events.ts"
```

Then run:
```bash
npm run db:seed-events
```

---

## VERIFICATION STEPS

Run these after completing everything. Do not stop until all pass:

1. `npx tsc --noEmit` → zero TypeScript errors
2. `npm run dev` → server starts with no errors
3. `npm run db:seed-events` → 3 events seeded successfully

Then test these endpoints (replace TOKEN with a real login token):

```bash
# Get login token first
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@woxsen.edu.in","password":"Test@1234"}' \
  | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).data.accessToken))")

echo "Token: $TOKEN"

# Test 1 — Get all events (public, no auth needed)
curl http://localhost:4000/events

# Test 2 — Get events with auth
curl http://localhost:4000/events \
  -H "Authorization: Bearer $TOKEN"

# Test 3 — Get single event (use an ID from Test 1 results)
curl http://localhost:4000/events/<EVENT_ID_FROM_TEST_1>

# Test 4 — Get org events (requires COLLEGE_ADMIN or CLUB_PRESIDENT role)
# Login as organiser first — use seed data organiser credentials
curl http://localhost:4000/events/org/my-events \
  -H "Authorization: Bearer $TOKEN"
```

All tests must return `{ "success": true, "data": [...] }` before proceeding to Mission 5B.

---

## FILES TO CREATE — COMPLETE LIST

**Create new:**
- `src/modules/events/events.types.ts`
- `src/modules/events/events.validation.ts`
- `src/modules/events/events.service.ts`
- `src/modules/events/events.controller.ts`
- `src/modules/events/events.routes.ts`
- `prisma/seed-events.ts`

**Modify existing (minimal changes only):**
- `src/app.ts` — add 2 lines only (import + app.use)
- `src/modules/colleges/colleges.routes.ts` — add 2 new routes only
- `package.json` — add 1 script only

**Everything else → DO NOT TOUCH.**
