# EVENTURA — ANTIGRAVITY MISSION 5B
## Wire Events Frontend to Real Backend

---

## CRITICAL RULES — READ BEFORE TOUCHING ANY FILE

1. **DO NOT modify any className, color, layout, font, or spacing** — the UI is pixel-perfect from Stitch. Only add state, handlers, and API calls.
2. **DO NOT modify any backend files** — backend is complete and working.
3. **DO NOT modify any auth files** — auth is complete and working.
4. **DO NOT delete `lib/mockData.ts`** — other pages still use it.
5. **Only touch the files explicitly listed at the bottom of this prompt.**

---

## PROJECT CONTEXT

### Backend confirmed working (tested endpoints):
```
GET  /events                    → paginated events list with visibility filtering ✅
GET  /events/:id                → single event with sessions, college, club ✅
GET  /events/org/my-events      → organiser's events (all statuses) ✅
GET  /events/:id/readiness      → readiness score + checks ✅
GET  /events/:id/stats          → live event stats ✅
POST /events                    → create event ✅
PATCH /events/:id               → update event ✅
POST /events/:id/publish        → publish event ✅
POST /events/:id/cancel         → cancel event ✅
DELETE /events/:id              → delete draft event ✅
GET  /colleges/approved         → list of approved colleges ✅
GET  /colleges/:id/clubs        → clubs for a college ✅
```

### Confirmed API response shapes:

**GET /events response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "TechFest 2026",
      "description": "...",
      "bannerUrl": null,
      "category": "Technical",
      "format": "In-Person",
      "venue": "Woxsen University Main Auditorium",
      "startDate": "2026-05-30T...",
      "endDate": "2026-05-31T...",
      "ticketPrice": "0",
      "isFree": true,
      "status": "PUBLISHED",
      "visibility": "ALL_PLATFORM",
      "maxCapacity": 500,
      "college": { "name": "Woxsen University", "logoUrl": null },
      "club": { "name": "Tech Club", "logoUrl": null },
      "_count": { "registrations": 0 }
    }
  ],
  "meta": { "total": 4, "page": 1, "limit": 12, "totalPages": 1 }
}
```

**GET /events/:id response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "sessions": [
      { "id": "uuid", "title": "Opening Keynote", "startTime": "...", "endTime": "...", "speakerName": "Dr. Rajesh Kumar" }
    ],
    "college": { "name": "Woxsen University", "logoUrl": null },
    "club": { "name": "Tech Club", "logoUrl": null },
    "_count": { "registrations": 0 },
    "readinessScore": 90
  }
}
```

### What exists in frontend:
- `eventura/lib/store/authStore.ts` — Zustand auth store ✅
- `eventura/lib/api/client.ts` — Axios client with JWT interceptor ✅
- `eventura/lib/api/auth.api.ts` — Auth API functions ✅
- `eventura/lib/mockData.ts` — Mock data (DO NOT DELETE)
- `eventura/app/(attendee)/events/page.tsx` — Events discovery page (mock data)
- `eventura/app/(attendee)/events/[id]/page.tsx` — Event detail page (mock data)
- `eventura/app/(attendee)/dashboard/page.tsx` — Attendee dashboard (mock data)
- `eventura/app/(organiser)/org/dashboard/page.tsx` — Organiser dashboard (mock data)
- `eventura/app/(organiser)/org/events/create/page.tsx` — Event creator wizard (mock data)
- `eventura/app/(organiser)/org/events/[id]/readiness/page.tsx` — Readiness checklist (mock data)
- `eventura/app/(organiser)/org/events/[id]/manage/page.tsx` — Live management hub (mock data)

---

## PART 1 — CREATE EVENTS API CLIENT

Create `eventura/lib/api/events.api.ts`:

