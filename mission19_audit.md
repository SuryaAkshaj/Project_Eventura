# Mission 19 Audit — Event Types, Sub-Events & Adaptive Creation Wizard

## Migration
- Migration `20260624135306_add_event_type_and_sub_events` applied successfully
- Added `EventType` enum: FEST, COMPETITION, WORKSHOP, SEMINAR, OTHER
- Added `parentEventId` self-referential relation on `Event` with cascade delete
- Added fest-specific fields: `accommodation`, `accommodationInfo`, `guestPerformers`, `sponsorNames`, `festEdition`
- Added competition-specific fields: `competitionRules`, `judgingCriteria`, `submissionFormat`
- Added indexes on `parentEventId` and `eventType`

## Backend Changes

### events.service.ts
- `getEventById`: Updated include to add `subEvents` (PUBLISHED, ordered by startDate), `parentEvent` (id/title/eventType), `_count.subEvents`, extended college select
- `createEvent`: Added all new fields to data object (eventType, parentEventId, accommodation, festEdition, competitionRules, etc.)
- `getEvents`: Added `eventType` and `isFest` filter support; added `parentEventId = null` to exclude sub-events from main listing
- `getReadinessScore`: Made type-aware — FEST checks sub-events count, COMPETITION requires rules; scoring weights adjusted to sum to 100
- `getSubEvents`: New function to fetch published sub-events for a given parentEventId

### events.types.ts
- Extended `CreateEventDto` with all new fields (eventType, parentEventId, fest-specific, competition-specific)
- Extended `EventQueryDto` with `eventType` and `isFest` filters

### events.validation.ts
- Extended `eventBaseSchema` with all new Zod validations
- Extended `eventQuerySchema` with `eventType` and `isFest`

### events.routes.ts
- Added `GET /:id/sub-events` public route (placed before `/:id` to avoid conflict)
- Added `import * as eventsService` for the inline route handler

## Frontend Changes

### lib/api/events.api.ts
- Extended `EventQuery` with `eventType`, `isFest`
- Extended `CreateEventPayload` with all new type system fields
- Added `getSubEvents(eventId)` API function
- Added `getOrgFests()` convenience function

### app/(organiser)/org/events/create/page.tsx
- Complete rewrite with pre-wizard **Event Type Selector screen** (4 option cards: FEST/COMPETITION/WORKSHOP/SEMINAR)
- Added `eventType` state and derived helpers (`isFest`, `isCompetition`)
- Wrapped with `<Suspense>` for `useSearchParams()` compatibility
- Conditional fields in Step 2: Prize Pool, Team Size, Competition Rules (only COMPETITION); Accommodation, Fest Edition, Guest Performers (only FEST)
- `?parentId` query param support: auto-selects COMPETITION type and pre-fills parentEventId, shows parent fest banner
- Submit payload is type-aware (only sends relevant fields per type)

### app/(attendee)/events/[id]/page.tsx
- Added `subEvents` state
- Fetches sub-events via `eventsApi.getSubEvents` when `event.eventType === 'FEST'`
- Sub-events section with emoji icons, registration count, prize pool, ticket price
- Accommodation banner (blue) for FEST with accommodation
- Guest Performers section (purple) for FEST
- Competition Rules section for COMPETITION events

### app/(organiser)/org/events/[id]/manage/page.tsx
- Added `subEvents` state
- Fetches sub-events for FEST events on load
- Sub-events management section: lists existing sub-events with emoji icons, manage links
- "Add Competition / Workshop" button linking to `/org/events/create?parentId=...&parentTitle=...`

### app/(attendee)/events/page.tsx
- Added `eventTypeFilter` state
- Event Type filter chips: 🎥 Fests, 🏆 Competitions, 🛠️ Workshops, 🎤 Seminars (toggle behavior)
- Event type badges on cards (`bg-purple-100`, `bg-amber-100`, `bg-green-100`, `bg-blue-100`)
- Included `eventTypeFilter` in React Query key and API call

## TypeScript Status
- Frontend: ✅ 0 errors
- Backend: Fixed 2 errors (removed non-existent `slug` from parentEvent select; explicit type cast for sharedWith.some)
