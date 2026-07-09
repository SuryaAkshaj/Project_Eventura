# Security & Audits

Accountability and auditability are crucial in a B2B SaaS environment. Eventura maintains several ledgers and logs to track system mutations and access.

## Core Entities

### ScanLog
Every time an `EVENT_MANAGER` scans a student's QR code, a `ScanLog` is generated regardless of the outcome.
- **Properties**: `scannedBy` (the manager's userId), `result` (Success, Duplicate, Invalid).
- **Purpose**: Provides a traceable history if a student complains they were wrongly denied entry, or if organizers suspect staff are leaking entry capabilities.

### AuditLog
The `AuditLog` tracks all significant platform mutations.
- **Scope**: Can be queried globally by a `SUPER_ADMIN` or scoped to a `collegeId` for a `COLLEGE_ADMIN`.
- **Properties**: Action (e.g., "COLLEGE_APPROVED", "EVENT_CANCELLED"), Resource Type/ID, User ID of the actor, and a JSON payload of the old/new values.

### Certificate
After an event is marked `COMPLETED`, attendees who were `CHECKED_IN` can generate a PDF certificate.
- **Properties**: PDF URL (stored in S3/Cloudinary), `blockchainHash`.
- **Generation**: Rendered via a Puppeteer worker using a headless Chrome instance to ensure pixel-perfect rendering of the college's specific branding and the student's name.

### EventFeedback
Collects 1-5 star ratings and textual comments post-event to help organizers improve future iterations.