```typescript
import apiClient from './client';

export interface EventQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  format?: string;
  isFree?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  bannerUrl?: string;
  clubId?: string;
  visibility: 'ONLY_MY_COLLEGE' | 'SELECTED_COLLEGES' | 'ALL_PLATFORM' | 'PUBLIC';
  category?: string;
  format?: string;
  venue?: string;
  onlineLink?: string;
  startDate: string;
  endDate: string;
  timezone?: string;
  maxCapacity?: number;
  isMultiDay?: boolean;
  ticketPrice?: number;
  selectedCollegeIds?: string[];
  sessions?: { title: string; startTime: string; endTime: string; venue?: string; speakerName?: string }[];
}

export const eventsApi = {
  // Public / Attendee
  getEvents: (query?: EventQuery) =>
    apiClient.get('/events', { params: query }),

  getEventById: (id: string) =>
    apiClient.get(`/events/${id}`),

  // Organiser
  getOrgEvents: (query?: EventQuery) =>
    apiClient.get('/events/org/my-events', { params: query }),

  createEvent: (payload: CreateEventPayload) =>
    apiClient.post('/events', payload),

  updateEvent: (id: string, payload: Partial<CreateEventPayload>) =>
    apiClient.patch(`/events/${id}`, payload),

  publishEvent: (id: string) =>
    apiClient.post(`/events/${id}/publish`),

  cancelEvent: (id: string) =>
    apiClient.post(`/events/${id}/cancel`),

  deleteEvent: (id: string) =>
    apiClient.delete(`/events/${id}`),

  getReadiness: (id: string) =>
    apiClient.get(`/events/${id}/readiness`),

  getEventStats: (id: string) =>
    apiClient.get(`/events/${id}/stats`),

  // Colleges
  getApprovedColleges: () =>
    apiClient.get('/colleges/approved'),

  getClubsByCollege: (collegeId: string) =>
    apiClient.get(`/colleges/${collegeId}/clubs`),
};
```

---

## PART 2 — WIRE EVENTS DISCOVERY PAGE

File: `eventura/app/(attendee)/events/page.tsx`

This page has filters (search, category, format, free/paid) and a grid of event cards. Replace mock data with real API calls.

### Add `"use client"` at top if not already present.

### State to add:
```typescript
const [events, setEvents] = useState<any[]>([]);
const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState('');

// Filter state — these should already exist from Mission 1 filter persistence
const [search, setSearch] = useState('');
const [category, setCategory] = useState('');
const [format, setFormat] = useState('');
const [isFree, setIsFree] = useState<boolean | undefined>(undefined);
const [page, setPage] = useState(1);
```

### Fetch events function:
```typescript
const fetchEvents = async () => {
  setIsLoading(true);
  setError('');
  try {
    const response = await eventsApi.getEvents({
      page,
      limit: 12,
      search: search || undefined,
      category: category || undefined,
      format: format || undefined,
      isFree: isFree,
      sortBy: 'startDate',
      sortOrder: 'asc',
    });
    setEvents(response.data.data);
    setMeta(response.data.meta);
  } catch (err: any) {
    setError('Failed to load events. Please try again.');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchEvents();
}, [page, search, category, format, isFree]);
```

### Wire existing filter elements:
- Search input → `value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}`
- Category filter → wire to `setCategory` + `setPage(1)`
- Format filter → wire to `setFormat` + `setPage(1)`
- Free/Paid filter → wire to `setIsFree` + `setPage(1)`
- Clear filters button → reset all filter state + `setPage(1)`

### Wire event cards to real data:
Map `events` array to existing event card components. Map these fields:
- `event.title` → card title
- `event.college?.name` → organiser name
- `event.category` → category badge
- `event.format` → format badge
- `event.startDate` → formatted date (use `new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })`)
- `event.venue || event.onlineLink || 'Online'` → location
- `event.isFree ? 'Free' : '₹' + event.ticketPrice` → price display
- `event._count?.registrations` → registration count
- `event.maxCapacity` → capacity
- Card `onClick` or link → `href={/events/${event.id}}`

### Loading state:
When `isLoading` is true → show skeleton cards in place of event cards. Use existing card dimensions with `animate-pulse bg-gray-200` for skeleton effect.

### Empty state:
When `events.length === 0` and not loading → show "No events found" message with a "Clear filters" button.

### Error state:
When `error` is set → show error message with a "Try again" button that calls `fetchEvents()`.

### Pagination:
If `meta.totalPages > 1` → show pagination controls using existing button styling:
- Previous button → `setPage(p => Math.max(1, p - 1))`
- Next button → `setPage(p => Math.min(meta.totalPages, p + 1))`
- Show "Page X of Y" text

