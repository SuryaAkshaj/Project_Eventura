# Eventura — Institutional Event Management Platform

> **Mission 1 Complete**: Full Next.js 14 conversion of 23 HTML pages → 16 routes using App Router.

## 🚀 Quick Start

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Folder Structure

```
eventura/
├── app/
│   ├── (public)/              # No persistent nav
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page (/)
│   │   ├── login/page.tsx     # Sign In (/login)
│   │   └── signup/
│   │       ├── page.tsx       # Role selection (/signup)
│   │       └── pending-approval/page.tsx  (/signup/pending-approval)
│   ├── (attendee)/            # AttendeeNavbar + Footer
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx # (/dashboard)
│   │   ├── events/
│   │   │   ├── page.tsx       # Event discovery + persistent filters (/events)
│   │   │   └── [id]/page.tsx  # Event detail + post-purchase (/events/[id])
│   │   └── certificates/page.tsx  (/certificates)
│   ├── (organiser)/           # OrgSidebar
│   │   ├── layout.tsx
│   │   └── org/
│   │       ├── dashboard/page.tsx      (/org/dashboard)
│   │       ├── events/
│   │       │   ├── create/page.tsx     (/org/events/create)  — 5-step wizard
│   │       │   └── [id]/
│   │       │       ├── readiness/page.tsx  (/org/events/[id]/readiness)
│   │       │       ├── manage/page.tsx     (/org/events/[id]/manage)
│   │       │       ├── scanner/page.tsx    (/org/events/[id]/scanner) — merged feedback
│   │       │       └── scan-history/page.tsx  (/org/events/[id]/scan-history)
│   │       └── payments/page.tsx       (/org/payments) — merged bank validation
│   ├── (admin)/               # AdminSidebar
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── dashboard/page.tsx  (/admin/dashboard)
│   │       ├── colleges/page.tsx   (/admin/colleges) — merged side-by-side
│   │       └── health/page.tsx     (/admin/health)
│   ├── globals.css
│   └── layout.tsx             # Root layout with fonts
├── components/
│   └── layout/
│       ├── AttendeeNavbar.tsx
│       ├── OrgSidebar.tsx
│       └── AdminSidebar.tsx
├── lib/
│   └── mockData.ts            # TypeScript interfaces + mock data
├── middleware.ts               # Placeholder route protection
├── tailwind.config.ts          # Custom design tokens
└── README.md
```

---

## 🗺️ Route Map

| Route | Page | Layout Group |
|---|---|---|
| `/` | Landing Page | (public) |
| `/login` | Sign In | (public) |
| `/signup` | Role Selection | (public) |
| `/signup/pending-approval` | Pending Approval | (public) |
| `/dashboard` | Attendee Dashboard | (attendee) |
| `/events` | Event Discovery + Filters | (attendee) |
| `/events/[id]` | Event Detail + Purchase | (attendee) |
| `/certificates` | Certificates Vault | (attendee) |
| `/org/dashboard` | Organizer Dashboard | (organiser) |
| `/org/events/create` | Event Creator Wizard (5 steps) | (organiser) |
| `/org/events/[id]/readiness` | Pre-Publish Checklist | (organiser) |
| `/org/events/[id]/manage` | Live Management Hub | (organiser) |
| `/org/events/[id]/scanner` | QR Scanner + Feedback | (organiser) |
| `/org/events/[id]/scan-history` | Scan Audit Log | (organiser) |
| `/org/payments` | Payouts + Bank Validation | (organiser) |
| `/admin/dashboard` | Super Admin Dashboard | (admin) |
| `/admin/colleges` | Verification Queue + Side-by-Side | (admin) |
| `/admin/health` | Multi-Tenant Health | (admin) |

---

## 🎨 Design System

- **Primary Color**: Deep Indigo `#15157d` / `#2e3192`
- **Fonts**: Inter (body) + Public Sans (headlines)
- **Icons**: Material Symbols Outlined
- **All design tokens** are in `tailwind.config.ts`

---

## 🔒 Middleware

`middleware.ts` implements placeholder route protection:
- Protected routes: `/dashboard`, `/events`, `/certificates`, `/org/*`, `/admin/*`
- Redirects unauthenticated users to `/login`
- Real JWT authentication comes in **Mission 2**

---

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 + custom design tokens
- **Icons**: Google Material Symbols Outlined
- **Data**: Mock data in `/lib/mockData.ts` (no real API)

---

## 🔄 Merged Pages (useState)

| Pages | Route | State |
|---|---|---|
| event_discovery + persistent_event_discovery | `/events` | Filter state |
| event_detail + post_purchase_flow | `/events/[id]` | `purchased` boolean |
| qr_scanner + enhanced_feedback | `/org/events/[id]/scanner` | `scanState: idle|success|duplicate|invalid` |
| payouts + bank_validation | `/org/payments` | `showBankModal` + `bankStep` |
| colleges_queue + side_by_side | `/admin/colleges` | `showComparison` boolean |
