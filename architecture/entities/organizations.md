# Organizations & Multi-Tenancy

Eventura is fundamentally designed as a B2B2C federated multi-tenant platform. Colleges act as the primary tenants, while Clubs act as sub-tenants.

## Core Entities

### College
The `College` entity is the root isolation boundary.
- **Properties**: Name, Domain (`woxsen.edu.in`), Branding colors, Addresses.
- **Isolation Mechanism**: Almost all data (Events, Members, Clubs) belongs to a College. The backend uses `AsyncLocalStorage` to automatically append `where { collegeId: activeCollegeId }` to database queries, preventing data leakage between colleges.
- **Approval Flow**: Colleges must be approved by a `SUPER_ADMIN` before they can operate.

### Club
The `Club` entity is a sub-organization within a `College`.
- **Properties**: Name, Description, Logo.
- **Relationship**: Clubs belong to one College.
- **Organizers**: Events can be organized either at the College level (by a College Admin) or at the Club level (by a Club President).

### RazorpayAccount
The `RazorpayAccount` entity links a College to a verified Razorpay Route account, enabling automated ticket payout splits.

## Federated Visibility
While data is isolated, Eventura supports "Federation" via the `SharedEvent` entity. 
- College A can create an Event and explicitly share it with College B. 
- Students in College B will see this event in their dashboard, allowing cross-college fests and competitions.