---

## PART 3 — WIRE EVENT DETAIL PAGE

File: `eventura/app/(attendee)/events/[id]/page.tsx`

This page shows full event details. Replace mock data with real API call.

### Add `"use client"` at top if not already present.

### State to add:
```typescript
const [event, setEvent] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState('');
const [isPurchased, setIsPurchased] = useState(false);
const params = useParams();
```

### Fetch event:
```typescript
useEffect(() => {
  const fetchEvent = async () => {
    try {
      const response = await eventsApi.getEventById(params.id as string);
      setEvent(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Event not found');
      } else {
        setError('Failed to load event');
      }
    } finally {
      setIsLoading(false);
    }
  };
  fetchEvent();
}, [params.id]);
```

### Wire real data to existing UI elements:
- `event.title` → page title and hero title
- `event.description` → description section
- `event.college?.name` → organiser name
- `event.club?.name` → club name (show only if not null)
- `event.category` → category badge
- `event.format` → format badge
- `event.venue` → venue display
- `event.startDate` → formatted start date/time
- `event.endDate` → formatted end date/time
- `event.maxCapacity` → capacity
- `event._count?.registrations` → registered count
- `event.isFree ? 'Free' : '₹' + event.ticketPrice` → price
- `event.sessions` → map to schedule/sessions section
- `event.status` → show status badge (DRAFT shows warning, CANCELLED shows cancelled banner)

### Registration button:
- If `event.isFree` → button shows "Register for Free"
- If not `event.isFree` → button shows `"Register — ₹${event.ticketPrice}"`
- If `event.status !== 'PUBLISHED'` → button is disabled with text "Registration Closed"
- If `isPurchased` → show "You're registered! View ticket →" linking to `/my-tickets`
- onClick → for now just set `setIsPurchased(true)` (real registration comes in Mission 6)

### Loading state:
While loading → show skeleton matching the event detail layout with `animate-pulse`.

### Error state:
If `error` → show error message with "Back to Events" link.

### Back button:
Wire to `router.back()` or `href="/events"`.

---

## PART 4 — WIRE ATTENDEE DASHBOARD

File: `eventura/app/(attendee)/dashboard/page.tsx`

The dashboard has an upcoming events section. Replace mock events with real API call showing upcoming events.

### Add to existing state:
```typescript
const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
const [isLoadingEvents, setIsLoadingEvents] = useState(true);
const { user, activeRole } = useAuthStore();
```

### Fetch upcoming events:
```typescript
useEffect(() => {
  const fetchUpcoming = async () => {
    try {
      const response = await eventsApi.getEvents({
        limit: 3,
        sortBy: 'startDate',
        sortOrder: 'asc',
        startDateFrom: new Date().toISOString(),
      });
      setUpcomingEvents(response.data.data);
    } catch (err) {
      console.error('Failed to fetch upcoming events', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };
  fetchUpcoming();
}, []);
```

### Wire user name:
- Find where the dashboard shows a greeting like "Welcome back, [Name]"
- Replace with `Welcome back, ${user?.firstName || 'there'}!`

### Wire upcoming events section:
Map `upcomingEvents` to existing event card components exactly as in the events page.

---

## PART 5 — WIRE ORGANISER DASHBOARD

File: `eventura/app/(organiser)/org/dashboard/page.tsx`

The organiser dashboard shows stats and recent events. Replace mock data with real API calls.

### Add state:
```typescript
const [orgEvents, setOrgEvents] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);
const { user } = useAuthStore();
```

### Fetch org events:
```typescript
useEffect(() => {
  const fetchOrgData = async () => {
    try {
      const response = await eventsApi.getOrgEvents({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
      setOrgEvents(response.data.data);
    } catch (err) {
      console.error('Failed to fetch org events', err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchOrgData();
}, []);
```

### Wire stats cards to real data from org events:
Calculate from `orgEvents`:
- Total events → `orgEvents.length`
- Published → `orgEvents.filter(e => e.status === 'PUBLISHED').length`
- Draft → `orgEvents.filter(e => e.status === 'DRAFT').length`
- Total registrations → `orgEvents.reduce((sum, e) => sum + (e._count?.registrations || 0), 0)`

