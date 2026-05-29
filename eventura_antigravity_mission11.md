# EVENTURA — ANTIGRAVITY MISSION 11
## Performance: React Query Caching + Page Transitions

---

## CRITICAL RULES

1. **DO NOT modify any className, color, layout, font, or spacing.**
2. **DO NOT modify any backend files.**
3. **DO NOT modify `prisma/schema.prisma`.**
4. **Only touch files explicitly listed at the bottom.**

---

## PROJECT CONTEXT

- Frontend: Next.js 14, App Router, TypeScript, Tailwind CSS v3, port 3000
- Backend: Node.js + Express, port 4000
- All pages are working but slow due to no caching and no loading transitions

### Root causes of slowness:
1. Every page re-fetches data from scratch on every mount — no caching
2. No loading UI between page transitions — page goes blank
3. Event detail page waits for full API response before showing anything
4. No prefetching on hover

---

## PART 1 — INSTALL REACT QUERY

```bash
cd eventura && npm install @tanstack/react-query @tanstack/react-query-devtools
```

---

## PART 2 — SET UP REACT QUERY PROVIDER

Create `eventura/lib/providers/QueryProvider.tsx`:

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,      // Data fresh for 2 minutes
        gcTime: 1000 * 60 * 10,         // Keep in cache for 10 minutes
        retry: 1,                        // Retry once on failure
        refetchOnWindowFocus: false,     // Don't refetch when tab refocused
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

---

## PART 3 — ADD PROVIDER TO ROOT LAYOUT

File: `eventura/app/layout.tsx`

Find the root layout and wrap children with QueryProvider:

```tsx
import QueryProvider from '@/lib/providers/QueryProvider';

// In the layout JSX, wrap children:
<QueryProvider>
  {children}
</QueryProvider>
```

---

## PART 4 — ADD LOADING.TSX FILES FOR INSTANT TRANSITIONS

These files show immediately when navigating to a page — before data loads. Create each one matching the existing skeleton styles:

### `eventura/app/(attendee)/events/loading.tsx`:
```tsx
export default function EventsLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-64" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### `eventura/app/(attendee)/events/[id]/loading.tsx`:
```tsx
export default function EventDetailLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-64 bg-gray-200 rounded-xl mb-6" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
}
```

### `eventura/app/(attendee)/dashboard/loading.tsx`:
```tsx
export default function DashboardLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

### `eventura/app/(organiser)/org/dashboard/loading.tsx`:
```tsx
export default function OrgDashboardLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

### `eventura/app/(admin)/admin/dashboard/loading.tsx`:
```tsx
export default function AdminDashboardLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

---

## PART 5 — REPLACE USESTATE/USEEFFECT WITH REACT QUERY IN KEY PAGES

### `eventura/app/(attendee)/events/page.tsx`

Replace the manual `useState` + `useEffect` fetch pattern with `useQuery`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api/events.api';

// Remove: useState for events, meta, isLoading, error
// Remove: useEffect fetchEvents
// Add:

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['events', { page, search, category, format, isFree }],
  queryFn: () => eventsApi.getEvents({ page, limit: 12, search: search || undefined, category: category || undefined, format: format || undefined, isFree }),
  placeholderData: (prev) => prev, // Keep showing old data while fetching new page
});

const events = data?.data?.data || [];
const meta = data?.data?.meta || { total: 0, page: 1, limit: 12, totalPages: 0 };
const isLoadingEvents = isLoading;
```

### `eventura/app/(attendee)/events/[id]/page.tsx`

Replace fetch with `useQuery`:

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['event', params.id],
  queryFn: () => eventsApi.getEventById(params.id as string),
  staleTime: 1000 * 60 * 5, // Cache event detail for 5 minutes
});

const event = data?.data?.data;
```

### `eventura/app/(attendee)/dashboard/page.tsx`

```typescript
const { data: upcomingData } = useQuery({
  queryKey: ['events-upcoming'],
  queryFn: () => eventsApi.getEvents({ limit: 3, sortBy: 'startDate', sortOrder: 'asc', startDateFrom: new Date().toISOString() }),
  staleTime: 1000 * 60 * 2,
});

const upcomingEvents = upcomingData?.data?.data || [];
```

### `eventura/app/(organiser)/org/dashboard/page.tsx`

```typescript
const { data: orgData } = useQuery({
  queryKey: ['org-events'],
  queryFn: () => eventsApi.getOrgEvents({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  staleTime: 1000 * 60 * 2,
});

const orgEvents = orgData?.data?.data || [];
```

### `eventura/app/(admin)/admin/dashboard/page.tsx`

```typescript
const { data: statsData } = useQuery({
  queryKey: ['admin-stats'],
  queryFn: () => adminApi.getStats(),
  staleTime: 1000 * 60 * 1, // Refresh every minute
});

const stats = statsData?.data?.data;
```

---

## PART 6 — ADD PREFETCHING ON EVENT CARD HOVER

File: `eventura/app/(attendee)/events/page.tsx`

Add prefetch on hover so event detail loads instantly when clicked:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const handleEventHover = (eventId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getEventById(eventId),
    staleTime: 1000 * 60 * 5,
  });
};
```

Add to each event card:
```tsx
<div
  onMouseEnter={() => handleEventHover(event.id)}
  // ... existing card props
>
  {/* existing card content */}
</div>
```

---

## PART 7 — ADD PAGE TRANSITION INDICATOR

Create `eventura/components/ui/PageTransition.tsx`:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div
        className="h-full bg-indigo-600 transition-all duration-300"
        style={{ width: isLoading ? '70%' : '100%' }}
      />
    </div>
  );
}
```

Add to root layout `eventura/app/layout.tsx`:
```tsx
import PageTransition from '@/components/ui/PageTransition';

// Inside layout JSX, before children:
<PageTransition />
{children}
```

---

## PART 8 — OPTIMIZE NEXT.JS CONFIG

File: `eventura/next.config.js`

Replace existing config with optimized version:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Compress responses
  compress: true,

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },

  // Cache API responses
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## VERIFICATION STEPS

1. `cd eventura && npx tsc --noEmit` → 0 errors ✅
2. `npm run dev` → starts with no errors ✅
3. Open `/events` → page loads with skeleton instantly ✅
4. Hover over an event card → wait 1 second → click it → detail page loads instantly (prefetched) ✅
5. Navigate back → events page loads instantly (cached) ✅
6. Navigate between dashboard tabs → instant, no blank screen ✅
7. Blue progress bar appears at top during navigation ✅

---

## FILES ALLOWED TO TOUCH — COMPLETE LIST

**Frontend — create new:**
- `lib/providers/QueryProvider.tsx`
- `app/(attendee)/events/loading.tsx`
- `app/(attendee)/events/[id]/loading.tsx`
- `app/(attendee)/dashboard/loading.tsx`
- `app/(organiser)/org/dashboard/loading.tsx`
- `app/(admin)/admin/dashboard/loading.tsx`
- `components/ui/PageTransition.tsx`

**Frontend — modify existing:**
- `app/layout.tsx` — add QueryProvider + PageTransition
- `app/(attendee)/events/page.tsx` — useQuery + prefetch on hover
- `app/(attendee)/events/[id]/page.tsx` — useQuery
- `app/(attendee)/dashboard/page.tsx` — useQuery
- `app/(organiser)/org/dashboard/page.tsx` — useQuery
- `app/(admin)/admin/dashboard/page.tsx` — useQuery
- `next.config.js` — optimization settings

**Everything else → DO NOT TOUCH.**
