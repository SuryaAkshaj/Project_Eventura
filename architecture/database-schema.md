# Database Schema

Eventura uses a PostgreSQL database structured around three primary scoping boundaries: Global, Tenant-Scoped, and Transactional.

## Entity Relationship Diagram

```mermaid
erDiagram
    %% Global Scope
    USER ||--o{ ROLE_ASSIGNMENT : has
    USER ||--o{ REGISTRATION : creates
    USER ||--o{ EVENT : creates
    USER {
        uuid id PK
        string email
        string passwordHash
        string firstName
        string lastName
        enum accountMode
    }

    COLLEGE ||--o{ CLUB : owns
    COLLEGE ||--o{ EVENT : owns
    COLLEGE ||--o{ ROLE_ASSIGNMENT : scopes
    COLLEGE ||--o| RAZORPAY_ACCOUNT : has
    COLLEGE {
        uuid id PK
        string name
        string domain
        enum approvalStatus
    }

    ROLE ||--o{ PERMISSION : grants
    ROLE ||--o{ ROLE_ASSIGNMENT : defines
    ROLE {
        uuid id PK
        enum name
    }
    
    PERMISSION {
        uuid id PK
        string action
        uuid roleId FK
    }

    %% Tenant Scope (Requires CollegeID context)
    CLUB ||--o{ EVENT : organizes
    CLUB ||--o{ ROLE_ASSIGNMENT : scopes
    CLUB {
        uuid id PK
        string name
        uuid collegeId FK
    }

    ROLE_ASSIGNMENT {
        uuid id PK
        uuid userId FK
        uuid roleId FK
        uuid collegeId FK
        uuid clubId FK
        enum status
    }

    EVENT ||--o{ EVENT_SESSION : contains
    EVENT ||--o{ REGISTRATION : receives
    EVENT {
        uuid id PK
        string title
        uuid collegeId FK
        uuid clubId FK
        enum visibility
        enum status
        enum eventType
        decimal ticketPrice
        boolean isFree
    }
    
    EVENT_SESSION {
        uuid id PK
        uuid eventId FK
        string title
        datetime startTime
        datetime endTime
    }

    %% Transactional / Operation Scope
    REGISTRATION ||--o| PAYMENT : processes
    REGISTRATION ||--o| CERTIFICATE : issues
    REGISTRATION ||--o{ SCAN_LOG : triggers
    REGISTRATION {
        uuid id PK
        uuid userId FK
        uuid eventId FK
        enum status
        enum paymentStatus
        string qrToken
    }

    PAYMENT {
        uuid id PK
        uuid registrationId FK
        string razorpayOrderId
        decimal amount
        enum status
    }
    
    SCAN_LOG {
        uuid id PK
        uuid registrationId FK
        uuid scannedBy FK
        enum result
    }
```

## Schema Scopes Explained

### 1. Global Scope
Tables that operate at the platform level and do not require a tenant (`collegeId`) context to query.
- **User**: Authentication, personal details, system-wide preferences.
- **College**: The root tenant entity.
- **Role & Permission**: Definitions of RBAC constraints.
- **PlatformSettings**: Singleton table for global configurations like platform fee percentages.

### 2. Tenant Scope
Tables that must be queried through the lens of a specific College. The API enforces this via `AsyncLocalStorage` and Prisma query extensions.
- **Club**: Sub-organizations within a college.
- **RoleAssignment**: A user's specific role within a specific college (and optionally, club).
- **Event**: The core event template. 
- **EventSession**: Sub-sessions or scheduling blocks within an event.
- **SharedEvent**: A mechanism for Event A (created in College A) to be visible to College B.

### 3. Transactional Scope
Tables created organically through user interaction. 
- **Registration**: The pivot linking a User to an Event.
- **Payment**: The financial ledger entry for a registration.
- **ScanLog**: An audit of ticket check-ins.
- **Waitlist**: Users waiting for spots to open up.
- **Certificate**: PDF certificates generated post-event.
- **AuditLog**: Platform-wide mutations and actions.