### Wire recent events list:
Map `orgEvents.slice(0, 5)` to existing event list items showing title, status badge, date.

### Wire organiser name:
Replace mock name with `user?.firstName + ' ' + user?.lastName`

### "Create Event" button:
Wire to `href="/org/events/create"`

---

## PART 6 — WIRE EVENT CREATOR WIZARD

File: `eventura/app/(organiser)/org/events/create/page.tsx`

This is a multi-step wizard. Wire the form submission to the real API.

### Add state for clubs dropdown:
```typescript
const [colleges, setColleges] = useState<any[]>([]);
const [clubs, setClubs] = useState<any[]>([]);
const { activeRole, collegeId } = useAuthStore();
```

### Fetch clubs for the organiser's college on mount:
```typescript
useEffect(() => {
  const fetchClubs = async () => {
    if (!collegeId) return;
    try {
      const response = await eventsApi.getClubsByCollege(collegeId);
      setClubs(response.data.data);
    } catch (err) {
      console.error('Failed to fetch clubs', err);
    }
  };
  fetchClubs();
}, [collegeId]);
```

### Wire club selection dropdown:
Map `clubs` array to the existing club selector in the wizard. Each option: `{ value: club.id, label: club.name }`

### Wire visibility selector to `selectedCollegeIds`:
When `SELECTED_COLLEGES` is chosen → fetch and show college multi-select:
```typescript
const fetchColleges = async () => {
  const response = await eventsApi.getApprovedColleges();
  setColleges(response.data.data);
};
```

### Wire final submit (last step of wizard):
Find the existing final submit button and add:
```typescript
const handleSubmit = async () => {
  setIsLoading(true);
  try {
    const payload = {
      title: formData.title,
      description: formData.description,
      clubId: formData.clubId || undefined,
      visibility: formData.visibility,
      category: formData.category,
      format: formData.format,
      venue: formData.venue,
      onlineLink: formData.onlineLink,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : undefined,
      ticketPrice: formData.ticketPrice ? Number(formData.ticketPrice) : 0,
      selectedCollegeIds: formData.selectedCollegeIds || [],
      sessions: formData.sessions || [],
    };
    const response = await eventsApi.createEvent(payload);
    const eventId = response.data.data.id;
    router.push(`/org/events/${eventId}/readiness`);
  } catch (err: any) {
    const message = err.response?.data?.error?.message || 'Failed to create event';
    setError(message);
  } finally {
    setIsLoading(false);
  }
};
```

---

## PART 7 — WIRE READINESS CHECKLIST PAGE

File: `eventura/app/(organiser)/org/events/[id]/readiness/page.tsx`

### Add state:
```typescript
const [readiness, setReadiness] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);
const [isPublishing, setIsPublishing] = useState(false);
const [error, setError] = useState('');
const params = useParams();
```

### Fetch readiness score:
```typescript
useEffect(() => {
  const fetchReadiness = async () => {
    try {
      const response = await eventsApi.getReadiness(params.id as string);
      setReadiness(response.data.data);
    } catch (err) {
      setError('Failed to load readiness data');
    } finally {
      setIsLoading(false);
    }
  };
  fetchReadiness();
}, [params.id]);
```

### Wire checklist items to real data:
Map `readiness.checks` to existing checklist UI:
- `checks.title` → Title check item
- `checks.description` → Description check item
- `checks.banner` → Banner check item
- `checks.dates` → Dates check item
- `checks.location` → Location check item
- `checks.capacity` → Capacity check item
- `checks.payment` → Payment check item
- `checks.sessions` → Sessions check item

Show green checkmark when `true`, red X when `false`.

### Wire readiness score display:
- Score number → `readiness.score`
- Score progress bar → width = `${readiness.score}%`
- Color: green if `>= 80`, yellow if `>= 60`, red if `< 60`

### Wire publish button:
```typescript
const handlePublish = async () => {
  if (!readiness?.canPublish) return;
  setIsPublishing(true);
  try {
    await eventsApi.publishEvent(params.id as string);
    router.push(`/org/events/${params.id}/manage`);
  } catch (err: any) {
    setError(err.response?.data?.error?.message || 'Failed to publish event');
  } finally {
    setIsPublishing(false);
  }
};
```

