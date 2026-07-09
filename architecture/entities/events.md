# Events & Sessions

Events are the core interactive elements on the Eventura platform. They range from simple one-hour webinars to massive 3-day multi-college Fests.

## Core Entities

### Event
The `Event` entity holds all metadata related to a gathering.
- **Tenant Constraints**: An Event *must* belong to a `College` (except in OPEN mode). It can optionally belong to a `Club`.
- **Visibility Options**: 
  - `ONLY_MY_COLLEGE`: Visible only to authenticated students of the parent college.
  - `SELECTED_COLLEGES`: Visible to specific shared colleges via `SharedEvent` pivot.
  - `ALL_PLATFORM`: Visible to any student on Eventura.
  - `PUBLIC`: Visible to unauthenticated guests (SEO indexed).
- **Types**: Fests, Competitions, Workshops, Seminars, etc.
- **Hierarchies**: The `parentEventId` allows grouping. E.g., a "Hackathon" event can be a sub-event of a larger "Tech Fest" parent event.

### EventSession
For multi-day or complex events, `EventSession` allows organizers to break down the agenda into discrete blocks (e.g., "Inauguration 10:00 AM", "Valedictory 5:00 PM").

### Readiness Score
To ensure high-quality listings, Eventura enforces a `readinessScore`. Organizers cannot transition an event from `DRAFT` to `PUBLISHED` until the score hits at least 60/100.
The score validates:
- Title, Description, Banner (+30)
- Dates & Venues (+30)
- Payment Gateway Integration (+15)
- Sessions/Agendas (+10)
- Deadlines & Rules (+15)
