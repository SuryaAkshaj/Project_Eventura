# Registrations & Payments

The ticketing and financial core of Eventura.

## Core Entities

### Registration
The `Registration` pivot table is the central source of truth for attendance.
- **Lifecycle Statuses**: `REGISTERED` -> `WAITLISTED` -> `CANCELLED` -> `CHECKED_IN`
- **QR Mechanism**: Each registration contains a `qrToken`. This is a static, HMAC-signed JWT. When displayed on the frontend, it is combined with a rotating Redis nonce to form the final QR payload, preventing screenshot fraud.
- **Idempotency**: Prevents a user from registering twice for the same event accidentally.

### Payment
If an event is not marked `isFree`, a `Payment` record is created.
- **Lifecycle**: `PENDING` -> `PAID` -> `FAILED` -> `REFUNDED`.
- **Razorpay Integration**: Eventura uses Razorpay Route.
  - `amount`: The total paid by the student.
  - `platformFee`: Eventura's cut (configurable via `PlatformSettings`).
  - `organizerAmount`: The remainder routed directly to the College's linked Razorpay account.

### Waitlist
If an Event reaches its `maxCapacity`, new registrations are inserted into the `Waitlist` queue. If someone cancels, the system can automatically notify the next user in line based on their `position`.

### RazorpayAccount
Before a College can host a paid event, they must complete KYC through Razorpay. This table links their `collegeId` to their `razorpayAccountId`.