- Button disabled when `!readiness?.canPublish` or `isPublishing`
- Button text: "Publish Event" normally, "Publishing..." when loading

### "Edit Event" button:
Wire to `href={/org/events/${params.id}/edit}` (placeholder for now)

---

## PART 8 — WIRE LIVE MANAGEMENT HUB

File: `eventura/app/(organiser)/org/events/[id]/manage/page.tsx`

### Add state:
```typescript
const [event, setEvent] = useState<any>(null);
const [stats, setStats] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);
const params = useParams();
```

### Fetch event and stats:
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const [eventRes, statsRes] = await Promise.all([
        eventsApi.getEventById(params.id as string),
        eventsApi.getEventStats(params.id as string),
      ]);
      setEvent(eventRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch event data', err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();

  // Poll stats every 30 seconds for live updates
  const interval = setInterval(async () => {
    try {
      const statsRes = await eventsApi.getEventStats(params.id as string);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Stats poll failed', err);
    }
  }, 30000);

  return () => clearInterval(interval);
}, [params.id]);
```

### Wire stats cards to real data:
- Total registrations → `stats?.totalRegistrations || 0`
- Checked in → `stats?.checkedIn || 0`
- Waitlisted → `stats?.waitlisted || 0`
- Revenue → `stats?.revenue ? '₹' + stats.revenue : '₹0'`
- Check-in rate → `stats?.checkInRate ? stats.checkInRate.toFixed(1) + '%' : '0%'`

### Wire event title and details:
- Event title → `event?.title`
- Event date → formatted `event?.startDate`
- Event status badge → `event?.status`

### "Open Scanner" button:
Wire to `href={/org/events/${params.id}/scanner}`

### "View Attendees" button:
Wire to `href={/org/events/${params.id}/attendees}` (placeholder for Mission 6)

---

## PART 9 — UPDATE ORG EVENTS LIST PAGE

Check if `eventura/app/(organiser)/org/events/page.tsx` exists. If it does, wire it to real data using `eventsApi.getOrgEvents()`. If it doesn't exist, create it with:

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { eventsApi } from '@/lib/api/events.api';
import Link from 'next/link';

export default function OrgEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    eventsApi.getOrgEvents({ sortBy: 'createdAt', sortOrder: 'desc' })
      .then(res => setEvents(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Status badge colors matching existing design system
  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PUBLISHED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
  };

  return (
    // Use existing organiser layout styling
    // List of events with: title, status badge, date, registrations count
    // Each row links to /org/events/[id]/manage
    // "Create New Event" button → /org/events/create
    // Loading skeleton while fetching
  );
}
```

---

## VERIFICATION STEPS

Run all of these after completing. Do not stop until all pass:

1. `cd eventura && npx tsc --noEmit` → zero TypeScript errors
2. `npm run dev` → starts on port 3000 with no errors
3. Open `http://localhost:3000/events` → real events appear (not mock data)
4. Click a filter → events list updates with real filtered data
5. Click an event card → event detail page loads with real data including sessions
6. Open `http://localhost:3000/dashboard` → upcoming events show real data, user name shows real name
7. Login as organiser → open `http://localhost:3000/org/dashboard` → shows real org events and stats
8. Open `http://localhost:3000/org/events/create` → wizard loads, club dropdown populated with real clubs
9. Complete wizard → submits to real API → redirects to readiness page
10. Readiness page → shows real score and checklist items
11. Open `/org/events/[id]/manage` with a real event ID → shows real stats, polls every 30s

---

## FILES ALLOWED TO TOUCH — COMPLETE LIST

**Create new:**
- `lib/api/events.api.ts`
- `app/(organiser)/org/events/page.tsx` (only if it doesn't exist)

**Modify existing (wire API only — no style changes):**
- `app/(attendee)/events/page.tsx`
- `app/(attendee)/events/[id]/page.tsx`
- `app/(attendee)/dashboard/page.tsx`
- `app/(organiser)/org/dashboard/page.tsx`
- `app/(organiser)/org/events/create/page.tsx`
- `app/(organiser)/org/events/[id]/readiness/page.tsx`
- `app/(organiser)/org/events/[id]/manage/page.tsx`

**Everything else → DO NOT TOUCH.**
