# Mission 31 — Dark Mode Audit

## Summary
Added full dark mode support to all Eventura pages (except Creator/Open Mode) using Tailwind's `dark:` class strategy with:
- Theme toggle (light/dark/system) in all navbars and sidebars
- localStorage persistence via `eventura-theme` key
- Flash prevention inline script
- CSS variable overrides for design tokens in dark mode

---

## New Files Created

| File | Purpose |
|------|---------|
| `lib/providers/ThemeProvider.tsx` | Theme context provider with light/dark/system support, localStorage persistence, system preference detection |
| `components/ui/ThemeToggle.tsx` | ThemeToggle (pill) and ThemeToggleIcon (icon-only) components |

---

## Infrastructure Files Modified

| File | Changes |
|------|---------|
| `app/layout.tsx` | Added ThemeProvider wrapper, `suppressHydrationWarning` on `<html>`, inline flash prevention script |
| `app/globals.css` | Added `.dark` CSS variable overrides for all Shadcn tokens, `.dark body` background/color |
| `tailwind.config.ts` | Already had `darkMode: 'class'` — no change needed |

---

## Navigation Components Modified

| File | Changes |
|------|---------|
| `components/layout/AttendeeNavbar.tsx` | Added ThemeToggleIcon import + placed in icon strip before notification bell |
| `components/layout/AdminSidebar.tsx` | Added ThemeToggleIcon import + "Theme" label with toggle near logout |
| `components/layout/OrgSidebar.tsx` | Added ThemeToggleIcon import + "Theme" label with toggle near logout |
| `components/layout/RoleSwitcher.tsx` | No change — uses design tokens that auto-adapt via CSS variables |

---

## Shared UI Components Modified

| File | Changes |
|------|---------|
| `components/ui/DeadlineBadge.tsx` | Added dark variants to all 3 urgency states |
| `components/ui/Shimmer.tsx` | Added `dark:bg-gray-700` to shimmer elements, `dark:bg-gray-800 dark:border-gray-700` to card containers |
| `components/ui/CookieConsent.tsx` | Added dark variants to banner, text, buttons, link |
| `components/ui/ShareButtons.tsx` | Added dark variants to Copy Link button |
| `components/ui/CollegeSearch.tsx` | Added dark variants to all 7 type color badges + fallback |

---

## Public Pages Modified

| File | Changes |
|------|---------|
| `app/(public)/page.tsx` | Added `dark:bg-gray-900` to About section |
| `app/(public)/login/page.tsx` | No change — design tokens only |
| `app/(public)/signup/page.tsx` | No change — design tokens only |
| `app/(public)/signup/verify-email/page.tsx` | No change — design tokens only |
| `app/(public)/signup/pending-approval/page.tsx` | No change — design tokens only |
| `app/(public)/forgot-password/page.tsx` | No change — design tokens only |
| `app/(public)/e/[id]/page.tsx` | Added dark variants to gray/white classes |
| `app/(public)/u/[username]/page.tsx` | Added dark variants |
| `app/(public)/colleges/page.tsx` | Added dark variants |
| `app/(public)/colleges/[slug]/page.tsx` | Added dark variants |
| `app/(public)/terms/page.tsx` | Added dark variants |
| `app/(public)/privacy/page.tsx` | Added dark variants |
| `app/(public)/refunds/page.tsx` | Added dark variants |
| `app/(public)/ip-policy/page.tsx` | Added dark variants |
| `app/(public)/certificates/verify/[id]/page.tsx` | No change — design tokens only |
| `app/(public)/auth/google/success/page.tsx` | No change — design tokens only |

---

## Attendee Pages Modified

| File | Changes |
|------|---------|
| `app/(attendee)/dashboard/page.tsx` | Added dark variants |
| `app/(attendee)/events/page.tsx` | Added dark variants |
| `app/(attendee)/events/[id]/page.tsx` | Added dark variants |
| `app/(attendee)/my-tickets/page.tsx` | Added dark variants |
| `app/(attendee)/my-tickets/[id]/page.tsx` | Added dark variants |
| `app/(attendee)/certificates/page.tsx` | No change — design tokens only |
| `app/(attendee)/profile/page.tsx` | Added dark variants |

---

## Organiser Pages Modified

| File | Changes |
|------|---------|
| `app/(organiser)/org/dashboard/page.tsx` | Added dark variants |
| `app/(organiser)/org/events/page.tsx` | Added dark variants |
| `app/(organiser)/org/events/create/page.tsx` | Added dark variants |
| `app/(organiser)/org/events/[id]/manage/page.tsx` | Added dark variants |
| `app/(organiser)/org/events/[id]/scanner/page.tsx` | Added dark variants |
| `app/(organiser)/org/events/[id]/attendees/page.tsx` | Added dark variants |
| `app/(organiser)/org/events/[id]/readiness/page.tsx` | Added dark variants |
| `app/(organiser)/org/events/[id]/scan-history/page.tsx` | Added dark variants |
| `app/(organiser)/org/members/page.tsx` | Added dark variants |
| `app/(organiser)/org/payments/page.tsx` | No change — design tokens only |
| `app/(organiser)/org/settings/page.tsx` | Added dark variants |
| `app/(organiser)/org/analytics/page.tsx` | Added dark variants |
| `app/(organiser)/org/support/page.tsx` | Added dark variants |

---

## Admin Pages Modified

| File | Changes |
|------|---------|
| `app/(admin)/admin/events/page.tsx` | Added dark variants |
| `app/(admin)/admin/users/page.tsx` | Added dark variants |
| `app/(admin)/admin/audit/page.tsx` | Added dark variants |
| `app/(admin)/admin/settings/page.tsx` | Added dark variants |
| `app/(admin)/admin/profile/page.tsx` | Added dark variants |
| `app/(admin)/admin/support/page.tsx` | Added dark variants |
| `app/(admin)/admin/dashboard/page.tsx` | No change — design tokens only |
| `app/(admin)/admin/colleges/page.tsx` | No change — design tokens only |
| `app/(admin)/admin/health/page.tsx` | No change — design tokens only |

---

## Loading States Modified

| File | Changes |
|------|---------|
| `app/(admin)/admin/dashboard/loading.tsx` | Added dark variants to shimmer elements |
| `app/(attendee)/dashboard/loading.tsx` | Added dark variants |
| `app/(attendee)/events/loading.tsx` | Added dark variants |
| `app/(attendee)/events/[id]/loading.tsx` | Added dark variants |
| `app/(organiser)/org/dashboard/loading.tsx` | Added dark variants |

---

## Files NOT Touched (by design)

| File/Directory | Reason |
|------|---------|
| `app/(creator)/*` | Already dark-themed (Open Mode) |
| All backend files | Mission rule |
| `prisma/schema.prisma` | Mission rule |
