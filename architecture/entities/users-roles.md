# Users & Roles

Eventura employs a Multi-Tier Role-Based Access Control (RBAC) system. Unlike simple platforms where a user has one global role (e.g., "Admin" or "User"), Eventura users can hold multiple contextual roles across different colleges and clubs.

## Core Entities

### User
The `User` entity represents an authenticated individual on the platform.
- **Identifiers**: UUID, Email, Google OAuth ID, Public Username (`/u/username`).
- **Account Mode**: 
  - `COLLEGE`: Traditional student account requiring an approved college context.
  - `OPEN`: Guest account for attendees participating in public/Luma-style events.

### Role
The `Role` entity is a static enumeration of system-level archetypes.
1. `SUPER_ADMIN`: Manages the entire platform.
2. `COLLEGE_ADMIN`: Manages a specific college tenant.
3. `CLUB_PRESIDENT`: Manages a specific club within a college.
4. `EVENT_MANAGER`: Temporary access granted to staff for specific events (mainly for scanning QRs).
5. `ATTENDEE`: Default role.

### Permission
The `Permission` entity maps discrete actions (e.g., `events:write`, `scanner:use`, `finance:read`) to a specific `Role`.

### RoleAssignment
The `RoleAssignment` is the crucial pivot table that grants a `User` a specific `Role` within the scope of a `College` (and optionally a `Club`).

## Context Switching
Because a single User can be a `CLUB_PRESIDENT` at College A, and an `EVENT_MANAGER` at College B, the frontend relies on **Context Switching**.
- The API issues a JWT containing the user's *currently active context*.
- To perform actions as a Club President, the user selects that context in the UI, triggering a call to `/api/v1/auth/context-switch`.
- The API validates the `RoleAssignment` and issues a new JWT containing the selected `collegeId` and `role`.
