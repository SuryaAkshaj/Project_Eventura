# Tenant Isolation Architecture

Eventura operates a **Shared Database, Isolated Schema** approach for multi-tenancy. This means all data for all colleges lives in the same PostgreSQL tables, but backend logic ensures data is strictly filtered by the tenant's `collegeId`.

## The Problem
Passing `collegeId` explicitly down through every single service function, controller, and database query is error-prone. If a developer forgets to add `where: { collegeId }`, it causes a massive data leak where College A can see College B's students.

## The Solution: AsyncLocalStorage

Eventura solves this using Node.js's native `AsyncLocalStorage` and Prisma Client Extensions.

```mermaid
flowchart TD
    A[Incoming Request] --> B[Auth Middleware]
    B -->|Valid JWT| C[Extract collegeId from JWT]
    C --> D[Initialize AsyncLocalStorage Store]
    
    subgraph Express Context
        D -->|Wraps next()| E[Route Controller]
        E --> F[Business Logic / Services]
        F --> G[Prisma Query e.g. prisma.event.findMany()]
    end
    
    G --> H[Prisma $extends Middleware]
    
    subgraph Prisma Context
        H --> I{Is query on a tenant-scoped model?}
        I -->|Yes| J[Read collegeId from AsyncLocalStorage]
        J --> K[Inject 'where: { collegeId }' into query args]
        I -->|No| L[Pass query unchanged]
    end
    
    K --> M[Execute SQL]
    L --> M
    M --> N[(PostgreSQL)]
```

## How It Works

1. **Authentication Interception**: The `tenant.middleware.ts` intercepts the request.
2. **Context Setup**: It reads the `collegeId` from the verified JWT payload and places it into `tenantStorage.run(store, () => next())`.
3. **Transparent Execution**: The request hits the controller and service layers exactly as normal. The business logic does not need to know about `collegeId`.
4. **Prisma Interception**: When a Prisma query is fired, a global `$extends` query hook pauses execution.
5. **Dynamic Injection**: The hook pulls the current thread's `collegeId` from `tenantStorage` and dynamically alters the query object (e.g., merging `{ collegeId }` into the `where` clause).

## Benefits
- **Developer Experience**: Developers write standard queries: `prisma.registration.findMany()`.
- **Security**: The isolation is guaranteed at the lowest ORM level. You cannot accidentally query outside your tenant scope even if you try, because the extension overrides the parameters.
