# EVENTURA — ANTIGRAVITY MISSION 1
## Convert Stitch HTML to Next.js Project

### YOUR MISSION
Create a new Next.js 14 project called `eventura` using TypeScript, Tailwind CSS, and Shadcn/UI. Convert all the HTML pages in this file into proper Next.js pages and reusable components using the App Router. Maintain the exact design, colors, typography, and layout from each HTML page precisely — do not change any visual details.

### PAGE TO ROUTE MAPPING
| Page Name | Next.js Route | Notes |
|-----------|--------------|-------|
| eventura_landing_page | `/` | Public landing page |
| login_page | `/login` | Auth page |
| role_selection | `/signup` | Role selection on signup |
| pending_approval_status | `/signup/pending-approval` | Waiting for super admin approval |
| attendee_dashboard | `/dashboard` | Attendee home |
| event_discovery | `/events` | Browse events |
| persistent_event_discovery | `/events` | Merge filter persistence into same page as event_discovery |
| event_detail | `/events/[id]` | Event detail page |
| event_detail_post_purchase_flow | `/events/[id]` | Merge post-purchase confirmation as a state in same page |
| certificates_vault | `/certificates` | Attendee certificates |
| organizer_dashboard | `/org/dashboard` | Organiser home |
| event_creator_wizard | `/org/events/create` | Multi-step event creation |
| event_creator_readiness_checklist | `/org/events/[id]/readiness` | Pre-flight check before publishing |
| live_management_hub | `/org/events/[id]/manage` | Live event dashboard |
| qr_scanner_view | `/org/events/[id]/scanner` | QR scanner |
| qr_scanner_enhanced_feedback | `/org/events/[id]/scanner` | Merge enhanced feedback as a state in same page |
| event_manager_scan_history_audit | `/org/events/[id]/scan-history` | Scan history and audit log |
| payouts_finance_dashboard | `/org/payments` | Organiser payouts |
| finance_dashboard_bank_validation | `/org/payments` | Merge bank validation as a state in same page |
| super_admin_dashboard | `/admin/dashboard` | Super admin home |
| institution_verification_queue | `/admin/colleges` | College approval queue |
| enhanced_verification_queue | `/admin/colleges` | Merge side-by-side comparison as a state in same page |
| super_admin_multi_tenant_health_dashboard | `/admin/health` | Multi-tenant health metrics |

### STRICT RULES TO FOLLOW

1. **App Router Layout Groups**: Create three role-based layout groups:
   - `app/(public)/` — landing, login, signup pages
   - `app/(attendee)/` — dashboard, events, certificates pages with attendee layout
   - `app/(organiser)/org/` — all /org/* pages with organiser sidebar layout
   - `app/(admin)/admin/` — all /admin/* pages with admin sidebar layout
   - Each group has its own `layout.tsx` with the correct navbar/sidebar

2. **Reusable Components**: Extract ALL repeated UI elements into `/components`:
   - Navbar, Sidebar, EventCard, StatCard, Badge, Modal, Button, QRDisplay, Avatar, SearchBar, FilterPanel, DataTable, StatusBadge

3. **Mock Data**: Replace all hardcoded data in HTML with TypeScript interfaces and mock data in `/lib/mockData.ts`. Do NOT connect to any real API yet — just make the UI work with realistic mock data.

4. **Merged Pages**: Pages that share a route must handle multiple states using React useState:
   - Scanner page: default view → enhanced feedback after scan (success/error states)
   - Event detail: default view → post-purchase confirmation state
   - Payments: default view → bank validation modal state
   - Colleges admin: queue view → side-by-side comparison state

5. **Responsive**: Every page must be fully mobile-first responsive exactly as designed in the HTML.

6. **Middleware**: Create `/middleware.ts` with placeholder route protection — just redirect unauthenticated users to /login for now. Real JWT auth comes in the next mission.

7. **Tailwind Config**: Extract all color values from the HTML files and add them to `tailwind.config.ts` as custom design tokens (the primary color is Deep Indigo #2E3192).

8. **Navigation**: All links between pages must use Next.js `<Link>` components and work correctly.

9. **README**: Generate a `README.md` with the complete folder structure, route map, and `npm run dev` instructions.

---
# EVENTURA — COMPLETE FRONTEND HTML SOURCE

This file contains all 23 Stitch-generated HTML pages for the Eventura platform.
Each section is labeled with its page name and target Next.js route.

---

## PAGE: attendee_dashboard

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Attendee Dashboard - Eventura</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
  }
</style>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
                "outline-variant": "#c7c5d4",
                "on-tertiary-fixed-variant": "#574500",
                "primary-fixed-dim": "#c0c1ff",
                "surface-tint": "#4f54b4",
                "on-primary-container": "#9da1ff",
                "on-secondary-container": "#57657a",
                "inverse-primary": "#c0c1ff",
                "surface-container-high": "#eae7f0",
                "on-primary-fixed-variant": "#373a9b",
                "primary-container": "#2e3192",
                "surface": "#fcf8ff",
                "on-secondary-fixed": "#0d1c2e",
                "on-primary-fixed": "#04006d",
                "surface-bright": "#fcf8ff",
                "secondary": "#515f74",
                "primary": "#15157d",
                "surface-variant": "#e4e1ea",
                "tertiary": "#735c00",
                "secondary-container": "#d5e3fc",
                "on-background": "#1b1b21",
                "background": "#fcf8ff",
                "error-container": "#ffdad6",
                "error": "#ba1a1a",
                "tertiary-fixed-dim": "#e9c349",
                "tertiary-fixed": "#ffe088",
                "surface-container-lowest": "#ffffff",
                "secondary-fixed": "#d5e3fc",
                "inverse-on-surface": "#f2eff8",
                "on-secondary": "#ffffff",
                "on-surface": "#1b1b21",
                "surface-dim": "#dbd9e1",
                "on-tertiary-fixed": "#241a00",
                "surface-container-highest": "#e4e1ea",
                "on-surface-variant": "#464652",
                "on-error-container": "#93000a",
                "secondary-fixed-dim": "#b9c7df",
                "on-error": "#ffffff",
                "surface-container": "#f0ecf5",
                "inverse-surface": "#303036",
                "on-tertiary": "#ffffff",
                "primary-fixed": "#e1e0ff",
                "on-primary": "#ffffff",
                "outline": "#777683",
                "tertiary-container": "#cca730",
                "surface-container-low": "#f5f2fb",
                "on-tertiary-container": "#4f3d00",
                "on-secondary-fixed-variant": "#3a485b"
        },
        "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
        },
        "spacing": {
                "sm": "8px",
                "md": "16px",
                "gutter": "24px",
                "lg": "24px",
                "xs": "4px",
                "margin-mobile": "16px",
                "xl": "40px",
                "margin-desktop": "48px",
                "unit": "4px"
        },
        "fontFamily": {
                "body-md": [
                        "Inter"
                ],
                "body-lg": [
                        "Inter"
                ],
                "headline-md": [
                        "Public Sans"
                ],
                "display-lg": [
                        "Public Sans"
                ],
                "label-sm": [
                        "Inter"
                ],
                "title-md": [
                        "Inter"
                ],
                "headline-lg": [
                        "Public Sans"
                ]
        },
        "fontSize": {
                "body-md": [
                        "14px",
                        {
                                "lineHeight": "1.5",
                                "letterSpacing": "0em",
                                "fontWeight": "400"
                        }
                ],
                "body-lg": [
                        "16px",
                        {
                                "lineHeight": "1.6",
                                "letterSpacing": "0em",
                                "fontWeight": "400"
                        }
                ],
                "headline-md": [
                        "24px",
                        {
                                "lineHeight": "1.3",
                                "letterSpacing": "0.01em",
                                "fontWeight": "600"
                        }
                ],
                "display-lg": [
                        "48px",
                        {
                                "lineHeight": "1.1",
                                "letterSpacing": "0.02em",
                                "fontWeight": "700"
                        }
                ],
                "label-sm": [
                        "12px",
                        {
                                "lineHeight": "1",
                                "letterSpacing": "0.05em",
                                "fontWeight": "600"
                        }
                ],
                "title-md": [
                        "18px",
                        {
                                "lineHeight": "1.5",
                                "letterSpacing": "0em",
                                "fontWeight": "600"
                        }
                ],
                "headline-lg": [
                        "32px",
                        {
                                "lineHeight": "1.2",
                                "letterSpacing": "0.015em",
                                "fontWeight": "600"
                        }
                ]
        }
},
    },
  }
</script>
</head>
<body class="bg-background text-on-surface font-body-md antialiased flex h-screen overflow-hidden">
<!-- SideNavBar -->
<aside class="hidden md:flex flex-col h-full w-64 bg-primary text-on-primary border-r border-outline-variant shrink-0 z-20">
<div class="flex items-center gap-4 px-6 py-8 border-b border-primary-container/30">
<div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-primary" data-icon="school" style="font-variation-settings: 'FILL' 1;">school</span>
</div>
<div>
<h2 class="font-headline-sm text-headline-sm font-bold text-on-primary">Eventura Admin</h2>
<p class="font-label-sm text-label-sm text-primary-fixed-dim">State University</p>
</div>
</div>
<div class="px-4 py-6">
<button class="w-full bg-white text-primary font-title-md text-title-md py-3 rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined" data-icon="add" style="font-variation-settings: 'FILL' 1;">add</span>
        New Campaign
      </button>
</div>
<nav class="flex-1 overflow-y-auto px-2 py-4 space-y-1">
<a class="flex items-center gap-3 bg-primary-container text-on-primary-container rounded-lg mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors Active: scale-95 transition-transform" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="font-body-md text-body-md font-bold">Dashboard</span>
</a>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="event">event</span>
<span class="font-body-md text-body-md">Events</span>
</a>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="bar_chart">bar_chart</span>
<span class="font-body-md text-body-md">Analytics</span>
</a>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="font-body-md text-body-md">Settings</span>
</a>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="admin_panel_settings">admin_panel_settings</span>
<span class="font-body-md text-body-md">Admin Console</span>
</a>
</nav>
<div class="p-4 border-t border-primary-container/30 space-y-1">
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="contact_support">contact_support</span>
<span class="font-body-md text-body-md">Support</span>
</a>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="logout">logout</span>
<span class="font-body-md text-body-md">Logout</span>
</a>
</div>
</aside>
<!-- Main Content Area -->
<main class="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-low">
<!-- TopNavBar -->
<header class="flex justify-between items-center w-full px-margin-desktop h-16 bg-surface text-primary border-b border-outline-variant shrink-0 z-10">
<div class="flex items-center gap-4">
<a class="font-headline-md text-headline-md font-bold text-primary" href="#">Eventura</a>
</div>
<nav class="hidden md:flex items-center gap-8 h-full">
<a class="h-full flex items-center font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Discover</a>
<a class="h-full flex items-center font-body-md text-body-md text-primary font-bold border-b-2 border-primary Active: opacity-80 transition-all" href="#">My Events</a>
<a class="h-full flex items-center font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Calendar</a>
</nav>
<div class="flex items-center gap-4">
<div class="flex items-center gap-2 text-on-surface-variant">
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined" data-icon="help_outline">help_outline</span>
</button>
</div>
<button class="hidden md:block font-body-md text-body-md text-secondary border border-outline-variant bg-white px-4 py-2 rounded hover:bg-surface-variant transition-colors">Switch to Organizer</button>
<button class="font-body-md text-body-md bg-primary text-white px-4 py-2 rounded hover:bg-primary-container hover:text-on-primary-container transition-colors">Create Event</button>
<div class="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant overflow-hidden shrink-0">
<img alt="User profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWe2XdudHDv4Xa2U48NYYO8C9yyFrkmP62IML81Ez1LIFenWRP5LkOy-i337i3RYHQ4re5l5RLh2_vV0ptxjSPTaVY2MBU7zpZJmWRDsjBHRGZb1GuFkzKXdi18nbLvs9osVs2De7kb8whxhRMF7iFUJHihrPrbNTMLorqMxXozYUKE9EBd7KF32hwi2R5sz0uLwBZVQ0zYYy3dX55HO2YDMsQv529HxTfolerkOQlwBFyjMqtuv6rxH1NEh1bG3X1FeSnXK8USg"/>
</div>
</div>
</header>
<!-- Scrollable Canvas -->
<div class="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
<div class="max-w-7xl mx-auto space-y-xl">
<!-- Welcome Header & Quick Stats -->
<section class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
<div>
<h1 class="font-display-lg text-display-lg text-on-surface mb-2">Hello, Sarah</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant">Here's what's happening on campus this week.</p>
</div>
<div class="flex gap-4">
<div class="bg-white border border-outline-variant rounded-xl p-4 min-w-[160px] shadow-sm">
<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Upcoming Events</p>
<p class="font-headline-lg text-headline-lg text-primary">3</p>
</div>
<div class="bg-white border border-outline-variant rounded-xl p-4 min-w-[160px] shadow-sm">
<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Campus Credits</p>
<p class="font-headline-lg text-headline-lg text-tertiary">14</p>
</div>
</div>
</section>
<!-- Main Layout Grid -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
<!-- Left Column (Wider) -->
<div class="lg:col-span-2 space-y-xl">
<!-- My Active Tickets -->
<section>
<div class="flex justify-between items-end mb-6">
<h2 class="font-title-md text-title-md text-on-surface border-b border-outline-variant pb-2 flex-1">My Active Tickets</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<!-- Ticket Card 1 -->
<div class="bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
<div class="h-32 bg-surface-variant relative">
<img alt="Tech Symposium Panel Discussion" class="w-full h-full object-cover" data-alt="A modern auditorium setting during a tech symposium. The room is filled with attendees looking towards a bright stage. High-end lighting design with deep blue and crisp white tones reflects the corporate modern aesthetic. The atmosphere is academic, professional, and highly organized." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkAA7ATCJSM0CYNvj-iDq8sXgSoK30HTRfv34ZM9hoBzA_aNSKmUqUZVrsgshADrSPHlvxnoyo3gM-UXeNuZdWIEuZJfzCzwQ6r8-SgKBlqiCqhnDjvWYg0zHffeX2RRq52tM4DeDSxKjYVTUD-rLY0yCyLMT2Bc0NJd2GKQG1mzMWh6EDenXM_63vZrs4JEC1AKjvIdQq6OnCzv6GkyR6P7WzWsf3cPqTKbRmE-srugHCkHDIvZtMLC89OY2ZB2g4FMwj4ukqFQ"/>
<div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-primary font-label-sm text-label-sm flex items-center gap-1 shadow-sm border border-outline-variant/20">
<span class="material-symbols-outlined text-[16px]" data-icon="calendar_today">calendar_today</span> Oct 15
                    </div>
</div>
<div class="p-4 flex-1 flex flex-col">
<div class="mb-auto">
<span class="inline-block bg-slate-100 text-slate-700 font-label-sm text-label-sm px-2 py-1 rounded mb-2">Academic</span>
<h3 class="font-title-md text-title-md text-on-surface mb-1 leading-tight">Annual Tech Symposium 2024</h3>
<p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span> Main Auditorium
                      </p>
</div>
<div class="mt-4 pt-4 border-t border-outline-variant/50 flex justify-between items-center">
<span class="font-label-sm text-label-sm text-on-surface-variant">Ticket #EV-4921</span>
<button class="bg-primary text-white font-label-sm text-label-sm px-4 py-2 rounded hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]" data-icon="qr_code">qr_code</span> View QR
                      </button>
</div>
</div>
</div>
<!-- Ticket Card 2 -->
<div class="bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
<div class="h-32 bg-surface-variant relative">
<img alt="Fall Career Fair" class="w-full h-full object-cover" data-alt="A bustling university campus career fair inside a large, well-lit gymnasium or hall. Rows of structured booths with professional signage. The lighting is bright and even, highlighting the clean, organized layout typical of a high-trust institutional event. Students in business casual attire are interacting with recruiters." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7sQMVfrnELpQ6IJ-j0D9ZDtQryOUQwHqRtnJpshVA2RrLs2OcUL8RIRqBxkQEY2l17Kz2dZreMdkkQEsaHNlvZ5rl_08GMuhmffwLMWkTzjNYG6OJZ39vk-ykcxGIMsPmTlpI7EyLKl2LyA5nqJhA8_JZa0UPo1OKElPzt3MbZZ9Ei0lDG7TSAbGH__wDHmPpeVIURcxoALam6JMiLNTsSQ6a0FKzfof6eZ3I9E9rE_93YGPUX5-hZP1Qu9TT8VUrW8F9O4TOdA"/>
<div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-primary font-label-sm text-label-sm flex items-center gap-1 shadow-sm border border-outline-variant/20">
<span class="material-symbols-outlined text-[16px]" data-icon="calendar_today">calendar_today</span> Oct 18
                    </div>
</div>
<div class="p-4 flex-1 flex flex-col">
<div class="mb-auto">
<span class="inline-block bg-slate-100 text-slate-700 font-label-sm text-label-sm px-2 py-1 rounded mb-2">Career</span>
<h3 class="font-title-md text-title-md text-on-surface mb-1 leading-tight">Fall Career Expo</h3>
<p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span> Student Union Hall
                      </p>
</div>
<div class="mt-4 pt-4 border-t border-outline-variant/50 flex justify-between items-center">
<span class="font-label-sm text-label-sm text-on-surface-variant">Ticket #EV-8832</span>
<button class="bg-primary text-white font-label-sm text-label-sm px-4 py-2 rounded hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]" data-icon="qr_code">qr_code</span> View QR
                      </button>
</div>
</div>
</div>
</div>
</section>
<!-- Personalized Feed Grid -->
<section>
<div class="flex justify-between items-end mb-6 border-b border-outline-variant pb-2">
<h2 class="font-title-md text-title-md text-on-surface">Recommended for You</h2>
<a class="font-label-sm text-label-sm text-primary hover:underline" href="#">View All</a>
</div>
<!-- Quick Filters -->
<div class="flex flex-wrap gap-2 mb-6">
<button class="bg-primary text-white border border-primary font-label-sm text-label-sm px-4 py-2 rounded-full transition-colors">All</button>
<button class="bg-white text-on-surface border border-outline-variant font-label-sm text-label-sm px-4 py-2 rounded-full hover:bg-surface-variant transition-colors">This Weekend</button>
<button class="bg-white text-on-surface border border-outline-variant font-label-sm text-label-sm px-4 py-2 rounded-full hover:bg-surface-variant transition-colors">Academic</button>
<button class="bg-white text-on-surface border border-outline-variant font-label-sm text-label-sm px-4 py-2 rounded-full hover:bg-surface-variant transition-colors">Social</button>
<button class="bg-white text-on-surface border border-outline-variant font-label-sm text-label-sm px-4 py-2 rounded-full hover:bg-surface-variant transition-colors">Free</button>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<!-- Recommended Item 1 -->
<div class="bg-white border border-outline-variant rounded-xl p-4 flex gap-4 hover:shadow-[0_4px_20px_rgba(46,49,146,0.08)] transition-shadow">
<div class="w-24 h-24 rounded-lg bg-surface-variant shrink-0 overflow-hidden">
<img alt="Networking Mixer" class="w-full h-full object-cover" data-alt="A sophisticated evening networking mixer for business students. The scene is lit with warm, ambient lighting, focusing on a group of young professionals in conversation. The background is slightly blurred but shows a modern, upscale venue interior with slate and indigo design elements." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvrtI6sJmDM5LCfiRdupZaL_08kPF-5ZvqW6fTSxsst45cDqCfnXPImyeW2uSvls8oCw9Z8RI1KwwxDUY_ZffRBWC6fNue3hMZXuEG18PV3dTQSE9pATzezDqF9dptZqHlpCLlFpGxOIjHP1M3W9zxFOBgZBDMb2tpgByWQoZI1m3bAnsxwNDGX5qbOFQojSlYB75qR22RbZxIw6eU2I9BhOhPbaSqDk4PALTWLmZ_yeH-H8YcSX0ujqKFmX5tYo_BXun3DdHDEQ"/>
</div>
<div class="flex-1 flex flex-col justify-center">
<h4 class="font-title-md text-title-md text-on-surface mb-1 leading-tight">Alumni Networking Mixer</h4>
<p class="font-body-md text-body-md text-on-surface-variant text-sm mb-2">Connect with recent graduates in your major.</p>
<div class="flex items-center justify-between mt-auto">
<span class="font-label-sm text-label-sm text-tertiary">Oct 20 • Free</span>
<button class="text-primary hover:bg-surface-variant p-1 rounded transition-colors">
<span class="material-symbols-outlined" data-icon="bookmark_border">bookmark_border</span>
</button>
</div>
</div>
</div>
<!-- Recommended Item 2 -->
<div class="bg-white border border-outline-variant rounded-xl p-4 flex gap-4 hover:shadow-[0_4px_20px_rgba(46,49,146,0.08)] transition-shadow">
<div class="w-24 h-24 rounded-lg bg-surface-variant shrink-0 overflow-hidden">
<img alt="Study Workshop" class="w-full h-full object-cover" data-alt="A focused, modern university classroom setting for a study workshop. Clean lines, ample white space, and structural clarity. Students are engaged with laptops on sleek wooden desks. The lighting is bright and cool, emphasizing an environment of concentration and academic rigor." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8QvEggDEjzOdaETHo55rhYZpvihxyxZh0q2Z9dxFGuQfO7p0CwtIxV9MbLwrORaXIU5AK9ESms2zw0FMt_RGaEXim3ZXMaFAn2j76Y2YkTZ5JXwVr0xG9UTbDoO39vfT4D2baNqAfAu-ng_OU2fQuoSGqWcYKTwfmw17t5XwRfrDX2a9olakGC84eHyA9mLgxpS2aZT3tKGkYF8rLFKO7iypvtLWV1i5opKGB_6uDPuJjuJx-2D0SLsGYbmUMvE-QxK1pQvdRrQ"/>
</div>
<div class="flex-1 flex flex-col justify-center">
<h4 class="font-title-md text-title-md text-on-surface mb-1 leading-tight">Advanced Data Analytics Workshop</h4>
<p class="font-body-md text-body-md text-on-surface-variant text-sm mb-2">Hands-on session with industry tools.</p>
<div class="flex items-center justify-between mt-auto">
<span class="font-label-sm text-label-sm text-tertiary">Oct 22 • 2 Credits</span>
<button class="text-primary hover:bg-surface-variant p-1 rounded transition-colors">
<span class="material-symbols-outlined" data-icon="bookmark_border">bookmark_border</span>
</button>
</div>
</div>
</div>
</div>
</section>
</div>
<!-- Right Column (Narrower) -->
<div class="space-y-xl">
<!-- Co-Curricular Progress -->
<section class="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
<h2 class="font-title-md text-title-md text-on-surface border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
<span class="material-symbols-outlined text-primary" data-icon="workspace_premium" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
                Co-Curricular Progress
              </h2>
<div class="mb-6">
<div class="flex justify-between items-end mb-2">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Leadership Certificate</span>
<span class="font-label-sm text-label-sm text-primary font-bold">75%</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-primary h-2 rounded-full" style="width: 75%"></div>
</div>
<p class="font-body-md text-body-md text-on-surface-variant text-sm mt-2">Complete 1 more required event to earn your certificate.</p>
</div>
<div class="space-y-3">
<h3 class="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Required Events Remaining:</h3>
<div class="border border-outline-variant rounded-lg p-3 flex items-center justify-between hover:bg-surface-variant transition-colors cursor-pointer">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[18px]" data-icon="group">group</span>
</div>
<span class="font-body-md text-body-md text-on-surface">Conflict Resolution Seminar</span>
</div>
<span class="material-symbols-outlined text-outline" data-icon="chevron_right">chevron_right</span>
</div>
</div>
</section>
<!-- Quick Actions / Upcoming Deadlines (Optional fill) -->
<section class="bg-surface-container border border-outline-variant rounded-xl p-6">
<h2 class="font-title-md text-title-md text-on-surface border-b border-outline-variant pb-2 mb-4">Important Deadlines</h2>
<ul class="space-y-4">
<li class="flex gap-3">
<div class="w-2 h-2 rounded-full bg-error mt-2 shrink-0"></div>
<div>
<p class="font-body-md text-body-md text-on-surface font-bold">Spring Gala Registration Closes</p>
<p class="font-label-sm text-label-sm text-on-surface-variant">Tomorrow, 11:59 PM</p>
</div>
</li>
<li class="flex gap-3">
<div class="w-2 h-2 rounded-full bg-tertiary mt-2 shrink-0"></div>
<div>
<p class="font-body-md text-body-md text-on-surface font-bold">Submit Capstone Proposal</p>
<p class="font-label-sm text-label-sm text-on-surface-variant">Oct 25, 5:00 PM</p>
</div>
</li>
</ul>
</section>
</div>
</div>
</div>
</div>
</main>
</body></html>
```

---

## PAGE: certificates_vault

```html
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Certificates Vault - Eventura</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "outline-variant": "#c7c5d4",
                      "on-tertiary-fixed-variant": "#574500",
                      "primary-fixed-dim": "#c0c1ff",
                      "surface-tint": "#4f54b4",
                      "on-primary-container": "#9da1ff",
                      "on-secondary-container": "#57657a",
                      "inverse-primary": "#c0c1ff",
                      "surface-container-high": "#eae7f0",
                      "on-primary-fixed-variant": "#373a9b",
                      "primary-container": "#2e3192",
                      "surface": "#fcf8ff",
                      "on-secondary-fixed": "#0d1c2e",
                      "on-primary-fixed": "#04006d",
                      "surface-bright": "#fcf8ff",
                      "secondary": "#515f74",
                      "primary": "#15157d",
                      "surface-variant": "#e4e1ea",
                      "tertiary": "#735c00",
                      "secondary-container": "#d5e3fc",
                      "on-background": "#1b1b21",
                      "background": "#fcf8ff",
                      "error-container": "#ffdad6",
                      "error": "#ba1a1a",
                      "tertiary-fixed-dim": "#e9c349",
                      "tertiary-fixed": "#ffe088",
                      "surface-container-lowest": "#ffffff",
                      "secondary-fixed": "#d5e3fc",
                      "inverse-on-surface": "#f2eff8",
                      "on-secondary": "#ffffff",
                      "on-surface": "#1b1b21",
                      "surface-dim": "#dbd9e1",
                      "on-tertiary-fixed": "#241a00",
                      "surface-container-highest": "#e4e1ea",
                      "on-surface-variant": "#464652",
                      "on-error-container": "#93000a",
                      "secondary-fixed-dim": "#b9c7df",
                      "on-error": "#ffffff",
                      "surface-container": "#f0ecf5",
                      "inverse-surface": "#303036",
                      "on-tertiary": "#ffffff",
                      "primary-fixed": "#e1e0ff",
                      "on-primary": "#ffffff",
                      "outline": "#777683",
                      "tertiary-container": "#cca730",
                      "surface-container-low": "#f5f2fb",
                      "on-tertiary-container": "#4f3d00",
                      "on-secondary-fixed-variant": "#3a485b"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "sm": "8px",
                      "md": "16px",
                      "gutter": "24px",
                      "lg": "24px",
                      "xs": "4px",
                      "margin-mobile": "16px",
                      "xl": "40px",
                      "margin-desktop": "48px",
                      "unit": "4px"
              },
              "fontFamily": {
                      "body-md": [
                              "Inter"
                      ],
                      "body-lg": [
                              "Inter"
                      ],
                      "headline-md": [
                              "Public Sans"
                      ],
                      "display-lg": [
                              "Public Sans"
                      ],
                      "label-sm": [
                              "Inter"
                      ],
                      "title-md": [
                              "Inter"
                      ],
                      "headline-lg": [
                              "Public Sans"
                      ]
              },
              "fontSize": {
                      "body-md": [
                              "14px",
                              {
                                      "lineHeight": "1.5",
                                      "letterSpacing": "0em",
                                      "fontWeight": "400"
                              }
                      ],
                      "body-lg": [
                              "16px",
                              {
                                      "lineHeight": "1.6",
                                      "letterSpacing": "0em",
                                      "fontWeight": "400"
                              }
                      ],
                      "headline-md": [
                              "24px",
                              {
                                      "lineHeight": "1.3",
                                      "letterSpacing": "0.01em",
                                      "fontWeight": "600"
                              }
                      ],
                      "display-lg": [
                              "48px",
                              {
                                      "lineHeight": "1.1",
                                      "letterSpacing": "0.02em",
                                      "fontWeight": "700"
                              }
                      ],
                      "label-sm": [
                              "12px",
                              {
                                      "lineHeight": "1",
                                      "letterSpacing": "0.05em",
                                      "fontWeight": "600"
                              }
                      ],
                      "title-md": [
                              "18px",
                              {
                                      "lineHeight": "1.5",
                                      "letterSpacing": "0em",
                                      "fontWeight": "600"
                              }
                      ],
                      "headline-lg": [
                              "32px",
                              {
                                      "lineHeight": "1.2",
                                      "letterSpacing": "0.015em",
                                      "fontWeight": "600"
                              }
                      ]
              }
      },
          },
        }
      </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      </style>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen flex flex-col">
<!-- TopNavBar -->
<header class="bg-surface border-b border-outline-variant full-width top-0 z-50">
<div class="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 max-w-7xl mx-auto">
<div class="flex items-center gap-gutter">
<a class="font-headline-md text-headline-md font-bold text-primary tracking-tight flex items-center gap-2" href="#">
<span class="material-symbols-outlined text-[32px] text-primary" style="font-variation-settings: 'FILL' 1;">local_activity</span>
                    Eventura
                </a>
<nav class="hidden md:flex items-center gap-8 ml-8">
<a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors py-5" href="#">Discover</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors py-5" href="#">My Events</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors py-5" href="#">Calendar</a>
<a class="font-body-md text-body-md text-primary font-bold border-b-2 border-primary py-5 opacity-80 transition-all" href="#">Certificates</a>
</nav>
</div>
<div class="flex items-center gap-4">
<div class="hidden md:flex items-center gap-4">
<button class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors px-4 py-2 border border-outline-variant rounded-md">Switch to Organizer</button>
<button class="font-label-sm text-label-sm bg-primary text-on-primary hover:bg-primary/90 transition-colors px-4 py-2 rounded-md shadow-sm">Create Event</button>
</div>
<div class="flex items-center gap-2 ml-4 border-l border-outline-variant pl-4">
<button class="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant">
<span class="material-symbols-outlined">help_outline</span>
</button>
<button class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm ml-2 overflow-hidden border border-outline-variant">
<img alt="User profile" class="w-full h-full object-cover" data-alt="A professional headshot of a young adult looking directly at the camera. The background is a soft, neutral studio backdrop. The lighting is balanced and modern, creating a clean and trustworthy appearance suitable for an academic or corporate profile avatar." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTI-5xmaA7FCcVKW3IlSulzQ0Ub6P1QNTuZg3GKONqKfxtbWrhi2Z6MmaIusyLudimUYXMRFPUK_wwBIq-BwPpeZ74OjwhSTKLwVXH3tW3LNx-M64hRK1ue0Jn3rT7XyxSEZtnCt8U-WmgoNbHSAb0J5b53lx3KoDCtj9MVr8UOIJv1dmNp_rOZFrRhuW3_MAo6UrQlEd2BNcfWFEfTRCh6SL3hGMa5yfjDSTtE2MarOJs8YkxhqEaRdWZem0AOGtWP3FM_kP7Bw"/>
</button>
</div>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
<!-- Achievement Header -->
<div class="mb-xl border-b border-outline-variant pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<nav aria-label="Breadcrumb" class="flex text-on-surface-variant font-label-sm text-label-sm mb-4">
<ol class="inline-flex items-center space-x-1 md:space-x-3">
<li class="inline-flex items-center">
<a class="hover:text-primary flex items-center" href="#">
<span class="material-symbols-outlined text-[16px] mr-1">home</span>
                                Home
                            </a>
</li>
<li>
<div class="flex items-center">
<span class="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
<span class="text-primary font-bold">Certificates Vault</span>
</div>
</li>
</ol>
</nav>
<h1 class="font-display-lg text-display-lg text-on-background mb-2">Your Verified Achievements</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Access, verify, and share your official co-curricular credentials backed by institutional blockchain verification.</p>
</div>
<div class="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/50 shadow-sm">
<div class="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
</div>
<div>
<div class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Earned</div>
<div class="font-headline-lg text-headline-lg text-primary leading-none mt-1">4</div>
</div>
</div>
</div>
<!-- Certificate Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-gutter">
<!-- Certificate Card 1 -->
<div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group relative">
<div class="h-32 bg-secondary-container relative overflow-hidden flex items-center justify-center">
<div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary to-transparent"></div>
<span class="material-symbols-outlined text-[64px] text-primary opacity-20 absolute -right-4 -bottom-4">school</span>
<div class="w-16 h-16 bg-surface rounded-full shadow-sm flex items-center justify-center relative z-10 border border-outline-variant">
<span class="material-symbols-outlined text-[32px] text-primary">local_library</span>
</div>
</div>
<div class="p-6 flex-grow flex flex-col">
<div class="flex justify-between items-start mb-4">
<div class="inline-flex items-center px-2.5 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider">
                            Academic Excellence
                        </div>
<div class="inline-flex items-center px-2 py-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm text-[10px] uppercase tracking-wider gap-1">
<span class="material-symbols-outlined text-[14px]">verified</span>
                            Blockchain Verified
                        </div>
</div>
<h3 class="font-headline-md text-headline-md text-on-background mb-2 group-hover:text-primary transition-colors">Global Leadership Summit 2024</h3>
<div class="flex items-center gap-3 mt-auto pt-4 mb-6">
<div class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden flex-shrink-0 border border-outline-variant">
<img alt="University Logo" class="w-full h-full object-cover" data-alt="A professional crest or logo of an academic institution, featuring traditional heraldic elements like a shield, a book, or a star, rendered in deep navy and gold on a white background. The image should look like a formal university seal." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ2Xwr7OGPj0nzlDBfkKX28q0d-H8T7rZe62oMOP6PQZni64bTkTDYLymWFqVeuPMPD_cS531ioHSIM3zl5kiJ9mrySI0sQ4ePlMTp5KSY3HxIyuszRGPM-17GAiMb3bMYhSkRSscjCy5fJydBw54VoYmSpjEA8Qidbad_VsQUtiR57xYsF1V04qUJXkXVi4xvwuCbSP4k1Mn9rtZyax1FWoqtQJ7Gmyc_Pyhi9qDo9eiPje9KAhyXyWWwojThKrXJRoGZWly4Qg"/>
</div>
<div>
<div class="font-label-sm text-label-sm text-on-background">State University</div>
<div class="font-body-md text-[13px] text-on-surface-variant">Issued: May 15, 2024</div>
</div>
</div>
<div class="border-t border-outline-variant/50 pt-4 flex gap-2">
<button class="flex-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[18px]">download</span>
                            PDF
                        </button>
<button class="flex-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[18px]">share</span>
                            Share
                        </button>
<button class="w-10 flex-shrink-0 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center hover:bg-surface-variant transition-colors" title="View on Explorer">
<span class="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
</div>
</div>
<!-- Certificate Card 2 -->
<div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group relative">
<div class="h-32 bg-primary-fixed-dim relative overflow-hidden flex items-center justify-center">
<div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary to-transparent"></div>
<span class="material-symbols-outlined text-[64px] text-primary opacity-20 absolute -right-4 -bottom-4">diversity_3</span>
<div class="w-16 h-16 bg-surface rounded-full shadow-sm flex items-center justify-center relative z-10 border border-outline-variant">
<span class="material-symbols-outlined text-[32px] text-primary">groups</span>
</div>
</div>
<div class="p-6 flex-grow flex flex-col">
<div class="flex justify-between items-start mb-4">
<div class="inline-flex items-center px-2.5 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider">
                            Community Engagement
                        </div>
<div class="inline-flex items-center px-2 py-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm text-[10px] uppercase tracking-wider gap-1">
<span class="material-symbols-outlined text-[14px]">verified</span>
                            Blockchain Verified
                        </div>
</div>
<h3 class="font-headline-md text-headline-md text-on-background mb-2 group-hover:text-primary transition-colors">Diversity &amp; Inclusion Workshop Series</h3>
<div class="flex items-center gap-3 mt-auto pt-4 mb-6">
<div class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden flex-shrink-0 border border-outline-variant">
<img alt="University Logo" class="w-full h-full object-cover" data-alt="A professional crest or logo of an academic institution, featuring traditional heraldic elements like a shield, a book, or a star, rendered in deep navy and gold on a white background. The image should look like a formal university seal." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIrIlJg10FHEpiPDamnKuGwdnlPFT1KDT0HZGMfLJpRPtbzKfnPHGo67MExAXFWBUTdTbx03ADrN6xhZZUyFn7tfp1cXOC7ygZ4_qb9L9whrfR9zyR06z6ensRPBdQfoFqtVr_RasQbOBe21T2LaEudQBM6I5Buey5wuRou4yLabQWYhJIvhxAB3lHBWpbqFY95wY_Nw1luoybgmL9DQZMcKxVIQHCG5h-DLm2lOwLU4gmy7Z69jBMlGlRzwLrl84FeYHxkBswwQ"/>
</div>
<div>
<div class="font-label-sm text-label-sm text-on-background">Student Affairs Office</div>
<div class="font-body-md text-[13px] text-on-surface-variant">Issued: April 02, 2024</div>
</div>
</div>
<div class="border-t border-outline-variant/50 pt-4 flex gap-2">
<button class="flex-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[18px]">download</span>
                            PDF
                        </button>
<button class="flex-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[18px]">share</span>
                            Share
                        </button>
<button class="w-10 flex-shrink-0 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center hover:bg-surface-variant transition-colors" title="View on Explorer">
<span class="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
</div>
</div>
<!-- Certificate Card 3 -->
<div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group relative">
<div class="h-32 bg-tertiary-fixed-dim relative overflow-hidden flex items-center justify-center">
<div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tertiary to-transparent"></div>
<span class="material-symbols-outlined text-[64px] text-tertiary opacity-20 absolute -right-4 -bottom-4">code</span>
<div class="w-16 h-16 bg-surface rounded-full shadow-sm flex items-center justify-center relative z-10 border border-outline-variant">
<span class="material-symbols-outlined text-[32px] text-tertiary">terminal</span>
</div>
</div>
<div class="p-6 flex-grow flex flex-col">
<div class="flex justify-between items-start mb-4">
<div class="inline-flex items-center px-2.5 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider">
                            Technical Skill
                        </div>
<div class="inline-flex items-center px-2 py-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm text-[10px] uppercase tracking-wider gap-1">
<span class="material-symbols-outlined text-[14px]">verified</span>
                            Blockchain Verified
                        </div>
</div>
<h3 class="font-headline-md text-headline-md text-on-background mb-2 group-hover:text-primary transition-colors">Advanced Python Bootcamp</h3>
<div class="flex items-center gap-3 mt-auto pt-4 mb-6">
<div class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden flex-shrink-0 border border-outline-variant">
<img alt="University Logo" class="w-full h-full object-cover" data-alt="A professional crest or logo of an academic institution, featuring traditional heraldic elements like a shield, a book, or a star, rendered in deep navy and gold on a white background. The image should look like a formal university seal." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs_vXU_P7KcDR9r2H7fQlg-l7F9yUU2dZrTI-vrQvcf3hnJ6O1rzOR5_aTcXA5Wm5PZ3xLrBgBZpEmMSbG_dZUhydIf87zhj8YwM5p1Jw81bKks2WmuEliAimpQ8ifyVX3EBI-YHh3AaSr2Yocrow04IyTyghtOfBkSWsHqwcBpJJHJ8NUZP4er2bdwBtT6sXaUyqKq45fxnLv3I2Y9wQysOp3gy7VOYi0uxFPmpSnTUfow70kn-4O-VPX8nTiG207JVJrmX9YqQ"/>
</div>
<div>
<div class="font-label-sm text-label-sm text-on-background">Computer Science Dept</div>
<div class="font-body-md text-[13px] text-on-surface-variant">Issued: March 10, 2024</div>
</div>
</div>
<div class="border-t border-outline-variant/50 pt-4 flex gap-2">
<button class="flex-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[18px]">download</span>
                            PDF
                        </button>
<button class="flex-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[18px]">share</span>
                            Share
                        </button>
<button class="w-10 flex-shrink-0 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center hover:bg-surface-variant transition-colors" title="View on Explorer">
<span class="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
</div>
</div>
<!-- Certificate Card 4 -->
<div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group relative">
<div class="h-32 bg-surface-container-high relative overflow-hidden flex items-center justify-center">
<div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary to-transparent"></div>
<span class="material-symbols-outlined text-[64px] text-secondary opacity-20 absolute -right-4 -bottom-4">volunteer_activism</span>
<div class="w-16 h-16 bg-surface rounded-full shadow-sm flex items-center justify-center relative z-10 border border-outline-variant">
<span class="material-symbols-outlined text-[32px] text-secondary">handshake</span>
</div>
</div>
<div class="p-6 flex-grow flex flex-col">
<div class="flex justify-between items-start mb-4">
<div class="inline-flex items-center px-2.5 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider">
                            Volunteer Service
                        </div>
<div class="inline-flex items-center px-2 py-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm text-[10px] uppercase tracking-wider gap-1">
<span class="material-symbols-outlined text-[14px]">verified</span>
                            Blockchain Verified
                        </div>
</div>
<h3 class="font-headline-md text-headline-md text-on-background mb-2 group-hover:text-primary transition-colors">Spring Campus Clean-up Initiative</h3>
<div class="flex items-center gap-3 mt-auto pt-4 mb-6">
<div class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden flex-shrink-0 border border-outline-variant">
<img alt="University Logo" class="w-full h-full object-cover" data-alt="A professional crest or logo of an academic institution, featuring traditional heraldic elements like a shield, a book, or a star, rendered in deep navy and gold on a white background. The image should look like a formal university seal." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs8nVtBjIMX7GJ-xzbN5X4NV8jxIHN9e8jMQejOINQilytmV5pUeRZR-JulL35dxVz71HXUTftt_O0Hxyit_HKDQagFBCLCAR7iXLcpGXQu62MuUF-mOUtmfUbXehy1kING1Q_LsEoIPsbplQoY82CNp6YBJT-yfBwW55LKUorM1sYhzsDPyvkRD2PwUThf0dE_Y0s_pW0B1i2AfvzfZ7i4ZH214Z0XOKeFhwXokKhuSg56Nz-5RiMrC52eDZabCB-0IJD43jucw"/>
</div>
<div>
<div class="font-label-sm text-label-sm text-on-background">Sustainability Office</div>
<div class="font-body-md text-[13px] text-on-surface-variant">Issued: Feb 28, 2024</div>
</div>
</div>
<div class="border-t border-outline-variant/50 pt-4 flex gap-2">
<button class="flex-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[18px]">download</span>
                            PDF
                        </button>
<button class="flex-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[18px]">share</span>
                            Share
                        </button>
<button class="w-10 flex-shrink-0 font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md py-2 flex items-center justify-center hover:bg-surface-variant transition-colors" title="View on Explorer">
<span class="material-symbols-outlined text-[18px]">link</span>
</button>
</div>
</div>
</div>
<!-- Empty State / Add New Placeholder -->
<div class="bg-surface-container-low border border-dashed border-outline-variant rounded-xl overflow-hidden flex flex-col items-center justify-center p-8 text-center min-h-[360px]">
<div class="w-16 h-16 rounded-full bg-surface border border-outline-variant flex items-center justify-center text-primary mb-4 shadow-sm">
<span class="material-symbols-outlined text-[32px]">add_task</span>
</div>
<h3 class="font-title-md text-title-md text-on-background mb-2">Earn More Credentials</h3>
<p class="font-body-md text-body-md text-on-surface-variant mb-6 max-w-xs">Register for verified events to continue building your co-curricular transcript.</p>
<button class="font-label-sm text-label-sm bg-primary text-on-primary hover:bg-primary/90 transition-colors px-6 py-3 rounded-md shadow-sm">
                    Discover Verified Events
                </button>
</div>
</div>
</main>
<!-- Footer -->
<footer class="bg-surface-container-low border-t border-outline-variant mt-auto">
<div class="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-lg max-w-7xl mx-auto gap-4">
<div class="font-headline-sm text-[20px] font-bold text-primary flex items-center gap-2">
<span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">local_activity</span>
                Eventura
            </div>
<div class="flex flex-wrap justify-center gap-6">
<a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Terms of Service</a>
<a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Privacy Policy</a>
<a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Institutional Support</a>
<a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">API Documentation</a>
</div>
<div class="font-label-sm text-label-sm text-on-surface-variant">
                © 2024 Eventura. Institutional Grade Event Management.
            </div>
</div>
</footer>
</body></html>
```

---

## PAGE: enhanced_verification_queue

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - College Verification</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "outline-variant": "#c7c5d4",
                    "on-tertiary-fixed-variant": "#574500",
                    "primary-fixed-dim": "#c0c1ff",
                    "surface-tint": "#4f54b4",
                    "on-primary-container": "#9da1ff",
                    "on-secondary-container": "#57657a",
                    "inverse-primary": "#c0c1ff",
                    "surface-container-high": "#eae7f0",
                    "on-primary-fixed-variant": "#373a9b",
                    "primary-container": "#2e3192",
                    "surface": "#fcf8ff",
                    "on-secondary-fixed": "#0d1c2e",
                    "on-primary-fixed": "#04006d",
                    "surface-bright": "#fcf8ff",
                    "secondary": "#515f74",
                    "primary": "#15157d",
                    "surface-variant": "#e4e1ea",
                    "tertiary": "#735c00",
                    "secondary-container": "#d5e3fc",
                    "on-background": "#1b1b21",
                    "background": "#fcf8ff",
                    "error-container": "#ffdad6",
                    "error": "#ba1a1a",
                    "tertiary-fixed-dim": "#e9c349",
                    "tertiary-fixed": "#ffe088",
                    "surface-container-lowest": "#ffffff",
                    "secondary-fixed": "#d5e3fc",
                    "inverse-on-surface": "#f2eff8",
                    "on-secondary": "#ffffff",
                    "on-surface": "#1b1b21",
                    "surface-dim": "#dbd9e1",
                    "on-tertiary-fixed": "#241a00",
                    "surface-container-highest": "#e4e1ea",
                    "on-surface-variant": "#464652",
                    "on-error-container": "#93000a",
                    "secondary-fixed-dim": "#b9c7df",
                    "on-error": "#ffffff",
                    "surface-container": "#f0ecf5",
                    "inverse-surface": "#303036",
                    "on-tertiary": "#ffffff",
                    "primary-fixed": "#e1e0ff",
                    "on-primary": "#ffffff",
                    "outline": "#777683",
                    "tertiary-container": "#cca730",
                    "surface-container-low": "#f5f2fb",
                    "on-tertiary-container": "#4f3d00",
                    "on-secondary-fixed-variant": "#3a485b"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "sm": "8px",
                    "md": "16px",
                    "gutter": "24px",
                    "lg": "24px",
                    "xs": "4px",
                    "margin-mobile": "16px",
                    "xl": "40px",
                    "margin-desktop": "48px",
                    "unit": "4px"
            },
            "fontFamily": {
                    "body-md": [
                            "Inter"
                    ],
                    "body-lg": [
                            "Inter"
                    ],
                    "headline-md": [
                            "Public Sans"
                    ],
                    "display-lg": [
                            "Public Sans"
                    ],
                    "label-sm": [
                            "Inter"
                    ],
                    "title-md": [
                            "Inter"
                    ],
                    "headline-lg": [
                            "Public Sans"
                    ]
            },
            "fontSize": {
                    "body-md": [
                            "14px",
                            {
                                    "lineHeight": "1.5",
                                    "letterSpacing": "0em",
                                    "fontWeight": "400"
                            }
                    ],
                    "body-lg": [
                            "16px",
                            {
                                    "lineHeight": "1.6",
                                    "letterSpacing": "0em",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-md": [
                            "24px",
                            {
                                    "lineHeight": "1.3",
                                    "letterSpacing": "0.01em",
                                    "fontWeight": "600"
                            }
                    ],
                    "display-lg": [
                            "48px",
                            {
                                    "lineHeight": "1.1",
                                    "letterSpacing": "0.02em",
                                    "fontWeight": "700"
                            }
                    ],
                    "label-sm": [
                            "12px",
                            {
                                    "lineHeight": "1",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "600"
                            }
                    ],
                    "title-md": [
                            "18px",
                            {
                                    "lineHeight": "1.5",
                                    "letterSpacing": "0em",
                                    "fontWeight": "600"
                            }
                    ],
                    "headline-lg": [
                            "32px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "0.015em",
                                    "fontWeight": "600"
                            }
                    ]
            }
    },
        },
      }
    </script>
</head>
<body class="bg-surface font-body-md text-on-surface h-screen flex overflow-hidden">
<!-- SideNavBar -->
<nav class="bg-primary text-on-primary docked left-0 h-full w-64 shadow-sm flex flex-col border-r border-outline-variant flex-shrink-0 z-20">
<div class="p-lg border-b border-primary-container">
<div class="flex items-center gap-md">
<img alt="University Logo" class="w-10 h-10 rounded-full object-cover border-2 border-primary-container" data-alt="A clean, minimalist university logo placeholder showing a modern crest or shield design. The logo is displayed in high resolution against a crisp white background. The overall aesthetic is professional, academic, and trustworthy, fitting for a higher education institutional portal." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0QVO_Svw45G__rs7KgPkIOMadSvgTUWgGShGAE-3ID6yL0E_TfCDnEEZB2wqM3y3vmiFVoF1W2kT6Z3PUDk9Jlq6cV7qym6ZY5ziR1VdshGqgRXwbnPVHzJKyN2i4Zmn_2lKJSl5Swb54SHB5GcaqZ_7bWU8nshLyxovVDSSm5MslMWoxrec9P8fBd4cHpYZQ_i5Sgq9B2tk8OJGQkW2DHonyXyTRUP0QjXRNwifCgeCtufl20Czq5owmybvn5rRGsT9IGHVDRA"/>
<div>
<h1 class="font-headline-sm text-headline-sm font-bold text-on-primary">Eventura Admin</h1>
<p class="font-label-sm text-label-sm text-primary-fixed-dim">State University</p>
</div>
</div>
</div>
<div class="flex-1 overflow-y-auto py-md">
<ul class="space-y-sm">
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                        Dashboard
                    </a>
</li>
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined" data-icon="event">event</span>
                        Events
                    </a>
</li>
<li>
<a class="flex items-center gap-md bg-primary-container text-on-primary-container rounded-lg mx-2 my-1 px-4 py-3 font-body-md text-body-md font-bold shadow-sm" href="#">
<span class="material-symbols-outlined" data-icon="admin_panel_settings">admin_panel_settings</span>
                        Verification
                    </a>
</li>
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined" data-icon="bar_chart">bar_chart</span>
                        Analytics
                    </a>
</li>
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
                        Settings
                    </a>
</li>
</ul>
</div>
<div class="p-md border-t border-primary-container">
<button class="w-full bg-white text-primary font-body-md text-body-md py-2 px-4 rounded-lg flex justify-center items-center gap-sm hover:bg-surface-container-low transition-colors mb-md">
<span class="material-symbols-outlined" data-icon="add">add</span>
                New Campaign
            </button>
<ul class="space-y-sm">
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-2 rounded-lg hover:bg-primary-container/20 transition-colors font-label-sm text-label-sm" href="#">
<span class="material-symbols-outlined" data-icon="contact_support">contact_support</span>
                        Support
                    </a>
</li>
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-2 rounded-lg hover:bg-primary-container/20 transition-colors font-label-sm text-label-sm" href="#">
<span class="material-symbols-outlined" data-icon="logout">logout</span>
                        Logout
                    </a>
</li>
</ul>
</div>
</nav>
<!-- Main Content Canvas -->
<main class="flex-1 flex flex-col h-full overflow-hidden bg-background">
<!-- Top App Bar (Contextual) -->
<header class="bg-surface flex justify-between items-center w-full px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
<div class="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
<span>Admin Console</span>
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-primary font-bold">Verification Queue</span>
</div>
<div class="flex items-center gap-md">
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">search</span>
<input class="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64" placeholder="Search organizations..." type="text"/>
</div>
</div>
</header>
<!-- Scrollable Content Area -->
<div class="flex-1 overflow-y-auto p-margin-desktop flex gap-xl relative">
<!-- Left Column: Table Container -->
<div class="flex-1 flex flex-col min-w-[500px] w-1/3">
<div class="flex justify-between items-end mb-lg">
<div>
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-xs">Verification Queue</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Review and approve college and student club credentials.</p>
</div>
<div class="flex gap-sm">
<select class="border border-outline-variant rounded-lg bg-surface-container-lowest px-4 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary">
<option>Status: Pending</option>
<option>Status: Approved</option>
<option>Status: Rejected</option>
<option>Status: All</option>
</select>
<select class="border border-outline-variant rounded-lg bg-surface-container-lowest px-4 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary">
<option>Type: All</option>
<option>Type: College</option>
<option>Type: Club</option>
</select>
</div>
</div>
<!-- Bento Style Card for Table -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="border-b border-outline-variant bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant uppercase">
<th class="py-3 px-6 font-semibold">Organization</th>
<th class="py-3 px-6 font-semibold">Type</th>
<th class="py-3 px-6 font-semibold">Date</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
<!-- Row 1 (Active) -->
<tr class="hover:bg-surface-container transition-colors cursor-pointer bg-primary/5">
<td class="py-4 px-6">
<div class="font-semibold text-primary">Alpha Kappa Psi</div>
<div class="text-label-sm text-on-surface-variant">ID: #REQ-8472</div>
</td>
<td class="py-4 px-6">
<span class="inline-flex items-center px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm font-label-sm">Club</span>
</td>
<td class="py-4 px-6 text-on-surface-variant">Oct 24, 2024</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-surface-container transition-colors cursor-pointer">
<td class="py-4 px-6">
<div class="font-semibold">College of Engineering</div>
<div class="text-label-sm text-on-surface-variant">ID: #REQ-8471</div>
</td>
<td class="py-4 px-6">
<span class="inline-flex items-center px-2 py-1 rounded bg-tertiary-container text-on-tertiary-container text-label-sm font-label-sm">College</span>
</td>
<td class="py-4 px-6 text-on-surface-variant">Oct 23, 2024</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-surface-container transition-colors cursor-pointer">
<td class="py-4 px-6">
<div class="font-semibold">Debate Society</div>
<div class="text-label-sm text-on-surface-variant">ID: #REQ-8470</div>
</td>
<td class="py-4 px-6">
<span class="inline-flex items-center px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm font-label-sm">Club</span>
</td>
<td class="py-4 px-6 text-on-surface-variant">Oct 22, 2024</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination Footer -->
<div class="bg-surface-container-low border-t border-outline-variant p-4 flex justify-between items-center mt-auto">
<span class="text-label-sm text-on-surface-variant">Showing 1 to 3</span>
<div class="flex gap-1">
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors" disabled="">
<span class="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-label-sm">1</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
<!-- Right Column: Document Preview Panel -->
<div class="w-2/3 min-w-[700px] flex-shrink-0 flex flex-col">
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
<!-- Header -->
<div class="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
<h3 class="font-title-md text-title-md text-on-surface">Review Document</h3>
<button class="text-on-surface-variant hover:text-on-surface transition-colors">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<div class="flex flex-1 overflow-hidden">
<!-- Document Section -->
<div class="flex-1 border-r border-outline-variant flex flex-col">
<!-- Metadata Info -->
<div class="p-md border-b border-outline-variant bg-surface-bright space-y-sm">
<div class="flex justify-between">
<span class="text-label-sm text-on-surface-variant uppercase">Organization</span>
<span class="font-semibold text-body-md text-primary">Alpha Kappa Psi</span>
</div>
<div class="flex justify-between">
<span class="text-label-sm text-on-surface-variant uppercase">Document Type</span>
<span class="text-body-md text-on-surface">Charter Approval.pdf</span>
</div>
</div>
<!-- Document Placeholder -->
<div class="flex-1 bg-surface-container flex items-center justify-center p-md relative group">
<img alt="Document Preview" class="w-full h-full object-cover rounded shadow-sm opacity-90 transition-opacity group-hover:opacity-100" data-alt="A macro shot of a formal academic or institutional document printed on high-quality textured paper. The text is slightly blurred to indicate a generic placeholder, but an official-looking university seal or stamp is visible in the corner. The lighting is bright and clear, emphasizing professionalism and administrative authority." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMW_PImzfydgumDVYq5OoFOq8yaLXiaKc29gL1c_awH5J1rjHYbTtOvot0bupAdmtwJYsXmsKF42y74nUjm_EV1TGJPoS1udx3P4bddBGDbm-wVRFkOnOiL7-67H2qJrefWrZsqeNgxJCPOtFzHzeEszs2JOunnYYvEaP7hkjP0DBQ3vYKWScIvcULVyJiUxcKbTWTOOOangaus-N5MR-hPi4TLDOoTdVHhfDSR6VDABXpJhUptEwOpxTDVRwJQvr8i-DnsRd52g"/>
<div class="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
<div class="bg-surface/90 px-4 py-2 rounded-lg shadow-sm border border-outline-variant flex items-center gap-sm">
<span class="material-symbols-outlined text-primary">zoom_in</span>
<span class="font-label-sm text-primary">Preview Mode</span>
</div>
</div>
</div>
</div>
<!-- Controls Section -->
<div class="w-72 bg-surface-bright flex flex-col p-md gap-md overflow-y-auto">
<div class="space-y-sm">
<h4 class="font-title-md text-on-surface">Verification Details</h4>
<p class="text-body-md text-on-surface-variant">Review the provided documents and verify the organization's authenticity.</p>
</div>
<div class="space-y-2">
<label class="font-label-sm text-on-surface-variant uppercase">Verification Notes</label>
<textarea class="w-full border border-outline-variant rounded-lg p-3 text-body-md bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:border-primary resize-none" placeholder="Add notes here..." rows="5"></textarea>
</div>
<div class="mt-auto space-y-3 pt-4 border-t border-outline-variant">
<button class="w-full bg-primary text-white font-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors flex justify-center items-center gap-xs">
<span class="material-symbols-outlined text-[18px]">check_circle</span>
                Approve
            </button>
<button class="w-full border border-outline-variant bg-surface-container-lowest text-on-surface font-label-sm py-2 rounded-lg hover:bg-surface-container transition-colors">
                Request Info
            </button>
<button class="w-full border border-error text-error bg-error-container/20 font-label-sm py-2 rounded-lg hover:bg-error-container/40 transition-colors">
                Reject
            </button>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
</body></html>
```

---

## PAGE: event_creator_readiness_checklist

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - Create Event</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "outline-variant": "#c7c5d4",
                    "on-tertiary-fixed-variant": "#574500",
                    "primary-fixed-dim": "#c0c1ff",
                    "surface-tint": "#4f54b4",
                    "on-primary-container": "#9da1ff",
                    "on-secondary-container": "#57657a",
                    "inverse-primary": "#c0c1ff",
                    "surface-container-high": "#eae7f0",
                    "on-primary-fixed-variant": "#373a9b",
                    "primary-container": "#2e3192",
                    "surface": "#fcf8ff",
                    "on-secondary-fixed": "#0d1c2e",
                    "on-primary-fixed": "#04006d",
                    "surface-bright": "#fcf8ff",
                    "secondary": "#515f74",
                    "primary": "#15157d",
                    "surface-variant": "#e4e1ea",
                    "tertiary": "#735c00",
                    "secondary-container": "#d5e3fc",
                    "on-background": "#1b1b21",
                    "background": "#fcf8ff",
                    "error-container": "#ffdad6",
                    "error": "#ba1a1a",
                    "tertiary-fixed-dim": "#e9c349",
                    "tertiary-fixed": "#ffe088",
                    "surface-container-lowest": "#ffffff",
                    "secondary-fixed": "#d5e3fc",
                    "inverse-on-surface": "#f2eff8",
                    "on-secondary": "#ffffff",
                    "on-surface": "#1b1b21",
                    "surface-dim": "#dbd9e1",
                    "on-tertiary-fixed": "#241a00",
                    "surface-container-highest": "#e4e1ea",
                    "on-surface-variant": "#464652",
                    "on-error-container": "#93000a",
                    "secondary-fixed-dim": "#b9c7df",
                    "on-error": "#ffffff",
                    "surface-container": "#f0ecf5",
                    "inverse-surface": "#303036",
                    "on-tertiary": "#ffffff",
                    "primary-fixed": "#e1e0ff",
                    "on-primary": "#ffffff",
                    "outline": "#777683",
                    "tertiary-container": "#cca730",
                    "surface-container-low": "#f5f2fb",
                    "on-tertiary-container": "#4f3d00",
                    "on-secondary-fixed-variant": "#3a485b"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "sm": "8px",
                    "md": "16px",
                    "gutter": "24px",
                    "lg": "24px",
                    "xs": "4px",
                    "margin-mobile": "16px",
                    "xl": "40px",
                    "margin-desktop": "48px",
                    "unit": "4px"
            },
            "fontFamily": {
                    "body-md": [
                            "Inter"
                    ],
                    "body-lg": [
                            "Inter"
                    ],
                    "headline-md": [
                            "Public Sans"
                    ],
                    "display-lg": [
                            "Public Sans"
                    ],
                    "label-sm": [
                            "Inter"
                    ],
                    "title-md": [
                            "Inter"
                    ],
                    "headline-lg": [
                            "Public Sans"
                    ]
            },
            "fontSize": {
                    "body-md": [
                            "14px",
                            {
                                    "lineHeight": "1.5",
                                    "letterSpacing": "0em",
                                    "fontWeight": "400"
                            }
                    ],
                    "body-lg": [
                            "16px",
                            {
                                    "lineHeight": "1.6",
                                    "letterSpacing": "0em",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-md": [
                            "24px",
                            {
                                    "lineHeight": "1.3",
                                    "letterSpacing": "0.01em",
                                    "fontWeight": "600"
                            }
                    ],
                    "display-lg": [
                            "48px",
                            {
                                    "lineHeight": "1.1",
                                    "letterSpacing": "0.02em",
                                    "fontWeight": "700"
                            }
                    ],
                    "label-sm": [
                            "12px",
                            {
                                    "lineHeight": "1",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "600"
                            }
                    ],
                    "title-md": [
                            "18px",
                            {
                                    "lineHeight": "1.5",
                                    "letterSpacing": "0em",
                                    "fontWeight": "600"
                            }
                    ],
                    "headline-lg": [
                            "32px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "0.015em",
                                    "fontWeight": "600"
                            }
                    ]
            }
    },
        },
      }
    </script>
</head>
<body class="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
<!-- TopNavBar (Linear/Transactional Page - Suppressed Navigation Links, Keeping Brand Header) -->
<header class="bg-surface w-full px-margin-mobile md:px-margin-desktop h-16 flex items-center border-b border-outline-variant shrink-0">
<div class="flex items-center gap-md">
<span class="font-headline-md text-headline-md font-bold text-primary">Eventura</span>
<span class="text-on-surface-variant text-body-md font-body-md hidden sm:inline-block pl-4 border-l border-outline-variant">Event Creator</span>
</div>
<div class="ml-auto">
<button class="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs">
<span class="material-symbols-outlined text-[20px]">close</span>
<span class="font-label-sm text-label-sm uppercase hidden sm:inline-block">Exit Builder</span>
</button>
</div>
</header>
<!-- Main Content Canvas -->
<main class="flex-grow flex flex-col items-center py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low">
<!-- Stepper Container -->
<div class="w-full max-w-4xl mb-xl">
<div class="flex items-center justify-between relative">
<!-- Progress Line Background -->
<div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-outline-variant z-0"></div>
<!-- Progress Line Active -->
<div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-primary z-0 transition-all duration-500"></div>
<!-- Step 1: Completed -->
<div class="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[16px]">check</span>
</div>
<span class="font-label-sm text-label-sm text-primary uppercase absolute top-10 whitespace-nowrap">Basic Info</span>
</div>
<!-- Step 2: Completed -->
<div class="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[16px]">check</span>
</div>
<span class="font-label-sm text-label-sm text-primary uppercase absolute top-10 whitespace-nowrap">Logistics</span>
</div>
<!-- Step 3: Completed -->
<div class="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[16px]">check</span>
</div>
<span class="font-label-sm text-label-sm text-primary uppercase absolute top-10 whitespace-nowrap">Tickets &amp; Pricing</span>
</div>
<!-- Step 4: Completed -->
<div class="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[16px]">check</span>
</div>
<span class="font-label-sm text-label-sm text-primary uppercase absolute top-10 whitespace-nowrap">Review</span>
</div>
<!-- Step 5: Active -->
<div class="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm">
                        5
                    </div>
<span class="font-label-sm text-label-sm text-primary uppercase absolute top-10 whitespace-nowrap">Checklist</span>
</div>
</div>
</div>
<!-- Form Container -->
<div class="w-full max-w-3xl bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
<!-- Header -->
<div class="p-lg border-b border-outline-variant bg-surface-container-lowest">
<h1 class="font-headline-lg text-headline-lg text-on-surface mb-xs">Pre-Publish Checklist</h1>
<p class="font-body-md text-body-md text-on-surface-variant">Review the final system checks before your event can go live.</p>
</div>
<!-- Form Body -->
<div class="p-lg flex flex-col gap-lg bg-surface">
<div class="flex flex-col gap-md">
<!-- Check 1: Razorpay Route Connection -->
<div class="flex items-start gap-md p-md rounded-lg border border-[#c6e5ca] bg-[#f0f9f1]">
<span class="material-symbols-outlined text-[24px] text-[#2e7d32] mt-1 shrink-0">check_circle</span>
<div class="flex flex-col">
<span class="font-title-md text-title-md text-on-surface">Razorpay Route Connection</span>
<span class="font-body-md text-body-md text-on-surface-variant mt-1">Payment gateway is successfully linked to the correct institutional merchant account.</span>
</div>
</div>
<!-- Check 2: Visibility Logic -->
<div class="flex items-start gap-md p-md rounded-lg border border-[#c6e5ca] bg-[#f0f9f1]">
<span class="material-symbols-outlined text-[24px] text-[#2e7d32] mt-1 shrink-0">check_circle</span>
<div class="flex flex-col">
<span class="font-title-md text-title-md text-on-surface">Visibility &amp; Access Logic</span>
<span class="font-body-md text-body-md text-on-surface-variant mt-1">No conflicts detected between ticketing tiers and event visibility settings.</span>
</div>
</div>
<!-- Check 3: Ticket Capacity vs Venue Limits -->
<div class="flex items-start gap-md p-md rounded-lg border border-error-container bg-[#fff5f5]">
<span class="material-symbols-outlined text-[24px] text-error mt-1 shrink-0">error</span>
<div class="flex flex-col">
<span class="font-title-md text-title-md text-on-surface">Ticket Capacity Exceeds Venue Limit</span>
<span class="font-body-md text-body-md text-on-surface-variant mt-1 text-error">The total allocated ticket capacity (500) exceeds the maximum allowed capacity for the selected venue (350). Please reduce ticket allocation or change the venue.</span>
</div>
</div>
</div>
</div>
<!-- Footer Actions -->
<div class="p-lg border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-md">
<button class="w-full sm:w-auto h-10 px-lg bg-surface border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase rounded-lg hover:bg-surface-variant transition-colors" type="button">
                    Back to Review
                </button>
<div class="flex gap-md w-full sm:w-auto">
<button class="w-full sm:w-auto h-10 px-lg bg-primary text-on-primary font-label-sm text-label-sm uppercase rounded-lg opacity-50 cursor-not-allowed transition-colors flex items-center justify-center gap-sm" disabled="" type="button">
                        Publish Event
                        <span class="material-symbols-outlined text-[18px]">publish</span>
</button>
</div>
</div>
</div>
</main>
<!-- Footer (Suppressed for transactional flow focus, but adding a minimal institutional branding anchor) -->
<footer class="bg-surface border-t border-outline-variant py-md px-margin-mobile md:px-margin-desktop text-center mt-auto">
<p class="font-label-sm text-label-sm text-on-surface-variant">© 2024 Eventura. Institutional Grade Event Management.</p>
</footer>
</body></html>
```

---

## PAGE: event_creator_wizard

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - Create Event</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "outline-variant": "#c7c5d4",
                    "on-tertiary-fixed-variant": "#574500",
                    "primary-fixed-dim": "#c0c1ff",
                    "surface-tint": "#4f54b4",
                    "on-primary-container": "#9da1ff",
                    "on-secondary-container": "#57657a",
                    "inverse-primary": "#c0c1ff",
                    "surface-container-high": "#eae7f0",
                    "on-primary-fixed-variant": "#373a9b",
                    "primary-container": "#2e3192",
                    "surface": "#fcf8ff",
                    "on-secondary-fixed": "#0d1c2e",
                    "on-primary-fixed": "#04006d",
                    "surface-bright": "#fcf8ff",
                    "secondary": "#515f74",
                    "primary": "#15157d",
                    "surface-variant": "#e4e1ea",
                    "tertiary": "#735c00",
                    "secondary-container": "#d5e3fc",
                    "on-background": "#1b1b21",
                    "background": "#fcf8ff",
                    "error-container": "#ffdad6",
                    "error": "#ba1a1a",
                    "tertiary-fixed-dim": "#e9c349",
                    "tertiary-fixed": "#ffe088",
                    "surface-container-lowest": "#ffffff",
                    "secondary-fixed": "#d5e3fc",
                    "inverse-on-surface": "#f2eff8",
                    "on-secondary": "#ffffff",
                    "on-surface": "#1b1b21",
                    "surface-dim": "#dbd9e1",
                    "on-tertiary-fixed": "#241a00",
                    "surface-container-highest": "#e4e1ea",
                    "on-surface-variant": "#464652",
                    "on-error-container": "#93000a",
                    "secondary-fixed-dim": "#b9c7df",
                    "on-error": "#ffffff",
                    "surface-container": "#f0ecf5",
                    "inverse-surface": "#303036",
                    "on-tertiary": "#ffffff",
                    "primary-fixed": "#e1e0ff",
                    "on-primary": "#ffffff",
                    "outline": "#777683",
                    "tertiary-container": "#cca730",
                    "surface-container-low": "#f5f2fb",
                    "on-tertiary-container": "#4f3d00",
                    "on-secondary-fixed-variant": "#3a485b"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "sm": "8px",
                    "md": "16px",
                    "gutter": "24px",
                    "lg": "24px",
                    "xs": "4px",
                    "margin-mobile": "16px",
                    "xl": "40px",
                    "margin-desktop": "48px",
                    "unit": "4px"
            },
            "fontFamily": {
                    "body-md": [
                            "Inter"
                    ],
                    "body-lg": [
                            "Inter"
                    ],
                    "headline-md": [
                            "Public Sans"
                    ],
                    "display-lg": [
                            "Public Sans"
                    ],
                    "label-sm": [
                            "Inter"
                    ],
                    "title-md": [
                            "Inter"
                    ],
                    "headline-lg": [
                            "Public Sans"
                    ]
            },
            "fontSize": {
                    "body-md": [
                            "14px",
                            {
                                    "lineHeight": "1.5",
                                    "letterSpacing": "0em",
                                    "fontWeight": "400"
                            }
                    ],
                    "body-lg": [
                            "16px",
                            {
                                    "lineHeight": "1.6",
                                    "letterSpacing": "0em",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-md": [
                            "24px",
                            {
                                    "lineHeight": "1.3",
                                    "letterSpacing": "0.01em",
                                    "fontWeight": "600"
                            }
                    ],
                    "display-lg": [
                            "48px",
                            {
                                    "lineHeight": "1.1",
                                    "letterSpacing": "0.02em",
                                    "fontWeight": "700"
                            }
                    ],
                    "label-sm": [
                            "12px",
                            {
                                    "lineHeight": "1",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "600"
                            }
                    ],
                    "title-md": [
                            "18px",
                            {
                                    "lineHeight": "1.5",
                                    "letterSpacing": "0em",
                                    "fontWeight": "600"
                            }
                    ],
                    "headline-lg": [
                            "32px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "0.015em",
                                    "fontWeight": "600"
                            }
                    ]
            }
    },
        },
      }
    </script>
</head>
<body class="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
<!-- TopNavBar (Linear/Transactional Page - Suppressed Navigation Links, Keeping Brand Header) -->
<header class="bg-surface w-full px-margin-mobile md:px-margin-desktop h-16 flex items-center border-b border-outline-variant shrink-0">
<div class="flex items-center gap-md">
<span class="font-headline-md text-headline-md font-bold text-primary">Eventura</span>
<span class="text-on-surface-variant text-body-md font-body-md hidden sm:inline-block pl-4 border-l border-outline-variant">Event Creator</span>
</div>
<div class="ml-auto">
<button class="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs">
<span class="material-symbols-outlined text-[20px]">close</span>
<span class="font-label-sm text-label-sm uppercase hidden sm:inline-block">Exit Builder</span>
</button>
</div>
</header>
<!-- Main Content Canvas -->
<main class="flex-grow flex flex-col items-center py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low">
<!-- Stepper Container -->
<div class="w-full max-w-4xl mb-xl">
<div class="flex items-center justify-between relative">
<!-- Progress Line Background -->
<div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-outline-variant z-0"></div>
<!-- Progress Line Active -->
<div class="absolute left-0 top-1/2 -translate-y-1/2 w-[16.6%] h-[2px] bg-primary z-0 transition-all duration-500"></div>
<!-- Step 1: Active -->
<div class="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm">
                        1
                    </div>
<span class="font-label-sm text-label-sm text-primary uppercase absolute top-10 whitespace-nowrap">Basic Info</span>
</div>
<!-- Step 2: Upcoming -->
<div class="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
<div class="w-8 h-8 rounded-full bg-surface border-2 border-outline-variant text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm font-bold">
                        2
                    </div>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase absolute top-10 whitespace-nowrap">Logistics</span>
</div>
<!-- Step 3: Upcoming -->
<div class="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
<div class="w-8 h-8 rounded-full bg-surface border-2 border-outline-variant text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm font-bold">
                        3
                    </div>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase absolute top-10 whitespace-nowrap">Tickets &amp; Pricing</span>
</div>
<!-- Step 4: Upcoming -->
<div class="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
<div class="w-8 h-8 rounded-full bg-surface border-2 border-outline-variant text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm font-bold">
                        4
                    </div>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase absolute top-10 whitespace-nowrap">Review</span>
</div>
</div>
</div>
<!-- Form Container -->
<div class="w-full max-w-3xl bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
<!-- Header -->
<div class="p-lg border-b border-outline-variant bg-surface-container-lowest">
<h1 class="font-headline-lg text-headline-lg text-on-surface mb-xs">Basic Information</h1>
<p class="font-body-md text-body-md text-on-surface-variant">Start by providing the fundamental details of your institutional event.</p>
</div>
<!-- Form Body -->
<div class="p-lg flex flex-col gap-lg bg-surface">
<!-- Event Title -->
<div class="flex flex-col gap-xs">
<label class="font-label-sm text-label-sm text-on-surface uppercase tracking-wide" for="event-title">Event Title <span class="text-error">*</span></label>
<input class="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline" id="event-title" placeholder="e.g., Annual Tech Symposium 2024" type="text"/>
</div>
<!-- Category & Department -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
<div class="flex flex-col gap-xs">
<label class="font-label-sm text-label-sm text-on-surface uppercase tracking-wide" for="event-category">Category <span class="text-error">*</span></label>
<select class="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none" id="event-category">
<option disabled="" selected="" value="">Select Category</option>
<option value="academic">Academic Conference</option>
<option value="cultural">Cultural Festival</option>
<option value="sports">Athletics &amp; Sports</option>
<option value="workshop">Technical Workshop</option>
<option value="seminar">Guest Seminar</option>
</select>
</div>
<div class="flex flex-col gap-xs">
<label class="font-label-sm text-label-sm text-on-surface uppercase tracking-wide" for="event-department">Sponsoring Department</label>
<select class="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none" id="event-department">
<option disabled="" selected="" value="">Select Department</option>
<option value="cs">Computer Science</option>
<option value="eng">Engineering</option>
<option value="arts">Arts &amp; Humanities</option>
<option value="bus">Business School</option>
</select>
</div>
</div>
<!-- Description (Rich Text Simulation) -->
<div class="flex flex-col gap-xs">
<label class="font-label-sm text-label-sm text-on-surface uppercase tracking-wide" for="event-description">Description <span class="text-error">*</span></label>
<div class="border border-outline-variant rounded-lg overflow-hidden bg-surface">
<!-- Toolbar -->
<div class="bg-surface-container border-b border-outline-variant flex items-center gap-sm px-sm py-xs">
<button class="p-1 rounded hover:bg-surface-variant text-on-surface-variant transition-colors" title="Bold" type="button">
<span class="material-symbols-outlined text-[20px]">format_bold</span>
</button>
<button class="p-1 rounded hover:bg-surface-variant text-on-surface-variant transition-colors" title="Italic" type="button">
<span class="material-symbols-outlined text-[20px]">format_italic</span>
</button>
<button class="p-1 rounded hover:bg-surface-variant text-on-surface-variant transition-colors" title="Underline" type="button">
<span class="material-symbols-outlined text-[20px]">format_underlined</span>
</button>
<div class="w-px h-4 bg-outline-variant mx-1"></div>
<button class="p-1 rounded hover:bg-surface-variant text-on-surface-variant transition-colors" title="Bulleted List" type="button">
<span class="material-symbols-outlined text-[20px]">format_list_bulleted</span>
</button>
<button class="p-1 rounded hover:bg-surface-variant text-on-surface-variant transition-colors" title="Numbered List" type="button">
<span class="material-symbols-outlined text-[20px]">format_list_numbered</span>
</button>
<div class="w-px h-4 bg-outline-variant mx-1"></div>
<button class="p-1 rounded hover:bg-surface-variant text-on-surface-variant transition-colors" title="Link" type="button">
<span class="material-symbols-outlined text-[20px]">link</span>
</button>
</div>
<textarea class="w-full p-md border-none font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:ring-0 resize-y placeholder:text-outline" id="event-description" placeholder="Provide a comprehensive overview of the event..." rows="5"></textarea>
</div>
</div>
<!-- Visibility Controls -->
<div class="flex flex-col gap-md pt-sm border-t border-outline-variant">
<label class="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Visibility &amp; Access</label>
<div class="grid grid-cols-1 md:grid-cols-2 gap-md">
<!-- Option 1: Internal -->
<label class="relative flex cursor-pointer rounded-lg border border-outline-variant bg-surface p-4 shadow-sm focus-within:ring-2 focus-within:ring-primary hover:bg-surface-container-lowest transition-colors">
<div class="flex w-full items-start gap-4">
<div class="flex items-center h-5">
<input checked="" class="h-4 w-4 border-outline text-primary focus:ring-primary" name="visibility" type="radio" value="internal"/>
</div>
<div class="flex flex-col">
<span class="font-title-md text-title-md text-on-surface">Institutional Only</span>
<span class="font-body-md text-body-md text-on-surface-variant mt-1">Restricted to students and faculty with valid university credentials.</span>
</div>
</div>
</label>
<!-- Option 2: Public -->
<label class="relative flex cursor-pointer rounded-lg border border-outline-variant bg-surface p-4 shadow-sm focus-within:ring-2 focus-within:ring-primary hover:bg-surface-container-lowest transition-colors">
<div class="flex w-full items-start gap-4">
<div class="flex items-center h-5">
<input class="h-4 w-4 border-outline text-primary focus:ring-primary" name="visibility" type="radio" value="public"/>
</div>
<div class="flex flex-col">
<span class="font-title-md text-title-md text-on-surface">Public Access</span>
<span class="font-body-md text-body-md text-on-surface-variant mt-1">Open to general public. External registration permitted.</span>
</div>
</div>
</label>
</div>
</div>
<!-- Enterprise Features (Toggles) -->
<div class="flex flex-col gap-sm pt-sm border-t border-outline-variant">
<div class="flex items-center justify-between">
<label class="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Advanced Security</label>
</div>
<div class="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-outline-variant">
<div class="flex flex-col">
<div class="flex items-center gap-xs">
<span class="font-title-md text-title-md text-on-surface">Blockchain Credentials</span>
<div class="group relative flex items-center justify-center">
<span class="material-symbols-outlined text-[16px] text-on-surface-variant cursor-help">info</span>
<div class="absolute bottom-full mb-2 hidden group-hover:flex w-64 p-sm bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm rounded shadow-lg z-20">
                                        Issue verifiable, tamper-proof attendance certificates upon event completion using institutional ledger.
                                    </div>
</div>
</div>
<span class="font-body-md text-body-md text-on-surface-variant mt-1">Issue verifiable attendance certificates.</span>
</div>
<!-- Toggle Switch -->
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox" value=""/>
<div class="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-fixed-dim rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
<!-- Footer Actions -->
<div class="p-lg border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-md">
<button class="w-full sm:w-auto h-10 px-lg bg-surface border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase rounded-lg hover:bg-surface-variant transition-colors" type="button">
                    Save Draft
                </button>
<div class="flex gap-md w-full sm:w-auto">
<button class="w-full sm:w-auto h-10 px-lg bg-primary text-on-primary font-label-sm text-label-sm uppercase rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-sm" type="button">
                        Continue to Logistics
                        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</main>
<!-- Footer (Suppressed for transactional flow focus, but adding a minimal institutional branding anchor) -->
<footer class="bg-surface border-t border-outline-variant py-md px-margin-mobile md:px-margin-desktop text-center mt-auto">
<p class="font-label-sm text-label-sm text-on-surface-variant">© 2024 Eventura. Institutional Grade Event Management.</p>
</footer>
</body></html>
```

---

## PAGE: event_detail

```html
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Event Detail - Eventura</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Public Sans"],
                        "display-lg": ["Public Sans"],
                        "label-sm": ["Inter"],
                        "title-md": ["Inter"],
                        "headline-lg": ["Public Sans"]
                    },
                    "fontSize": {
                        "body-md": ["14px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400" }],
                        "body-lg": ["16px", { "lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "1.3", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "0.02em", "fontWeight": "700" }],
                        "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
                        "title-md": ["18px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "0.015em", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
<!-- TopNavBar Shared Component -->
<header class="bg-surface border-b border-outline-variant sticky top-0 z-50">
<div class="flex justify-between items-center w-full px-margin-desktop h-16 max-w-7xl mx-auto">
<div class="flex items-center gap-lg">
<a class="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">confirmation_number</span>
                    Eventura
                </a>
<div class="relative hidden lg:block">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input class="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-64" placeholder="Search events..." type="text"/>
</div>
</div>
<nav class="hidden md:flex items-center h-full gap-lg">
<a class="text-primary font-bold border-b-2 border-primary h-full flex items-center hover:text-primary transition-colors" href="#">Discover</a>
<a class="text-on-surface-variant h-full flex items-center hover:text-primary transition-colors" href="#">My Events</a>
<a class="text-on-surface-variant h-full flex items-center hover:text-primary transition-colors" href="#">Calendar</a>
</nav>
<div class="flex items-center gap-md">
<button class="hidden lg:flex text-body-md font-label-sm text-secondary border border-outline-variant bg-surface hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors items-center gap-2">
                    Switch to Organizer
                </button>
<button class="font-label-sm text-on-primary bg-primary hover:bg-primary-fixed-dim hover:text-primary px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-sm">add</span>
                    Create Event
                </button>
<div class="flex items-center gap-2 border-l border-outline-variant pl-4 ml-2">
<button class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-low">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-low">
<span class="material-symbols-outlined">help_outline</span>
</button>
<button class="ml-2 w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
<img alt="User profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxnYliy9b0QFNgjNwWT72ij7_N7-E_AG9QE6TtS2HziwmgwJNX9mKinyzEOOoG52Ml3VV4_1rvHtlzPr1Zo7t1mybYM1I8HtqX0JJIUK86odjr-bOE2jF_L-AODwBqS734fDwGRmUG6hhVXkrqeOA5EeMZH1Rwz-VfH8U3rCUwBVOOxEX2pCOaznhPIip2Ja2u91enpdkv54Wor4tXrdrcNscrb7kk-8RWikdLOy5h8Z05LyidXVx8gCR7-HDmkBicqbX__8wtDg"/>
</button>
</div>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
<!-- Breadcrumbs -->
<nav aria-label="Breadcrumb" class="flex items-center text-body-md text-secondary mb-md">
<ol class="flex items-center space-x-2">
<li><a class="hover:underline" href="#">Home</a></li>
<li><span class="material-symbols-outlined text-sm">chevron_right</span></li>
<li><a class="hover:underline" href="#">Discover</a></li>
<li><span class="material-symbols-outlined text-sm">chevron_right</span></li>
<li aria-current="page" class="text-on-surface font-semibold">Annual Innovation Summit 2024</li>
</ol>
</nav>
<!-- Hero Cover -->
<div class="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden relative mb-xl border border-outline-variant shadow-sm bg-surface-container-low">
<img alt="" class="w-full h-full object-cover" data-alt="A wide, high-resolution photograph of a modern, brightly lit university auditorium filled with attendees listening to a keynote speaker. The aesthetic is highly professional, corporate modern, reflecting academic prestige. The lighting is bright and even, highlighting the clean architectural lines of the venue and the engaged audience. The color palette features deep indigo blues of the stage backdrop contrasting with warm, neutral tones of the wood paneling and crisp white structural elements." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWTXLBIJ9xNidZGWXjkiGASTLyd-keNNSTYG4k0u7zR11qXztRA_6GVRTnHasOCLpnR1FDs_x6SaBiKQuVizPphJjn09v4gJjP9aN9FsZEXpt_ofqg8bN8VmNHXXaPf07zuKFKu9lRDF4jNtt5P7SMfzz-rBCCGZZjDxujbqkYMgeIFQ3nCtH7Xtb-SIJvHrsa7H7KBuvjzP_iZlYwAA2pnkjswb7j3_bCl3RvP1zEb5rVMbE6VoF_rL7ZoiRCh-LXmcnt08YMAg"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
<div class="absolute bottom-0 left-0 p-lg md:p-xl w-full">
<div class="flex items-center gap-2 mb-2">
<span class="px-3 py-1 bg-primary/90 text-on-primary rounded text-label-sm uppercase tracking-wider backdrop-blur-sm border border-white/20">Technology</span>
<span class="px-3 py-1 bg-surface/90 text-primary rounded text-label-sm uppercase tracking-wider backdrop-blur-sm border border-outline-variant">In-Person</span>
</div>
<h1 class="font-display-lg text-display-lg text-white mb-2 shadow-sm">Annual Innovation Summit 2024</h1>
<p class="text-white/90 font-title-md text-title-md max-w-2xl">Exploring the frontiers of artificial intelligence and sustainable technology in higher education.</p>
</div>
</div>
<div class="flex flex-col md:flex-row gap-gutter">
<!-- Left Column: Content (70%) -->
<div class="w-full md:w-[70%] flex flex-col gap-xl">
<!-- Metadata Bento Grid -->
<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
<!-- Date -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex items-start gap-3 hover:border-primary transition-colors">
<div class="p-2 bg-primary-container text-on-primary-container rounded-lg shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
</div>
<div>
<h3 class="font-label-sm text-secondary mb-1">Date</h3>
<p class="font-title-md text-on-surface">October 15, 2024</p>
<p class="text-body-md text-on-surface-variant mt-1">Tuesday</p>
</div>
</div>
<!-- Time -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex items-start gap-3 hover:border-primary transition-colors">
<div class="p-2 bg-primary-container text-on-primary-container rounded-lg shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">schedule</span>
</div>
<div>
<h3 class="font-label-sm text-secondary mb-1">Time</h3>
<p class="font-title-md text-on-surface">9:00 AM</p>
<p class="text-body-md text-on-surface-variant mt-1">to 5:00 PM EST</p>
</div>
</div>
<!-- Venue -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex items-start gap-3 hover:border-primary transition-colors sm:col-span-2 lg:col-span-2">
<div class="p-2 bg-primary-container text-on-primary-container rounded-lg shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">location_on</span>
</div>
<div class="flex-grow flex justify-between items-center gap-4">
<div>
<h3 class="font-label-sm text-secondary mb-1">Venue</h3>
<p class="font-title-md text-on-surface">Main Auditorium</p>
<p class="text-body-md text-on-surface-variant mt-1">State University Campus, Building A</p>
</div>
<div class="w-20 h-20 rounded-lg overflow-hidden border border-outline-variant shrink-0 bg-surface-container">
<img alt="Map" class="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply" data-alt="A clean, minimalist digital map interface showing a specific location marked with a professional deep indigo pin. The map style uses subtle, low-contrast grays and crisp white roads, fitting a corporate or institutional aesthetic. It avoids cluttered street names, focusing instead on structural clarity and precise alignment." data-location="University Campus Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Rlkta4htW0b4GggDyfzFNAYSg5I64Mfn8EPNu4iSH_QL_veqIVJaaGUG9aLccWd96Ap7QpS5FgQmsqq6gjT_3gFwD_Wg0HIKtyiCFDdfIr90xOtGI9uTTCvDuwXXPuyYZ48aTsNAeBZqR809txE6XapWsFsKjzmkP1h0BhWE-aLA_9QhlGuseEiyAREzA6sG44T38_vwrCjoOn6aAm5wzzjtYUBTTT7InsQp9yZ2-cMgTzLcLfOVFgSxgp-fIF20mhN9HKnT9g"/>
</div>
</div>
</div>
</section>
<!-- About Section -->
<section class="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl">
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-md pb-4 border-b border-outline-variant flex items-center gap-2">
<span class="material-symbols-outlined text-primary">info</span>
                        About This Event
                    </h2>
<div class="prose prose-slate max-w-none text-body-lg text-on-surface-variant space-y-4">
<p>The Annual Innovation Summit is our flagship event dedicated to exploring the intersection of technology and higher education. This year, we are focusing on how artificial intelligence, machine learning, and sustainable infrastructure are reshaping the academic landscape and operational efficiency of institutions globally.</p>
<p>Join leading academics, industry pioneers, and administrative professionals for a full day of insightful keynotes, interactive panel discussions, and hands-on workshops. Attendees will have the opportunity to network with peers, discover emerging technological solutions, and engage in critical dialogues about the future of institutional excellence.</p>
<ul class="list-disc pl-5 space-y-2 mt-4 text-on-surface">
<li>Comprehensive insights into AI adoption in university administration.</li>
<li>Case studies on sustainable campus initiatives.</li>
<li>Networking opportunities with tech leaders and academic peers.</li>
</ul>
</div>
<!-- Organizer Card embedded in About -->
<div class="mt-lg pt-lg border-t border-outline-variant flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-surface-container-high border border-outline flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-secondary">account_balance</span>
</div>
<div>
<h4 class="font-label-sm text-secondary uppercase tracking-wide">Organized By</h4>
<p class="font-title-md text-on-surface">State University Office of Innovation</p>
</div>
<button class="ml-auto text-primary font-label-sm border border-primary/30 hover:bg-primary-container/20 px-4 py-2 rounded-lg transition-colors">Contact</button>
</div>
</section>
<!-- Schedule Section -->
<section class="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl">
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-lg pb-4 border-b border-outline-variant flex items-center gap-2">
<span class="material-symbols-outlined text-primary">view_agenda</span>
                        Agenda
                    </h2>
<div class="relative border-l-2 border-outline-variant ml-3 space-y-8 pb-4">
<!-- Agenda Item 1 -->
<div class="relative pl-8">
<div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface shadow-sm"></div>
<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-2">
<h3 class="font-title-md text-on-surface">Registration &amp; Welcome Breakfast</h3>
<time class="font-label-sm text-secondary bg-surface-container-low px-2 py-1 rounded">09:00 AM - 10:00 AM</time>
</div>
<p class="text-body-md text-on-surface-variant">Check-in at the main lobby and enjoy a complimentary breakfast while networking with early arrivals.</p>
</div>
<!-- Agenda Item 2 -->
<div class="relative pl-8">
<div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-container-high border-2 border-outline-variant shadow-sm"></div>
<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-2">
<h3 class="font-title-md text-on-surface">Opening Keynote: The Future of Campus Tech</h3>
<time class="font-label-sm text-secondary bg-surface-container-low px-2 py-1 rounded">10:00 AM - 11:30 AM</time>
</div>
<p class="text-body-md text-on-surface-variant mb-2">An inspiring kickoff addressing the macro trends affecting higher education technology infrastructure.</p>
<div class="flex items-center gap-2">
<img alt="" class="w-6 h-6 rounded-full border border-outline-variant" data-alt="A professional headshot of a confident, middle-aged woman in a modern corporate setting. She is wearing a tailored navy blue blazer over a crisp white shirt. The background is a slightly blurred, bright office environment conveying authority and institutional prestige. Lighting is high-key and flattering, emphasizing clarity and trustworthiness." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4TnDQB0nMCdKDAn1dWtmBx-vg0NHSBJbUsc1c_p-Z6798M8dTPC56NoI_flcjP3tcHT7TLRfDZ4IYD7uQTFo_KjG5jbbNxZVQOLd4ijBaPJ7UWEjnjxyyiK662mLoRx4pJjvL9nUPDHTYiSqRKYFM4n5jUBC2ZxTPyPGZ1NZxgGJpWfENWiejZVh2na-C-MCc1lVqQ_1UCMxUm0Hg7S2TbQlSdkYWUMRoMuXDam0SIaAiiWqAyTdT8UVWL4twAxk2XaCEROx2Eg"/>
<span class="font-label-sm text-secondary">Dr. Sarah Jenkins</span>
</div>
</div>
<!-- Agenda Item 3 -->
<div class="relative pl-8">
<div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-container-high border-2 border-outline-variant shadow-sm"></div>
<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-2">
<h3 class="font-title-md text-on-surface">Panel: AI in Administrative Workflows</h3>
<time class="font-label-sm text-secondary bg-surface-container-low px-2 py-1 rounded">11:45 AM - 01:00 PM</time>
</div>
<p class="text-body-md text-on-surface-variant">A discussion on practical applications of AI to streamline university operations and student services.</p>
</div>
</div>
</section>
<!-- Speakers Section -->
<section class="mb-xl">
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-lg flex items-center gap-2">
<span class="material-symbols-outlined text-primary">groups</span>
                        Featured Speakers
                    </h2>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
<!-- Speaker Card 1 -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex flex-col items-center text-center hover:shadow-md transition-shadow group">
<div class="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-surface-container-high group-hover:border-primary transition-colors">
<img alt="" class="w-full h-full object-cover" data-alt="A professional headshot of a confident, middle-aged woman in a modern corporate setting. She is wearing a tailored navy blue blazer over a crisp white shirt. The background is a slightly blurred, bright office environment conveying authority and institutional prestige. Lighting is high-key and flattering, emphasizing clarity and trustworthiness." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRUtlaJnZ7LJOT_RqMkpaPJ_7wF9EdmlC1P9628QJvJLgZQdhPUtXw8rUmGOOxkl-F8Ijb8jme-Ci4URjTPOZtr4W0Roze6NtDLabv2hkPBL9ho-ZOIEuMaPXEef-UvBTfrb6KAn-VE-J9qZ85zXLJOW8rfg4d-AjbTV5jYFZk2O6FS0r6kfEPDVO9XhWqTwRui0kH12fNX_uNXXD53Aq-Rk1ZmLtlA-AWJX5qi0Mk_EhaxnzTXtbylE0_DjZ4jSYNxDNu2gqOpQ"/>
</div>
<h3 class="font-title-md text-on-surface mb-1">Dr. Sarah Jenkins</h3>
<p class="font-label-sm text-secondary mb-3">Chief Technology Officer</p>
<p class="text-body-md text-on-surface-variant line-clamp-2">Leading the university's digital transformation initiatives.</p>
</div>
<!-- Speaker Card 2 -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex flex-col items-center text-center hover:shadow-md transition-shadow group">
<div class="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-surface-container-high group-hover:border-primary transition-colors">
<img alt="" class="w-full h-full object-cover" data-alt="A professional headshot of an authoritative, mature man with silver hair, wearing a sharp grey suit and subtle patterned tie. He has a warm but serious expression. The background is a clean, bright, out-of-focus boardroom setting. The image uses a corporate modern aesthetic with high contrast and precise alignment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRtYDKLAPQI4IMUZzZWL8KxDe_z0J8gndEi6iSTfEKiSoFk47jf56lZ40CqXd_b4EMvfq_9DGok2ZKzOMf9hHIyudxTgRv1BFNtQskrzBUb59vlT_8vjmIfWpC3wZimayf2kTsxCva9SFdhHbyLiSh_EZfL0K97ircHePg481SZ_VsUQzm1gFBOMoyxnyeNBuOM5mgELhUxlQJPo4y9uhVw-PXb7WltfS-ZVLM9RgoKeonOa5kickTYvJaZmAUjvm2Ng23UC9SXw"/>
</div>
<h3 class="font-title-md text-on-surface mb-1">Prof. Michael Chen</h3>
<p class="font-label-sm text-secondary mb-3">Head of AI Research</p>
<p class="text-body-md text-on-surface-variant line-clamp-2">Specializing in predictive modeling for student success.</p>
</div>
<!-- Speaker Card 3 -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex flex-col items-center text-center hover:shadow-md transition-shadow group">
<div class="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-surface-container-high group-hover:border-primary transition-colors">
<img alt="" class="w-full h-full object-cover" data-alt="A professional headshot of a younger female academic professional with a bright, welcoming smile. She is wearing a smart-casual olive blouse. The lighting is soft and natural, suggesting an approachable yet highly competent demeanor. The background is a pristine white wall with a hint of architectural shadow, maintaining an academic, built-to-last structural feel." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMrnfUW2A83mdSl2dMWlpCWJQNwuhADBN72LreNdIK9pzjniUsrySsg_F5PL2UcNnYEccUweXwCyixqyNcPzfj4H7PTOZ83FGZckjFPfdpB7dvTqDdCGw2EbY69RsEg5zKHoX67ULG9fBZHVg0Apuji5v4l8Ssc9REi9e-BsGyjxCeaBG3QT-cl3zDPhuxoxL79_kZaKtKWkw1oaua54cLQqf0X0LReRZpdBmtll3Yr6bSZovXd-ybHQHTMs2ujGvJCIbHVK8rnQ"/>
</div>
<h3 class="font-title-md text-on-surface mb-1">Elena Rodriguez</h3>
<p class="font-label-sm text-secondary mb-3">Director of Sustainability</p>
<p class="text-body-md text-on-surface-variant line-clamp-2">Championing green campus infrastructure projects.</p>
</div>
</div>
</section>
</div>
<!-- Right Column: Sticky Sidebar (30%) -->
<aside class="w-full md:w-[30%]">
<div class="sticky top-[100px] flex flex-col gap-md">
<!-- Ticket Registration Card -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg shadow-[0px_4px_20px_rgba(46,49,146,0.08)]">
<div class="flex justify-between items-start mb-4">
<h2 class="font-headline-md text-headline-md text-on-surface">Registration</h2>
<!-- Status Indicator Chip -->
<span class="bg-error-container/30 text-error border border-error/20 px-2 py-1 rounded font-label-sm flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">local_fire_department</span>
                                Fast Selling
                            </span>
</div>
<div class="mb-6">
<p class="text-secondary font-label-sm uppercase tracking-wide mb-1">General Admission</p>
<div class="flex items-baseline gap-2">
<span class="font-display-lg text-display-lg text-primary">$149</span>
<span class="text-on-surface-variant font-body-md">/ person</span>
</div>
<p class="text-body-md text-on-surface-variant mt-2 border-t border-outline-variant pt-2">Includes access to all sessions, breakfast, and networking lunch.</p>
</div>
<div class="space-y-3 mb-6">
<label class="flex items-center gap-3 p-3 border border-primary bg-primary-container/5 rounded-lg cursor-pointer">
<input checked="" class="text-primary focus:ring-primary h-4 w-4 border-outline-variant" name="ticket_type" type="radio"/>
<div>
<p class="font-title-md text-on-surface">General Admission</p>
<p class="text-label-sm text-secondary">$149.00</p>
</div>
</label>
<label class="flex items-center gap-3 p-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors opacity-60">
<input class="text-primary focus:ring-primary h-4 w-4 border-outline-variant" disabled="" name="ticket_type" type="radio"/>
<div>
<p class="font-title-md text-on-surface flex items-center gap-2">Early Bird <span class="bg-surface-dim text-on-surface-variant px-1 rounded text-[10px] uppercase">Sold Out</span></p>
<p class="text-label-sm text-secondary line-through">$99.00</p>
</div>
</label>
</div>
<button class="w-full bg-primary hover:bg-primary-fixed-dim hover:text-primary text-on-primary font-title-md py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mb-4">
                            Register Now
                            <span class="material-symbols-outlined">arrow_forward</span>
</button>
<p class="text-center text-label-sm text-error flex items-center justify-center gap-1">
<span class="material-symbols-outlined text-[16px]">warning</span>
                            Registration closes in 2 days
                        </p>
</div>
<!-- Actions Card -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex justify-around">
<button class="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors p-2">
<span class="material-symbols-outlined">share</span>
<span class="font-label-sm">Share</span>
</button>
<div class="w-[1px] bg-outline-variant"></div>
<button class="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors p-2">
<span class="material-symbols-outlined">bookmark_add</span>
<span class="font-label-sm">Save</span>
</button>
<div class="w-[1px] bg-outline-variant"></div>
<button class="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors p-2">
<span class="material-symbols-outlined">event_available</span>
<span class="font-label-sm">Add to Cal</span>
</button>
</div>
</div>
</aside>
</div>
</main>
<!-- Footer Shared Component -->
<footer class="bg-surface-container-low border-t border-outline-variant mt-auto">
<div class="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-lg max-w-7xl mx-auto">
<div class="flex items-center gap-2 mb-4 md:mb-0">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">confirmation_number</span>
<span class="font-headline-sm text-headline-sm font-bold text-primary">Eventura</span>
</div>
<p class="font-label-sm text-label-sm text-on-surface-variant mb-4 md:mb-0 text-center md:text-left">
                © 2024 Eventura. Institutional Grade Event Management.
            </p>
<div class="flex flex-wrap justify-center gap-md font-label-sm text-label-sm text-on-surface-variant">
<a class="hover:text-primary underline transition-all" href="#">Terms of Service</a>
<a class="hover:text-primary underline transition-all" href="#">Privacy Policy</a>
<a class="hover:text-primary underline transition-all" href="#">Institutional Support</a>
<a class="hover:text-primary underline transition-all" href="#">API Documentation</a>
</div>
</div>
</footer>
</body></html>
```

---

## PAGE: event_detail_post_purchase_flow

```html
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Event Detail - Eventura</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Public Sans"],
                        "display-lg": ["Public Sans"],
                        "label-sm": ["Inter"],
                        "title-md": ["Inter"],
                        "headline-lg": ["Public Sans"]
                    },
                    "fontSize": {
                        "body-md": ["14px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400" }],
                        "body-lg": ["16px", { "lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "1.3", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "0.02em", "fontWeight": "700" }],
                        "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
                        "title-md": ["18px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "0.015em", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
<!-- TopNavBar Shared Component -->
<header class="bg-surface border-b border-outline-variant sticky top-0 z-40">
<div class="flex justify-between items-center w-full px-margin-desktop h-16 max-w-7xl mx-auto">
<div class="flex items-center gap-lg">
<a class="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">confirmation_number</span>
                    Eventura
                </a>
<div class="relative hidden lg:block">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input class="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-64" placeholder="Search events..." type="text"/>
</div>
</div>
<nav class="hidden md:flex items-center h-full gap-lg">
<a class="text-primary font-bold border-b-2 border-primary h-full flex items-center hover:text-primary transition-colors" href="#">Discover</a>
<a class="text-on-surface-variant h-full flex items-center hover:text-primary transition-colors" href="#">My Events</a>
<a class="text-on-surface-variant h-full flex items-center hover:text-primary transition-colors" href="#">Calendar</a>
</nav>
<div class="flex items-center gap-md">
<button class="hidden lg:flex text-body-md font-label-sm text-secondary border border-outline-variant bg-surface hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors items-center gap-2">
                    Switch to Organizer
                </button>
<button class="font-label-sm text-on-primary bg-primary hover:bg-primary-fixed-dim hover:text-primary px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-sm">add</span>
                    Create Event
                </button>
<div class="flex items-center gap-2 border-l border-outline-variant pl-4 ml-2">
<button class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-low">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-low">
<span class="material-symbols-outlined">help_outline</span>
</button>
<button class="ml-2 w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
<img alt="User profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxnYliy9b0QFNgjNwWT72ij7_N7-E_AG9QE6TtS2HziwmgwJNX9mKinyzEOOoG52Ml3VV4_1rvHtlzPr1Zo7t1mybYM1I8HtqX0JJIUK86odjr-bOE2jF_L-AODwBqS734fDwGRmUG6hhVXkrqeOA5EeMZH1Rwz-VfH8U3rCUwBVOOxEX2pCOaznhPIip2Ja2u91enpdkv54Wor4tXrdrcNscrb7kk-8RWikdLOy5h8Z05LyidXVx8gCR7-HDmkBicqbX__8wtDg"/>
</button>
</div>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
<!-- Breadcrumbs -->
<nav aria-label="Breadcrumb" class="flex items-center text-body-md text-secondary mb-md">
<ol class="flex items-center space-x-2">
<li><a class="hover:underline" href="#">Home</a></li>
<li><span class="material-symbols-outlined text-sm">chevron_right</span></li>
<li><a class="hover:underline" href="#">Discover</a></li>
<li><span class="material-symbols-outlined text-sm">chevron_right</span></li>
<li aria-current="page" class="text-on-surface font-semibold">Annual Innovation Summit 2024</li>
</ol>
</nav>
<!-- Hero Cover -->
<div class="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden relative mb-xl border border-outline-variant shadow-sm bg-surface-container-low">
<img alt="" class="w-full h-full object-cover" data-alt="A wide, high-resolution photograph of a modern, brightly lit university auditorium filled with attendees listening to a keynote speaker. The aesthetic is highly professional, corporate modern, reflecting academic prestige. The lighting is bright and even, highlighting the clean architectural lines of the venue and the engaged audience. The color palette features deep indigo blues of the stage backdrop contrasting with warm, neutral tones of the wood paneling and crisp white structural elements." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWTXLBIJ9xNidZGWXjkiGASTLyd-keNNSTYG4k0u7zR11qXztRA_6GVRTnHasOCLpnR1FDs_x6SaBiKQuVizPphJjn09v4gJjP9aN9FsZEXpt_ofqg8bN8VmNHXXaPf07zuKFKu9lRDF4jNtt5P7SMfzz-rBCCGZZjDxujbqkYMgeIFQ3nCtH7Xtb-SIJvHrsa7H7KBuvjzP_iZlYwAA2pnkjswb7j3_bCl3RvP1zEb5rVMbE6VoF_rL7ZoiRCh-LXmcnt08YMAg"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
<div class="absolute bottom-0 left-0 p-lg md:p-xl w-full">
<div class="flex items-center gap-2 mb-2">
<span class="px-3 py-1 bg-primary/90 text-on-primary rounded text-label-sm uppercase tracking-wider backdrop-blur-sm border border-white/20">Technology</span>
<span class="px-3 py-1 bg-surface/90 text-primary rounded text-label-sm uppercase tracking-wider backdrop-blur-sm border border-outline-variant">In-Person</span>
</div>
<h1 class="font-display-lg text-display-lg text-white mb-2 shadow-sm">Annual Innovation Summit 2024</h1>
<p class="text-white/90 font-title-md text-title-md max-w-2xl">Exploring the frontiers of artificial intelligence and sustainable technology in higher education.</p>
</div>
</div>
<div class="flex flex-col md:flex-row gap-gutter">
<!-- Left Column: Content (70%) -->
<div class="w-full md:w-[70%] flex flex-col gap-xl">
<!-- Metadata Bento Grid -->
<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
<!-- Date -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex items-start gap-3 hover:border-primary transition-colors">
<div class="p-2 bg-primary-container text-on-primary-container rounded-lg shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
</div>
<div>
<h3 class="font-label-sm text-secondary mb-1">Date</h3>
<p class="font-title-md text-on-surface">October 15, 2024</p>
<p class="text-body-md text-on-surface-variant mt-1">Tuesday</p>
</div>
</div>
<!-- Time -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex items-start gap-3 hover:border-primary transition-colors">
<div class="p-2 bg-primary-container text-on-primary-container rounded-lg shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">schedule</span>
</div>
<div>
<h3 class="font-label-sm text-secondary mb-1">Time</h3>
<p class="font-title-md text-on-surface">9:00 AM</p>
<p class="text-body-md text-on-surface-variant mt-1">to 5:00 PM EST</p>
</div>
</div>
<!-- Venue -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex items-start gap-3 hover:border-primary transition-colors sm:col-span-2 lg:col-span-2">
<div class="p-2 bg-primary-container text-on-primary-container rounded-lg shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">location_on</span>
</div>
<div class="flex-grow flex justify-between items-center gap-4">
<div>
<h3 class="font-label-sm text-secondary mb-1">Venue</h3>
<p class="font-title-md text-on-surface">Main Auditorium</p>
<p class="text-body-md text-on-surface-variant mt-1">State University Campus, Building A</p>
</div>
<div class="w-20 h-20 rounded-lg overflow-hidden border border-outline-variant shrink-0 bg-surface-container">
<img alt="Map" class="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply" data-alt="A clean, minimalist digital map interface showing a specific location marked with a professional deep indigo pin. The map style uses subtle, low-contrast grays and crisp white roads, fitting a corporate or institutional aesthetic. It avoids cluttered street names, focusing instead on structural clarity and precise alignment." data-location="University Campus Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Rlkta4htW0b4GggDyfzFNAYSg5I64Mfn8EPNu4iSH_QL_veqIVJaaGUG9aLccWd96Ap7QpS5FgQmsqq6gjT_3gFwD_Wg0HIKtyiCFDdfIr90xOtGI9uTTCvDuwXXPuyYZ48aTsNAeBZqR809txE6XapWsFsKjzmkP1h0BhWE-aLA_9QhlGuseEiyAREzA6sG44T38_vwrCjoOn6aAm5wzzjtYUBTTT7InsQp9yZ2-cMgTzLcLfOVFgSxgp-fIF20mhN9HKnT9g"/>
</div>
</div>
</div>
</section>
<!-- About Section -->
<section class="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl">
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-md pb-4 border-b border-outline-variant flex items-center gap-2">
<span class="material-symbols-outlined text-primary">info</span>
                        About This Event
                    </h2>
<div class="prose prose-slate max-w-none text-body-lg text-on-surface-variant space-y-4">
<p>The Annual Innovation Summit is our flagship event dedicated to exploring the intersection of technology and higher education. This year, we are focusing on how artificial intelligence, machine learning, and sustainable infrastructure are reshaping the academic landscape and operational efficiency of institutions globally.</p>
<p>Join leading academics, industry pioneers, and administrative professionals for a full day of insightful keynotes, interactive panel discussions, and hands-on workshops. Attendees will have the opportunity to network with peers, discover emerging technological solutions, and engage in critical dialogues about the future of institutional excellence.</p>
<ul class="list-disc pl-5 space-y-2 mt-4 text-on-surface">
<li>Comprehensive insights into AI adoption in university administration.</li>
<li>Case studies on sustainable campus initiatives.</li>
<li>Networking opportunities with tech leaders and academic peers.</li>
</ul>
</div>
<!-- Organizer Card embedded in About -->
<div class="mt-lg pt-lg border-t border-outline-variant flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-surface-container-high border border-outline flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-secondary">account_balance</span>
</div>
<div>
<h4 class="font-label-sm text-secondary uppercase tracking-wide">Organized By</h4>
<p class="font-title-md text-on-surface">State University Office of Innovation</p>
</div>
<button class="ml-auto text-primary font-label-sm border border-primary/30 hover:bg-primary-container/20 px-4 py-2 rounded-lg transition-colors">Contact</button>
</div>
</section>
<!-- Schedule Section -->
<section class="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl">
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-lg pb-4 border-b border-outline-variant flex items-center gap-2">
<span class="material-symbols-outlined text-primary">view_agenda</span>
                        Agenda
                    </h2>
<div class="relative border-l-2 border-outline-variant ml-3 space-y-8 pb-4">
<!-- Agenda Item 1 -->
<div class="relative pl-8">
<div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface shadow-sm"></div>
<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-2">
<h3 class="font-title-md text-on-surface">Registration &amp; Welcome Breakfast</h3>
<time class="font-label-sm text-secondary bg-surface-container-low px-2 py-1 rounded">09:00 AM - 10:00 AM</time>
</div>
<p class="text-body-md text-on-surface-variant">Check-in at the main lobby and enjoy a complimentary breakfast while networking with early arrivals.</p>
</div>
<!-- Agenda Item 2 -->
<div class="relative pl-8">
<div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-container-high border-2 border-outline-variant shadow-sm"></div>
<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-2">
<h3 class="font-title-md text-on-surface">Opening Keynote: The Future of Campus Tech</h3>
<time class="font-label-sm text-secondary bg-surface-container-low px-2 py-1 rounded">10:00 AM - 11:30 AM</time>
</div>
<p class="text-body-md text-on-surface-variant mb-2">An inspiring kickoff addressing the macro trends affecting higher education technology infrastructure.</p>
<div class="flex items-center gap-2">
<img alt="" class="w-6 h-6 rounded-full border border-outline-variant" data-alt="A professional headshot of a confident, middle-aged woman in a modern corporate setting. She is wearing a tailored navy blue blazer over a crisp white shirt. The background is a slightly blurred, bright office environment conveying authority and institutional prestige. Lighting is high-key and flattering, emphasizing clarity and trustworthiness." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4TnDQB0nMCdKDAn1dWtmBx-vg0NHSBJbUsc1c_p-Z6798M8dTPC56NoI_flcjP3tcHT7TLRfDZ4IYD7uQTFo_KjG5jbbNxZVQOLd4ijBaPJ7UWEjnjxyyiK662mLoRx4pJjvL9nUPDHTYiSqRKYFM4n5jUBC2ZxTPyPGZ1NZxgGJpWfENWiejZVh2na-C-MCc1lVqQ_1UCMxUm0Hg7S2TbQlSdkYWUMRoMuXDam0SIaAiiWqAyTdT8UVWL4twAxk2XaCEROx2Eg"/>
<span class="font-label-sm text-secondary">Dr. Sarah Jenkins</span>
</div>
</div>
<!-- Agenda Item 3 -->
<div class="relative pl-8">
<div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-container-high border-2 border-outline-variant shadow-sm"></div>
<div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-2">
<h3 class="font-title-md text-on-surface">Panel: AI in Administrative Workflows</h3>
<time class="font-label-sm text-secondary bg-surface-container-low px-2 py-1 rounded">11:45 AM - 01:00 PM</time>
</div>
<p class="text-body-md text-on-surface-variant">A discussion on practical applications of AI to streamline university operations and student services.</p>
</div>
</div>
</section>
<!-- Speakers Section -->
<section class="mb-xl">
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-lg flex items-center gap-2">
<span class="material-symbols-outlined text-primary">groups</span>
                        Featured Speakers
                    </h2>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
<!-- Speaker Card 1 -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex flex-col items-center text-center hover:shadow-md transition-shadow group">
<div class="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-surface-container-high group-hover:border-primary transition-colors">
<img alt="" class="w-full h-full object-cover" data-alt="A professional headshot of a confident, middle-aged woman in a modern corporate setting. She is wearing a tailored navy blue blazer over a crisp white shirt. The background is a slightly blurred, bright office environment conveying authority and institutional prestige. Lighting is high-key and flattering, emphasizing clarity and trustworthiness." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRUtlaJnZ7LJOT_RqMkpaPJ_7wF9EdmlC1P9628QJvJLgZQdhPUtXw8rUmGOOxkl-F8Ijb8jme-Ci4URjTPOZtr4W0Roze6NtDLabv2hkPBL9ho-ZOIEuMaPXEef-UvBTfrb6KAn-VE-J9qZ85zXLJOW8rfg4d-AjbTV5jYFZk2O6FS0r6kfEPDVO9XhWqTwRui0kH12fNX_uNXXD53Aq-Rk1ZmLtlA-AWJX5qi0Mk_EhaxnzTXtbylE0_DjZ4jSYNxDNu2gqOpQ"/>
</div>
<h3 class="font-title-md text-on-surface mb-1">Dr. Sarah Jenkins</h3>
<p class="font-label-sm text-secondary mb-3">Chief Technology Officer</p>
<p class="text-body-md text-on-surface-variant line-clamp-2">Leading the university's digital transformation initiatives.</p>
</div>
<!-- Speaker Card 2 -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex flex-col items-center text-center hover:shadow-md transition-shadow group">
<div class="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-surface-container-high group-hover:border-primary transition-colors">
<img alt="" class="w-full h-full object-cover" data-alt="A professional headshot of an authoritative, mature man with silver hair, wearing a sharp grey suit and subtle patterned tie. He has a warm but serious expression. The background is a clean, bright, out-of-focus boardroom setting. The image uses a corporate modern aesthetic with high contrast and precise alignment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRtYDKLAPQI4IMUZzZWL8KxDe_z0J8gndEi6iSTfEKiSoFk47jf56lZ40CqXd_b4EMvfq_9DGok2ZKzOMf9hHIyudxTgRv1BFNtQskrzBUb59vlT_8vjmIfWpC3wZimayf2kTsxCva9SFdhHbyLiSh_EZfL0K97ircHePg481SZ_VsUQzm1gFBOMoyxnyeNBuOM5mgELhUxlQJPo4y9uhVw-PXb7WltfS-ZVLM9RgoKeonOa5kickTYvJaZmAUjvm2Ng23UC9SXw"/>
</div>
<h3 class="font-title-md text-on-surface mb-1">Prof. Michael Chen</h3>
<p class="font-label-sm text-secondary mb-3">Head of AI Research</p>
<p class="text-body-md text-on-surface-variant line-clamp-2">Specializing in predictive modeling for student success.</p>
</div>
<!-- Speaker Card 3 -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex flex-col items-center text-center hover:shadow-md transition-shadow group">
<div class="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-surface-container-high group-hover:border-primary transition-colors">
<img alt="" class="w-full h-full object-cover" data-alt="A professional headshot of a younger female academic professional with a bright, welcoming smile. She is wearing a smart-casual olive blouse. The lighting is soft and natural, suggesting an approachable yet highly competent demeanor. The background is a pristine white wall with a hint of architectural shadow, maintaining an academic, built-to-last structural feel." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMrnfUW2A83mdSl2dMWlpCWJQNwuhADBN72LreNdIK9pzjniUsrySsg_F5PL2UcNnYEccUweXwCyixqyNcPzfj4H7PTOZ83FGZckjFPfdpB7dvTqDdCGw2EbY69RsEg5zKHoX67ULG9fBZHVg0Apuji5v4l8Ssc9REi9e-BsGyjxCeaBG3QT-cl3zDPhuxoxL79_kZaKtKWkw1oaua54cLQqf0X0LReRZpdBmtll3Yr6bSZovXd-ybHQHTMs2ujGvJCIbHVK8rnQ"/>
</div>
<h3 class="font-title-md text-on-surface mb-1">Elena Rodriguez</h3>
<p class="font-label-sm text-secondary mb-3">Director of Sustainability</p>
<p class="text-body-md text-on-surface-variant line-clamp-2">Championing green campus infrastructure projects.</p>
</div>
</div>
</section>
</div>
<!-- Right Column: Sticky Sidebar (30%) -->
<aside class="w-full md:w-[30%]">
<div class="sticky top-[100px] flex flex-col gap-md">
<!-- Ticket Registration Card -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg shadow-[0px_4px_20px_rgba(46,49,146,0.08)]">
<div class="flex justify-between items-start mb-4">
<h2 class="font-headline-md text-headline-md text-on-surface">Registration</h2>
<!-- Status Indicator Chip -->
<span class="bg-error-container/30 text-error border border-error/20 px-2 py-1 rounded font-label-sm flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">local_fire_department</span>
                                Fast Selling
                            </span>
</div>
<div class="mb-6">
<p class="text-secondary font-label-sm uppercase tracking-wide mb-1">General Admission</p>
<div class="flex items-baseline gap-2">
<span class="font-display-lg text-display-lg text-primary">$149</span>
<span class="text-on-surface-variant font-body-md">/ person</span>
</div>
<p class="text-body-md text-on-surface-variant mt-2 border-t border-outline-variant pt-2">Includes access to all sessions, breakfast, and networking lunch.</p>
</div>
<div class="space-y-3 mb-6">
<label class="flex items-center gap-3 p-3 border border-primary bg-primary-container/5 rounded-lg cursor-pointer">
<input checked="" class="text-primary focus:ring-primary h-4 w-4 border-outline-variant" name="ticket_type" type="radio"/>
<div>
<p class="font-title-md text-on-surface">General Admission</p>
<p class="text-label-sm text-secondary">$149.00</p>
</div>
</label>
<label class="flex items-center gap-3 p-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors opacity-60">
<input class="text-primary focus:ring-primary h-4 w-4 border-outline-variant" disabled="" name="ticket_type" type="radio"/>
<div>
<p class="font-title-md text-on-surface flex items-center gap-2">Early Bird <span class="bg-surface-dim text-on-surface-variant px-1 rounded text-[10px] uppercase">Sold Out</span></p>
<p class="text-label-sm text-secondary line-through">$99.00</p>
</div>
</label>
</div>
<button class="w-full bg-primary hover:bg-primary-fixed-dim hover:text-primary text-on-primary font-title-md py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mb-4">
                            Register Now
                            <span class="material-symbols-outlined">arrow_forward</span>
</button>
<p class="text-center text-label-sm text-error flex items-center justify-center gap-1">
<span class="material-symbols-outlined text-[16px]">warning</span>
                            Registration closes in 2 days
                        </p>
</div>
<!-- Actions Card -->
<div class="bg-surface border border-outline-variant rounded-xl p-md flex justify-around">
<button class="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors p-2">
<span class="material-symbols-outlined">share</span>
<span class="font-label-sm">Share</span>
</button>
<div class="w-[1px] bg-outline-variant"></div>
<button class="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors p-2">
<span class="material-symbols-outlined">bookmark_add</span>
<span class="font-label-sm">Save</span>
</button>
<div class="w-[1px] bg-outline-variant"></div>
<button class="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors p-2">
<span class="material-symbols-outlined">event_available</span>
<span class="font-label-sm">Add to Cal</span>
</button>
</div>
</div>
</aside>
</div>
</main>
<!-- Footer Shared Component -->
<footer class="bg-surface-container-low border-t border-outline-variant mt-auto">
<div class="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-lg max-w-7xl mx-auto">
<div class="flex items-center gap-2 mb-4 md:mb-0">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">confirmation_number</span>
<span class="font-headline-sm text-headline-sm font-bold text-primary">Eventura</span>
</div>
<p class="font-label-sm text-label-sm text-on-surface-variant mb-4 md:mb-0 text-center md:text-left">
                © 2024 Eventura. Institutional Grade Event Management.
            </p>
<div class="flex flex-wrap justify-center gap-md font-label-sm text-label-sm text-on-surface-variant">
<a class="hover:text-primary underline transition-all" href="#">Terms of Service</a>
<a class="hover:text-primary underline transition-all" href="#">Privacy Policy</a>
<a class="hover:text-primary underline transition-all" href="#">Institutional Support</a>
<a class="hover:text-primary underline transition-all" href="#">API Documentation</a>
</div>
</div>
</footer>
<!-- Success Overlay (Post-Purchase Confirmation) -->
<div class="fixed inset-0 bg-on-surface/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" id="success-overlay">
<div class="bg-surface rounded-2xl shadow-lg max-w-md w-full overflow-hidden border border-outline-variant relative">
<button class="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-low" onclick="document.getElementById('success-overlay').style.display='none'">
<span class="material-symbols-outlined">close</span>
</button>
<div class="p-xl flex flex-col items-center text-center">
<div class="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6">
<span class="material-symbols-outlined text-[32px]">check_circle</span>
</div>
<h2 class="font-headline-md text-headline-md text-on-surface mb-2">Registration Successful!</h2>
<p class="text-body-lg text-on-surface-variant mb-8">You're all set for the Annual Innovation Summit 2024. Your confirmation and ticket have been sent to your email.</p>
<button class="w-full bg-primary hover:bg-primary-fixed-dim hover:text-primary text-on-primary font-title-md py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mb-6">
<span class="material-symbols-outlined">qr_code_2</span>
                View QR Ticket
            </button>
<div class="w-full">
<p class="font-label-sm text-secondary uppercase tracking-wide mb-3 text-left">Add to Calendar</p>
<div class="grid grid-cols-2 gap-3">
<button class="flex items-center justify-center gap-2 border border-outline-variant hover:border-primary hover:bg-surface-container-low text-on-surface font-title-md py-2 px-4 rounded-lg transition-colors">
<span class="material-symbols-outlined text-[20px]">calendar_today</span>
                        Google
                    </button>
<button class="flex items-center justify-center gap-2 border border-outline-variant hover:border-primary hover:bg-surface-container-low text-on-surface font-title-md py-2 px-4 rounded-lg transition-colors">
<span class="material-symbols-outlined text-[20px]">event</span>
                        Outlook
                    </button>
</div>
</div>
</div>
</div>
</div>
</body></html>
```

---

## PAGE: event_discovery

```html
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - Discover Events</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    spacing: {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    fontFamily: {
                        "body-md": ["Inter", "sans-serif"],
                        "body-lg": ["Inter", "sans-serif"],
                        "headline-md": ["Public Sans", "sans-serif"],
                        "display-lg": ["Public Sans", "sans-serif"],
                        "label-sm": ["Inter", "sans-serif"],
                        "title-md": ["Inter", "sans-serif"],
                        "headline-lg": ["Public Sans", "sans-serif"]
                    },
                    fontSize: {
                        "body-md": ["14px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" }],
                        "body-lg": ["16px", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }],
                        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "0.01em", fontWeight: "600" }],
                        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "0.02em", fontWeight: "700" }],
                        "label-sm": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
                        "title-md": ["18px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "600" }],
                        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "0.015em", fontWeight: "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-fill {
            font-variation-settings: 'FILL' 1;
        }
    </style>
</head>
<body class="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
<nav class="bg-surface dark:bg-surface-container font-body-md text-body-md docked full-width top-0 border-b border-outline-variant dark:border-outline flat no shadows opacity-100 transition-all z-50">
<div class="flex justify-between items-center w-full px-margin-desktop h-16 max-w-[1440px] mx-auto">
<div class="flex items-center gap-gutter">
<div class="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">
                    Eventura
                </div>
<div class="relative hidden md:block w-64">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
<input class="w-full h-10 pl-10 pr-4 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant" placeholder="Search events..." type="text"/>
</div>
</div>
<div class="hidden md:flex items-center h-full gap-lg">
<a class="h-full flex items-center text-primary dark:text-primary-fixed-dim font-bold border-b-2 border-primary" href="#">Discover</a>
<a class="h-full flex items-center text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#">My Events</a>
<a class="h-full flex items-center text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#">Calendar</a>
</div>
<div class="flex items-center gap-md">
<button class="hidden lg:flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span class="font-label-sm text-label-sm mr-2">Switch to Organizer</span>
</button>
<div class="h-6 w-px bg-outline-variant hidden lg:block mx-2"></div>
<button class="text-on-surface-variant hover:text-primary transition-colors relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors hidden sm:block">
<span class="material-symbols-outlined">help_outline</span>
</button>
<button class="h-10 px-4 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:brightness-95 transition-all ml-2 shadow-sm">
                    Create Event
                </button>
<div class="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant overflow-hidden ml-2 cursor-pointer">
<img alt="User profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiKpvhU39K9RIAlmnJrVJG0HQvA_FUm_Z7J9p9FcZBsdE3vbdJTRltYi3qAVM-TC3Ke03XzxTxItEw7rJbKz2bV_zMYW0gDzLtB9e3tmWaqJJxufG-3LpffzBmvVEGD4UYqIml6NkMI3cGwer1U6Ki4fbKxl7bouCtEA6KDtV3CKphSgqs_ZLtRhfgtUUcEO2OJY14LMPHqe6mDTAT01GrPVQ8pSVFBM7XMwlOawiSE921UDzak2Sl5xDpl_6xOxEx90B0Juzj_Q"/>
</div>
</div>
</div>
</nav>
<main class="flex-1 w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col lg:flex-row gap-xl">
<aside class="w-full lg:w-[260px] flex-shrink-0 flex flex-col gap-xl border-r border-outline-variant pr-md hidden lg:flex">
<div>
<h2 class="font-headline-md text-title-md text-on-surface mb-sm">Filters</h2>
<button class="text-primary font-label-sm text-label-sm hover:underline">Clear all</button>
</div>
<div class="border-t border-outline-variant pt-md">
<h3 class="font-title-md text-on-surface mb-md">College</h3>
<div class="flex flex-col gap-sm">
<label class="flex items-center gap-sm cursor-pointer group">
<input checked="" class="w-4 h-4 text-primary border-outline-variant focus:ring-primary" name="college" type="radio"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Current Institution</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant focus:ring-primary" name="college" type="radio"/>
<span class="text-on-surface group-hover:text-primary transition-colors">All Consortium</span>
</label>
</div>
</div>
<div class="border-t border-outline-variant pt-md">
<h3 class="font-title-md text-on-surface mb-md">Format</h3>
<div class="flex flex-col gap-sm">
<label class="flex items-center gap-sm cursor-pointer group">
<input checked="" class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">In-person</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Online</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Hybrid</span>
</label>
</div>
</div>
<div class="border-t border-outline-variant pt-md">
<h3 class="font-title-md text-on-surface mb-md">Category</h3>
<div class="flex flex-col gap-sm">
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Academic</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Career &amp; Alumni</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Social</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Sports &amp; Rec</span>
</label>
</div>
</div>
<div class="border-t border-outline-variant pt-md">
<h3 class="font-title-md text-on-surface mb-md">Price</h3>
<div class="flex flex-col gap-sm">
<label class="flex items-center gap-sm cursor-pointer group">
<input checked="" class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Free</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Paid</span>
</label>
</div>
</div>
</aside>
<section class="flex-1 flex flex-col gap-lg min-w-0">
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-container-low p-md border border-outline-variant rounded-xl">
<div class="flex-1 w-full max-w-md relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input class="w-full h-10 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Search events by keyword..." type="text"/>
</div>
<div class="flex items-center gap-sm w-full sm:w-auto">
<span class="text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">Sort by:</span>
<select class="h-10 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none px-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23464652%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:0.65em_auto]">
<option>Relevance</option>
<option>Date: Upcoming</option>
<option>Popularity</option>
</select>
<button class="lg:hidden h-10 px-3 border border-outline-variant rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined">filter_list</span>
</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
<article class="flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
<div class="relative h-48 w-full overflow-hidden">
<img alt="Auditorium" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A modern, high-tech university auditorium filled with students attending a guest lecture. The lighting is bright and even, highlighting the sleek wooden panels and comfortable tiered seating. A large projection screen displays academic charts. The scene conveys a sense of intellectual engagement and institutional prestige, adhering to a sophisticated corporate academic visual style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAagScjqCnnWXXZraFTWhcRr11YKfD2-fs1z6395yNiu74sg-febZRpililAv4Y_oYoFN1QrdancqelaAICujr3an40TtSNdhpTyMNbswQewDEikvwyjhOA1eIW0d556D6CBhYvQdteYaIj928zQcVqsrPW8i3-4wt5oK5SjzRZflfM4XzksPca6vzENWHeJjXPSP0x7otaUdz7g4rEx6PuJJkeMrgfBs9Ha8hC86PLBTlP9SJdoSIe0PeQKUKxv2azUe_uTAdLjg"/>
<div class="absolute top-sm left-sm flex flex-col gap-xs">
<span class="bg-surface-container-lowest/90 backdrop-blur text-primary border border-primary/20 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">Verified</span>
</div>
<div class="absolute bottom-sm right-sm bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded text-body-sm font-bold text-on-surface shadow-sm">
                            Free
                        </div>
</div>
<div class="p-md flex flex-col flex-1 gap-sm">
<div class="flex items-start justify-between gap-sm">
<h3 class="font-title-md text-on-surface line-clamp-2 leading-tight">Annual Symposium on Artificial Intelligence &amp; Ethics</h3>
</div>
<div class="flex flex-col gap-xs text-on-surface-variant mt-auto pt-sm">
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">calendar_today</span>
<span class="text-[13px]">Oct 24, 2024 • 9:00 AM</span>
</div>
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">location_on</span>
<span class="text-[13px] truncate">Main Auditorium, Science Building</span>
</div>
<div class="flex items-center gap-xs mt-1">
<div class="w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">CS</div>
<span class="text-[12px] font-medium">Computer Science Dept.</span>
</div>
</div>
<div class="border-t border-outline-variant pt-md mt-sm flex items-center gap-sm">
<button class="flex-1 h-10 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:brightness-95 transition-all">
                                Register
                            </button>
<button aria-label="Save event" class="h-10 w-10 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined">bookmark_border</span>
</button>
</div>
</div>
</article>
<article class="flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
<div class="relative h-48 w-full overflow-hidden">
<img alt="Students networking" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A bright, airy campus atrium with floor-to-ceiling windows letting in natural daylight. Groups of smartly dressed college students are standing around high-top tables, engaged in professional networking. The atmosphere is energetic yet formal. The color palette emphasizes clean whites, professional slate grays, and subtle accents of deep university indigo, presenting a modern institutional vibe." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3FOW2qA11hu0-Xcaes93ZXvnL9Gg3MdhBNu7Pt0TxSZvMMzTBi3fnh6DyQbNRolE6QHrlyPow6kgCAkrmOdkKynwXJSYs3uDeE2MVFkRpnkF8nVZyeEzcsFgLYoMzUtxm77nabQ5YGkejhTNlOvKlaGzUs3vF-5z1PmrMn6Obq9HCpBl3Udqh2dEOdoSez9amaVInk9KLcfkjGvJ9TVZsYqt5XQb416cw2JVV2T0g3d6sz3FMQwmnpBDqOs5sgaNIRhxe83LvtA"/>
<div class="absolute top-sm left-sm flex flex-col gap-xs">
<span class="bg-error/10 backdrop-blur text-error border border-error/20 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">Limited Seats</span>
</div>
<div class="absolute bottom-sm right-sm bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded text-body-sm font-bold text-on-surface shadow-sm">
                            $15.00
                        </div>
</div>
<div class="p-md flex flex-col flex-1 gap-sm">
<div class="flex items-start justify-between gap-sm">
<h3 class="font-title-md text-on-surface line-clamp-2 leading-tight">Alumni Networking Mixer: Finance &amp; Consulting</h3>
</div>
<div class="flex flex-col gap-xs text-on-surface-variant mt-auto pt-sm">
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">calendar_today</span>
<span class="text-[13px]">Nov 02, 2024 • 6:00 PM</span>
</div>
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">location_on</span>
<span class="text-[13px] truncate">Student Union Grand Hall</span>
</div>
<div class="flex items-center gap-xs mt-1">
<div class="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold">CS</div>
<span class="text-[12px] font-medium">Career Services</span>
</div>
</div>
<div class="border-t border-outline-variant pt-md mt-sm flex items-center gap-sm">
<button class="flex-1 h-10 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:brightness-95 transition-all">
                                Register
                            </button>
<button aria-label="Save event" class="h-10 w-10 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined">bookmark_border</span>
</button>
</div>
</div>
</article>
<article class="flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
<div class="relative h-48 w-full overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-br from-primary-container to-primary opacity-90 z-0"></div>
<div class="absolute inset-0 flex items-center justify-center z-10 text-on-primary opacity-20">
<span class="material-symbols-outlined text-[80px]">laptop_mac</span>
</div>
<div class="absolute top-sm left-sm z-20 flex flex-col gap-xs">
<span class="bg-surface-container-lowest/90 backdrop-blur text-primary border border-primary/20 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">Online</span>
</div>
<div class="absolute bottom-sm right-sm z-20 bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded text-body-sm font-bold text-on-surface shadow-sm">
                            Free
                        </div>
</div>
<div class="p-md flex flex-col flex-1 gap-sm relative z-20 bg-surface-container-lowest">
<div class="flex items-start justify-between gap-sm">
<h3 class="font-title-md text-on-surface line-clamp-2 leading-tight">Mastering Graduate School Applications Workshop</h3>
</div>
<div class="flex flex-col gap-xs text-on-surface-variant mt-auto pt-sm">
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">calendar_today</span>
<span class="text-[13px]">Nov 05, 2024 • 4:00 PM</span>
</div>
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">videocam</span>
<span class="text-[13px] truncate">Virtual Event (Zoom)</span>
</div>
<div class="flex items-center gap-xs mt-1">
<div class="w-5 h-5 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center text-[10px] font-bold text-on-surface">AA</div>
<span class="text-[12px] font-medium">Academic Advising</span>
</div>
</div>
<div class="border-t border-outline-variant pt-md mt-sm flex items-center gap-sm">
<button class="flex-1 h-10 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:brightness-95 transition-all">
                                Register
                            </button>
<button aria-label="Save event" class="h-10 w-10 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined">bookmark_border</span>
</button>
</div>
</div>
</article>
</div>
</section>
</main>
<footer class="bg-surface-container-low dark:bg-surface-dim font-label-sm text-label-sm full-width bottom-0 border-t border-outline-variant dark:border-outline flat no shadows opacity-100 mt-auto z-10">
<div class="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-lg max-w-7xl mx-auto gap-md">
<div class="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">
                Eventura
            </div>
<div class="text-on-surface-variant dark:text-on-secondary-fixed-variant text-center md:text-left">
                © 2024 Eventura. Institutional Grade Event Management.
            </div>
<div class="flex flex-wrap justify-center gap-md">
<a class="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim underline transition-all" href="#">Terms of Service</a>
<a class="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim underline transition-all" href="#">Privacy Policy</a>
<a class="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim underline transition-all" href="#">Institutional Support</a>
<a class="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim underline transition-all" href="#">API Documentation</a>
</div>
</div>
</footer>
</body></html>
```

---

## PAGE: event_manager_scan_history_audit

```html
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Scan History &amp; Resolution - Eventura</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "outline": "#777683",
                    "secondary-container": "#d5e3fc",
                    "on-background": "#1b1b21",
                    "tertiary-fixed-dim": "#e9c349",
                    "outline-variant": "#c7c5d4",
                    "surface-dim": "#dbd9e1",
                    "on-secondary-fixed-variant": "#3a485b",
                    "inverse-on-surface": "#f2eff8",
                    "secondary": "#515f74",
                    "primary-fixed": "#e1e0ff",
                    "inverse-primary": "#c0c1ff",
                    "on-secondary": "#ffffff",
                    "tertiary-fixed": "#ffe088",
                    "primary": "#15157d",
                    "tertiary": "#735c00",
                    "on-secondary-container": "#57657a",
                    "on-tertiary-fixed": "#241a00",
                    "surface-container-lowest": "#ffffff",
                    "on-tertiary-container": "#4f3d00",
                    "on-surface": "#1b1b21",
                    "surface-container": "#f0ecf5",
                    "surface": "#fcf8ff",
                    "on-error-container": "#93000a",
                    "surface-variant": "#e4e1ea",
                    "surface-container-low": "#f5f2fb",
                    "on-error": "#ffffff",
                    "error": "#ba1a1a",
                    "tertiary-container": "#cca730",
                    "on-tertiary": "#ffffff",
                    "on-primary-fixed-variant": "#373a9b",
                    "secondary-fixed": "#d5e3fc",
                    "on-primary-fixed": "#04006d",
                    "on-tertiary-fixed-variant": "#574500",
                    "secondary-fixed-dim": "#b9c7df",
                    "on-primary-container": "#9da1ff",
                    "on-primary": "#ffffff",
                    "on-surface-variant": "#464652",
                    "inverse-surface": "#303036",
                    "on-secondary-fixed": "#0d1c2e",
                    "surface-container-highest": "#e4e1ea",
                    "primary-fixed-dim": "#c0c1ff",
                    "surface-container-high": "#eae7f0",
                    "surface-tint": "#4f54b4",
                    "surface-bright": "#fcf8ff",
                    "error-container": "#ffdad6",
                    "background": "#fcf8ff",
                    "primary-container": "#2e3192"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "xl": "40px",
                    "xs": "4px",
                    "sm": "8px",
                    "margin-mobile": "16px",
                    "md": "16px",
                    "unit": "4px",
                    "lg": "24px",
                    "gutter": "24px",
                    "margin-desktop": "48px"
            },
            "fontFamily": {
                    "body-md": [
                            "Inter"
                    ],
                    "body-lg": [
                            "Inter"
                    ],
                    "headline-lg": [
                            "Public Sans"
                    ],
                    "title-md": [
                            "Inter"
                    ],
                    "headline-md": [
                            "Public Sans"
                    ],
                    "display-lg": [
                            "Public Sans"
                    ],
                    "label-sm": [
                            "Inter"
                    ]
            },
            "fontSize": {
                    "body-md": [
                            "14px",
                            {
                                    "lineHeight": "1.5",
                                    "letterSpacing": "0em",
                                    "fontWeight": "400"
                            }
                    ],
                    "body-lg": [
                            "16px",
                            {
                                    "lineHeight": "1.6",
                                    "letterSpacing": "0em",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-lg": [
                            "32px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "0.015em",
                                    "fontWeight": "600"
                            }
                    ],
                    "title-md": [
                            "18px",
                            {
                                    "lineHeight": "1.5",
                                    "letterSpacing": "0em",
                                    "fontWeight": "600"
                            }
                    ],
                    "headline-md": [
                            "24px",
                            {
                                    "lineHeight": "1.3",
                                    "letterSpacing": "0.01em",
                                    "fontWeight": "600"
                            }
                    ],
                    "display-lg": [
                            "48px",
                            {
                                    "lineHeight": "1.1",
                                    "letterSpacing": "0.02em",
                                    "fontWeight": "700"
                            }
                    ],
                    "label-sm": [
                            "12px",
                            {
                                    "lineHeight": "1",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "600"
                            }
                    ]
            }
    },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined[data-weight="fill"] {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen flex antialiased">
<!-- SideNavBar -->
<nav class="bg-primary dark:bg-surface-container-highest flex flex-col h-full border-r border-outline-variant dark:border-outline docked left-0 h-full w-64 shadow-sm hidden md:flex shrink-0 fixed top-0 bottom-0 z-20">
<div class="p-lg border-b border-outline-variant/20 mb-sm">
<div class="flex items-center gap-sm">
<img alt="University Logo" class="w-10 h-10 rounded-full object-cover" data-alt="A refined, modern corporate logo icon suitable for a high-end academic institution, featuring deep indigo and gold colors on a pristine white background. The logo conveys trust, reliability, and institutional excellence." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm6AwQYR--uVU_R2cEG2g010dCFHSzGpqSg_DteaSFJ9ofzQX2CRXh3AS-9n5ZPMrCoe8Ard4Hqa9YCO8BUZ0lAkN4Hdmp9IMHGpCZJggt7NPiCNYZFlopCLuk13OjHa-W1AG5AtAoZkJ9FSyyEu05VqRyWlvKzLpzgOXeSJO6ox1769J2izXWL4tDFAxPLpYlE8aU1c-IPeG89Ju_eMtDTdqGcTV5ECEDvjhAslPMqMwTW9BuscwYsHKJq0VgyYcE4IxIZR5_ZA"/>
<div>
<h2 class="font-headline-sm text-headline-sm font-bold text-on-primary dark:text-on-surface">Eventura Admin</h2>
<p class="font-label-sm text-label-sm text-on-primary/70">State University</p>
</div>
</div>
<button class="w-full mt-md bg-secondary-container text-on-secondary-container font-title-md text-title-md py-sm rounded-DEFAULT flex items-center justify-center gap-xs hover:bg-secondary-container/90 transition-colors">
<span class="material-symbols-outlined text-[20px]">add</span>
                New Campaign
            </button>
</div>
<div class="flex-1 overflow-y-auto py-sm">
<a class="flex items-center gap-sm text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-title-md text-title-md">Dashboard</span>
</a>
<a class="flex items-center gap-sm bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-lg mx-2 my-1 px-4 py-3 Active: scale-95 transition-transform" href="#">
<span class="material-symbols-outlined">event</span>
<span class="font-title-md text-title-md">Events</span>
</a>
<a class="flex items-center gap-sm text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">bar_chart</span>
<span class="font-title-md text-title-md">Analytics</span>
</a>
<a class="flex items-center gap-sm text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="font-title-md text-title-md">Settings</span>
</a>
<a class="flex items-center gap-sm text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">admin_panel_settings</span>
<span class="font-title-md text-title-md">Admin Console</span>
</a>
</div>
<div class="p-sm border-t border-outline-variant/20 mt-auto">
<a class="flex items-center gap-sm text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">contact_support</span>
<span class="font-title-md text-title-md">Support</span>
</a>
<a class="flex items-center gap-sm text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">logout</span>
<span class="font-title-md text-title-md">Logout</span>
</a>
</div>
</nav>
<!-- Main Content Wrapper -->
<div class="flex-1 flex flex-col md:ml-64 min-w-0">
<!-- TopNavBar (Mobile Only Context here based on layout instructions, but we render full desktop nav per requirements if it was top level, however this is a sub-page of Events. We will render a contextual header instead of the global top nav as per semantic shell mandate, BUT the prompt explicitly requests TopNavBar to be included. I will include it, but adapt it slightly for the context while respecting JSON.) -->
<header class="bg-surface dark:bg-surface-container docked full-width top-0 border-b border-outline-variant dark:border-outline flat no shadows flex justify-between items-center w-full px-margin-desktop h-16 shrink-0 z-10 sticky top-0 md:hidden">
<div class="flex items-center gap-lg">
<span class="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Eventura</span>
<nav class="hidden md:flex items-center gap-lg h-full">
<a class="text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors h-full flex items-center font-body-md text-body-md" href="#">Discover</a>
<a class="text-primary dark:text-primary-fixed-dim font-bold border-b-2 border-primary h-full flex items-center font-body-md text-body-md Active: opacity-80 transition-all" href="#">My Events</a>
<a class="text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors h-full flex items-center font-body-md text-body-md" href="#">Calendar</a>
</nav>
</div>
<div class="flex items-center gap-md">
<button class="hidden lg:block bg-primary text-on-primary px-4 py-2 rounded-DEFAULT font-title-md text-title-md hover:bg-primary/90 transition-colors">Create Event</button>
<button class="hidden lg:block border border-outline-variant bg-surface text-on-surface px-4 py-2 rounded-DEFAULT font-title-md text-title-md hover:bg-surface-variant transition-colors">Switch to Organizer</button>
<div class="flex items-center gap-xs">
<button class="p-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="p-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant">
<span class="material-symbols-outlined">help_outline</span>
</button>
</div>
<img alt="User profile" class="w-8 h-8 rounded-full border border-outline-variant" data-alt="A professional headshot of a mature event administrator, wearing formal business attire. Crisp lighting, white background, conveying authority and approachability in a corporate setting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaahUiH-hjPhL8S8_BjkNpiAEuj4F-STar-O7NytM6EEKxNU3BtgpMzlWV6lF5PFi7lYR8NRuAsCyu98vpZ61G-j-syc2qkDpH3EnURlHdadWHDZ7kw6WWvoDdpTPa_GDcclGO1TekawYorfsGo21q7nuO-KiTnehwpT22qzsrvtZK2XVWgKvRbYLC_4xuc0dRsZAYKQo2w6-c25MNwe5gHX0TxkHHncismiFcrmwnD8nKUYRgRd6202I0W2Uin6vOD65F_0GIGg"/>
</div>
</header>
<!-- Canvas -->
<main class="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto">
<!-- Breadcrumbs & Context Header -->
<div class="mb-xl">
<div class="flex items-center gap-xs text-secondary font-label-sm text-label-sm mb-sm">
<a class="hover:underline" href="#">Events</a>
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
<a class="hover:underline" href="#">Annual Innovation Summit 2024</a>
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-on-surface">Scan History</span>
</div>
<div class="flex flex-col md:flex-row md:items-end justify-between gap-md">
<div>
<h1 class="font-headline-lg text-headline-lg text-on-surface">Scan History &amp; Resolution</h1>
<p class="font-body-lg text-body-lg text-secondary mt-xs">Real-time check-in feed and dispute management for Annual Innovation Summit 2024.</p>
</div>
<div class="flex gap-sm">
<button class="bg-surface text-secondary border border-outline-variant px-4 py-2 rounded-DEFAULT font-title-md text-title-md hover:bg-surface-variant transition-colors flex items-center gap-xs">
<span class="material-symbols-outlined text-[20px]">filter_list</span>
                            Filter
                        </button>
<button class="bg-surface text-secondary border border-outline-variant px-4 py-2 rounded-DEFAULT font-title-md text-title-md hover:bg-surface-variant transition-colors flex items-center gap-xs">
<span class="material-symbols-outlined text-[20px]">download</span>
                            Export
                        </button>
</div>
</div>
</div>
<!-- Bento Grid Layout for High-End UI Feel -->
<div class="grid grid-cols-1 xl:grid-cols-3 gap-lg mb-xl">
<!-- KPI Card 1 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between">
<div class="flex justify-between items-start mb-md">
<span class="font-title-md text-title-md text-secondary">Total Scans Today</span>
<div class="p-sm bg-primary-container/10 rounded-lg text-primary">
<span class="material-symbols-outlined">qr_code_scanner</span>
</div>
</div>
<div>
<span class="font-display-lg text-display-lg text-on-surface">1,248</span>
<div class="flex items-center gap-xs mt-xs text-primary-container font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px]">trending_up</span>
<span>+12% from last hour</span>
</div>
</div>
</div>
<!-- KPI Card 2 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between">
<div class="flex justify-between items-start mb-md">
<span class="font-title-md text-title-md text-secondary">Duplicate Attempts</span>
<div class="p-sm bg-error-container/20 rounded-lg text-error">
<span class="material-symbols-outlined">warning</span>
</div>
</div>
<div>
<span class="font-display-lg text-display-lg text-on-surface">14</span>
<div class="flex items-center gap-xs mt-xs text-secondary font-label-sm text-label-sm">
<span>Requires manual review</span>
</div>
</div>
</div>
<!-- KPI Card 3 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between">
<div class="flex justify-between items-start mb-md">
<span class="font-title-md text-title-md text-secondary">Verified Check-ins</span>
<div class="p-sm bg-surface-container-high rounded-lg text-secondary">
<span class="material-symbols-outlined">how_to_reg</span>
</div>
</div>
<div>
<span class="font-display-lg text-display-lg text-on-surface">1,190</span>
<div class="flex items-center gap-xs mt-xs text-secondary font-label-sm text-label-sm">
<span>95.3% success rate</span>
</div>
</div>
</div>
</div>
<!-- Main Data Table Container -->
<div class="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-[0px_4px_20px_rgba(46,49,146,0.02)]">
<!-- Table Header Actions -->
<div class="p-md border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-lowest">
<div class="relative w-full max-w-md">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input class="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Search by name, ticket ID, or status..." type="text"/>
</div>
<div class="flex items-center gap-sm text-secondary font-label-sm text-label-sm">
<span>Live Feed Active</span>
<span class="relative flex h-3 w-3">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
</span>
</div>
</div>
<!-- Data Table -->
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low border-b border-outline-variant/50">
<th class="py-sm px-md font-label-sm text-label-sm text-secondary font-semibold">SCAN TIMESTAMP</th>
<th class="py-sm px-md font-label-sm text-label-sm text-secondary font-semibold">ATTENDEE</th>
<th class="py-sm px-md font-label-sm text-label-sm text-secondary font-semibold">PAYMENT STATUS</th>
<th class="py-sm px-md font-label-sm text-label-sm text-secondary font-semibold">SCAN RESULT</th>
<th class="py-sm px-md font-label-sm text-label-sm text-secondary font-semibold text-right">ACTION</th>
</tr>
</thead>
<tbody class="font-body-md divide-y divide-outline-variant/30">
<!-- Row 1: Valid -->
<tr class="hover:bg-surface-container-lowest transition-colors group">
<td class="py-md px-md text-secondary">
<div class="font-body-md text-on-surface">10:42:15 AM</div>
<div class="font-label-sm text-outline">Oct 24, 2024</div>
</td>
<td class="py-md px-md">
<div class="font-title-md text-on-surface">Sarah Jenkins</div>
<div class="font-label-sm text-secondary">TKT-8901-XZ</div>
</td>
<td class="py-md px-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded-sm bg-surface-container text-on-surface-variant font-label-sm">
<span class="material-symbols-outlined text-[14px]">check_circle</span>
                                        Verified
                                    </span>
</td>
<td class="py-md px-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded-sm bg-[#d1fae5] text-[#047857] font-label-sm border border-[#34d399]/30">
<span class="material-symbols-outlined text-[14px]">done_all</span>
                                        Valid Entry
                                    </span>
</td>
<td class="py-md px-md text-right">
<button class="text-secondary hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<!-- Row 2: Duplicate (Warning State) -->
<tr class="bg-error-container/5 hover:bg-error-container/10 transition-colors group border-l-2 border-l-error">
<td class="py-md px-md text-secondary">
<div class="font-body-md text-on-surface font-semibold">10:41:03 AM</div>
<div class="font-label-sm text-error">Just now</div>
</td>
<td class="py-md px-md">
<div class="font-title-md text-on-surface">Michael Chang</div>
<div class="font-label-sm text-secondary">TKT-4422-BC</div>
</td>
<td class="py-md px-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded-sm bg-surface-container text-on-surface-variant font-label-sm">
<span class="material-symbols-outlined text-[14px]">check_circle</span>
                                        Verified
                                    </span>
</td>
<td class="py-md px-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded-sm bg-error-container text-error font-label-sm border border-error/30 font-bold">
<span class="material-symbols-outlined text-[14px]">warning</span>
                                        Duplicate Scan
                                    </span>
<div class="font-label-sm text-secondary mt-1">Prev: 09:15 AM (Gate A)</div>
</td>
<td class="py-md px-md text-right">
<button class="bg-surface border border-outline-variant text-on-surface px-3 py-1.5 rounded-DEFAULT font-label-sm hover:bg-surface-variant transition-colors shadow-sm">
                                        Resolve
                                    </button>
</td>
</tr>
<!-- Row 3: Pending Payment -->
<tr class="hover:bg-surface-container-lowest transition-colors group">
<td class="py-md px-md text-secondary">
<div class="font-body-md text-on-surface">10:38:45 AM</div>
<div class="font-label-sm text-outline">Oct 24, 2024</div>
</td>
<td class="py-md px-md">
<div class="font-title-md text-on-surface">Elena Rodriguez</div>
<div class="font-label-sm text-secondary">TKT-1198-PL</div>
</td>
<td class="py-md px-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded-sm bg-tertiary-fixed-dim/30 text-on-tertiary-container font-label-sm">
<span class="material-symbols-outlined text-[14px]">pending_actions</span>
                                        Pending
                                    </span>
</td>
<td class="py-md px-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded-sm bg-surface-container text-secondary font-label-sm border border-outline-variant/50">
<span class="material-symbols-outlined text-[14px]">block</span>
                                        Invalid Entry
                                    </span>
</td>
<td class="py-md px-md text-right">
<button class="text-secondary hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<!-- Row 4: Valid -->
<tr class="hover:bg-surface-container-lowest transition-colors group">
<td class="py-md px-md text-secondary">
<div class="font-body-md text-on-surface">10:35:12 AM</div>
<div class="font-label-sm text-outline">Oct 24, 2024</div>
</td>
<td class="py-md px-md">
<div class="font-title-md text-on-surface">David Kim</div>
<div class="font-label-sm text-secondary">TKT-5541-MN</div>
</td>
<td class="py-md px-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded-sm bg-surface-container text-on-surface-variant font-label-sm">
<span class="material-symbols-outlined text-[14px]">check_circle</span>
                                        Verified
                                    </span>
</td>
<td class="py-md px-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded-sm bg-[#d1fae5] text-[#047857] font-label-sm border border-[#34d399]/30">
<span class="material-symbols-outlined text-[14px]">done_all</span>
                                        Valid Entry
                                    </span>
</td>
<td class="py-md px-md text-right">
<button class="text-secondary hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<!-- Row 5: Overridden -->
<tr class="hover:bg-surface-container-lowest transition-colors group bg-surface-container/30">
<td class="py-md px-md text-secondary">
<div class="font-body-md text-on-surface">10:20:05 AM</div>
<div class="font-label-sm text-outline">Oct 24, 2024</div>
</td>
<td class="py-md px-md">
<div class="font-title-md text-on-surface">Aisha Patel</div>
<div class="font-label-sm text-secondary">TKT-9922-QR</div>
</td>
<td class="py-md px-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded-sm bg-surface-container text-on-surface-variant font-label-sm">
<span class="material-symbols-outlined text-[14px]">check_circle</span>
                                        Verified
                                    </span>
</td>
<td class="py-md px-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded-sm bg-secondary-container text-on-secondary-container font-label-sm border border-secondary-container/50">
<span class="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                                        Manual Override
                                    </span>
<div class="font-label-sm text-secondary mt-1">By: Admin (Device Issue)</div>
</td>
<td class="py-md px-md text-right">
<button class="text-secondary hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Table Pagination Footer -->
<div class="p-md border-t border-outline-variant/50 flex justify-between items-center bg-surface-container-lowest">
<span class="font-label-sm text-secondary">Showing 1-5 of 1,248</span>
<div class="flex gap-xs">
<button class="p-2 rounded-DEFAULT border border-outline-variant text-secondary hover:bg-surface-variant disabled:opacity-50" disabled="">
<span class="material-symbols-outlined text-[20px]">chevron_left</span>
</button>
<button class="p-2 rounded-DEFAULT border border-outline-variant text-secondary hover:bg-surface-variant">
<span class="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Empty State Example (Hidden by default, shown for structure completeness) -->
<!--
            <div class="mt-xl bg-surface border border-outline-variant border-dashed rounded-xl p-xl flex flex-col items-center justify-center text-center py-20">
                <div class="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-secondary mb-md">
                    <span class="material-symbols-outlined text-[32px]">qr_code_scanner</span>
                </div>
                <h3 class="font-headline-md text-headline-md text-on-surface mb-xs">No scans recorded yet</h3>
                <p class="font-body-md text-secondary max-w-md">Waiting for devices to connect and begin syncing scan data for this event. Feed will update automatically.</p>
            </div>
            -->
</main>
</div>
<!-- Resolution Modal (Demonstrative overlay) -->
<div class="fixed inset-0 bg-on-background/40 backdrop-blur-sm z-50 flex items-center justify-center hidden" id="resolution-modal">
<div class="bg-surface rounded-xl border border-outline-variant w-full max-w-lg shadow-[0px_4px_20px_rgba(46,49,146,0.08)] overflow-hidden">
<div class="p-lg border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-lowest">
<h3 class="font-headline-md text-headline-md text-on-surface">Resolve Duplicate Scan</h3>
<button class="text-secondary hover:text-on-surface p-sm rounded-full hover:bg-surface-variant transition-colors" onclick="document.getElementById('resolution-modal').classList.add('hidden')">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<div class="p-lg">
<div class="bg-error-container/10 border border-error/20 rounded-lg p-md mb-md flex gap-sm">
<span class="material-symbols-outlined text-error">info</span>
<div>
<p class="font-title-md text-title-md text-on-surface mb-xs">Ticket TKT-4422-BC was already scanned.</p>
<p class="font-body-md text-secondary">Previous scan recorded at Gate A at 09:15 AM.</p>
</div>
</div>
<div class="space-y-md">
<div>
<label class="block font-label-sm text-secondary mb-xs">ATTENDEE</label>
<p class="font-body-md text-on-surface font-semibold">Michael Chang</p>
</div>
<div>
<label class="block font-label-sm text-secondary mb-xs">RESOLUTION ACTION</label>
<select class="w-full border border-outline-variant rounded-lg bg-surface text-on-surface font-body-md p-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
<option>Manual Override - Allow Entry</option>
<option>Reject Entry - Invalidate Ticket</option>
<option>Flag for Security Review</option>
</select>
</div>
<div>
<label class="block font-label-sm text-secondary mb-xs">REASON FOR OVERRIDE (REQUIRED)</label>
<textarea class="w-full border border-outline-variant rounded-lg bg-surface text-on-surface font-body-md p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px]" placeholder="Enter explanation for administrative logs..."></textarea>
</div>
</div>
</div>
<div class="p-md border-t border-outline-variant/50 bg-surface-container-low flex justify-end gap-sm">
<button class="bg-surface border border-outline-variant text-secondary px-4 py-2 rounded-DEFAULT font-title-md text-title-md hover:bg-surface-variant transition-colors" onclick="document.getElementById('resolution-modal').classList.add('hidden')">Cancel</button>
<button class="bg-primary text-on-primary px-4 py-2 rounded-DEFAULT font-title-md text-title-md hover:bg-primary/90 transition-colors">Confirm Resolution</button>
</div>
</div>
</div>
<!-- Quick script to demo modal open (keeping logic simple as requested no JS, but useful for visual testing if a user clicks) -->
<script>
        // Simple demonstrative JS to show modal if someone clicks resolve
        document.querySelectorAll('button:contains("Resolve")').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('resolution-modal').classList.remove('hidden');
            });
        });
        // Polyfill for contains
        jQuery.expr[':'].contains = function(a, i, m) {
            return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
        };
    </script>
</body></html>
```

---

## PAGE: eventura_landing_page

```html
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - College Event Management</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Public Sans"],
                        "display-lg": ["Public Sans"],
                        "label-sm": ["Inter"],
                        "title-md": ["Inter"],
                        "headline-lg": ["Public Sans"]
                    },
                    "fontSize": {
                        "body-md": ["14px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400" }],
                        "body-lg": ["16px", { "lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "1.3", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "0.02em", "fontWeight": "700" }],
                        "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
                        "title-md": ["18px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "0.015em", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined[data-weight="fill"] {
            font-variation-settings: 'FILL' 1;
        }
    </style>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen flex flex-col">
<!-- TopNavBar -->
<nav class="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-50">
<div class="flex items-center gap-md">
<a class="flex items-center gap-sm" href="/">
<img alt="Eventura" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyqd9Ij1W7CTJiCPhkH1vlPAtqJVqSauJE23o9zcWfpqm6D9KPw9kVER4rCdoY0HiD_lOgpOfTfsnw85F1HWWd9Sf_qtZiRv4gqz0bC8nn4Wfw7F7N9-ioMVwJE5KLgsTZzdc_PBg-E_ta5Ej4oltQBEXmJGu-xE8Kh5JPEpWlmYalR7QWt6GZqO5HL0w68KWHwSukSlJBUjYDPw4HxyuQSng275lgD7Ri5cV8Hd5nODm-2dDy9Qk5bzui9002MwXNge5cPn43OQ"/>
<span class="font-headline-md text-headline-md font-bold text-primary hidden md:block">Eventura</span>
</a>
</div>
<div class="hidden md:flex items-center gap-lg">
<a class="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md" href="#">Discover</a>
<a class="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md" href="#">Solutions</a>
<a class="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md" href="#">Pricing</a>
</div>
<div class="flex items-center gap-md">
<button class="text-primary font-body-md text-body-md font-bold px-4 py-2 hover:bg-surface-variant rounded-DEFAULT transition-colors hidden md:block">Log In</button>
<button class="bg-primary text-on-primary font-body-md text-body-md font-bold px-4 py-2 rounded-DEFAULT hover:bg-primary/90 transition-colors">Get Started</button>
</div>
</nav>
<!-- Main Content Canvas -->
<main class="flex-grow flex flex-col">
<!-- Hero Section -->
<section class="relative w-full overflow-hidden bg-surface-container-lowest border-b border-outline-variant py-20 lg:py-32 flex items-center justify-center">
<!-- Background Image -->
<div class="absolute inset-0 z-0">
<img alt="University Campus" class="w-full h-full object-cover opacity-10" data-alt="A bright, airy, modern university campus plaza seen from a slightly elevated angle. Students are walking purposefully in small groups. The architecture is clean, contemporary, and prestigious, featuring light stone and large glass windows. The lighting is sunny and crisp, creating a professional, built-to-last, 'corporate modern' aesthetic with a palette of whites, light slate grays, and deep indigo shadows. The mood is ambitious and organized." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVeSanAYhnwNwfAkCD23H6VYkrhsz_m9WeM5WujDcfvhY2VwURYvJ3zOurQyQRIo6ttDjETeZ4RR9FV7JFjReVNcQtanixkYPXJ_pLGmSMTwZ9nXfXK1cx6aGjvKwOlxniC_nJMrGVuWcQrjz6Z6Du0xj8Du5HzZ7qaU9KFkSQ3dbCUOSRsYflqRv7xhS5hN5uB4m7RgyXcgA_bWYRQCIe8vNuIGClXSRKB7DTMFe3iPwzgHHr0UNCGmUDyiK27iT2nC4u5EdUrg"/>
</div>
<div class="relative z-10 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop text-center flex flex-col items-center">
<span class="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-3 py-1 rounded-full mb-md shadow-sm border border-outline-variant/30">Institutional Grade Platform</span>
<h1 class="font-display-lg text-display-lg text-primary max-w-4xl mb-gutter leading-tight">Transforming Campus Life into Verified Achievements</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-xl">The definitive administrative toolkit for higher education. Manage complex events, issue verifiable credentials, and maintain absolute financial sovereignty across your institution.</p>
<div class="flex flex-col sm:flex-row gap-md justify-center w-full sm:w-auto">
<button class="bg-primary text-on-primary font-title-md text-title-md px-8 py-3 rounded-DEFAULT hover:bg-primary/90 transition-colors shadow-sm h-12 flex items-center justify-center">Request Demo</button>
<button class="bg-surface text-secondary border border-outline-variant font-title-md text-title-md px-8 py-3 rounded-DEFAULT hover:bg-surface-variant transition-colors h-12 flex items-center justify-center">Explore Platform</button>
</div>
</div>
</section>
<!-- Social Proof -->
<section class="w-full bg-surface py-xl border-b border-outline-variant">
<div class="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center">
<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-lg">Trusted by Leading Institutions</p>
<div class="flex flex-wrap justify-center gap-xl md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
<!-- Placeholders for logos -->
<div class="flex items-center gap-sm font-headline-md text-headline-md text-secondary"><span class="material-symbols-outlined text-[32px]">school</span> State University</div>
<div class="flex items-center gap-sm font-headline-md text-headline-md text-secondary"><span class="material-symbols-outlined text-[32px]">account_balance</span> Tech Institute</div>
<div class="flex items-center gap-sm font-headline-md text-headline-md text-secondary"><span class="material-symbols-outlined text-[32px]">domain</span> College of Arts</div>
<div class="flex items-center gap-sm font-headline-md text-headline-md text-secondary"><span class="material-symbols-outlined text-[32px]">public</span> Global Academy</div>
</div>
</div>
</section>
<!-- Features Bento Grid -->
<section class="w-full bg-surface-container-lowest py-20 lg:py-32">
<div class="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
<div class="text-center mb-16">
<h2 class="font-headline-lg text-headline-lg text-primary mb-sm">Architected for Higher Education</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">A unified ecosystem designed to eliminate administrative friction and elevate the student experience.</p>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<!-- Feature 1 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col shadow-sm hover:shadow-md transition-shadow">
<div class="h-12 w-12 bg-primary-container rounded-lg flex items-center justify-center mb-md">
<span class="material-symbols-outlined text-on-primary-container" data-icon="qr_code_scanner">qr_code_scanner</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface mb-sm">'Phygital' Integration</h3>
<p class="font-body-md text-body-md text-on-surface-variant flex-grow">Seamlessly bridge digital planning with physical execution. Integrated QR ticketing, live capacity tracking, and automated check-ins.</p>
</div>
<!-- Feature 2 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col shadow-sm hover:shadow-md transition-shadow md:col-span-2 relative overflow-hidden">
<div class="relative z-10 w-full md:w-1/2">
<div class="h-12 w-12 bg-primary-container rounded-lg flex items-center justify-center mb-md">
<span class="material-symbols-outlined text-on-primary-container" data-icon="verified">verified</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface mb-sm">Blockchain Credentials</h3>
<p class="font-body-md text-body-md text-on-surface-variant mb-md">Automatically issue verifiable micro-credentials for student participation. Build an immutable, institutional-grade transcript of extracurricular achievements.</p>
<a class="text-primary font-label-sm text-label-sm flex items-center gap-xs hover:underline mt-auto" href="#">Learn more <span class="material-symbols-outlined text-[16px]">arrow_forward</span></a>
</div>
<!-- Abstract illustration for the wide card -->
<div class="hidden md:block absolute right-0 top-0 bottom-0 w-1/2 bg-surface-container-high opacity-50 flex items-center justify-center overflow-hidden">
<img alt="Blockchain Concept" class="w-full h-full object-cover mix-blend-multiply opacity-20" data-alt="Abstract 3D rendering of interconnected crystalline blocks and lines in deep indigo and light slate colors on a stark white background. The visual represents blockchain technology and verifiable data structures in a clean, authoritative, corporate-modern style. The lighting is clinical and bright, emphasizing precision and security." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLZb4HvyKnWGbykSveVXSdwTca43iWf71Jaf9FVvz4n00fg8nJ-UoEKJWw5eDnbfK7hg9Stg3N0foj-SyTZ3bGaQtk02b1XxI12wS8n0MzDGx-WY8D-ILXfiPjTN0el7V4Gcug9raQXB8wXAcZXb4q0Qw0fupRdEe9cp0pUvlfc3KtwnLykUKCI6IADV-2PfNcCAwoNcwWu-uBgWnVNEku1ikQ1z2axht5RTLRhCq8t1Oxlf5XAvJCyYfgMd-9t7Yq-fsfuuqK1A"/>
</div>
</div>
<!-- Feature 3 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col shadow-sm hover:shadow-md transition-shadow md:col-span-3 lg:col-span-1">
<div class="h-12 w-12 bg-primary-container rounded-lg flex items-center justify-center mb-md">
<span class="material-symbols-outlined text-on-primary-container" data-icon="account_balance_wallet">account_balance_wallet</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface mb-sm">Financial Sovereignty</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Centralized treasury management with decentralized department access. Absolute control over budget allocations, ticketing revenue, and vendor payments.</p>
</div>
</div>
</div>
</section>
<!-- Featured Events (Horizontal Scroll/Grid) -->
<section class="w-full bg-surface border-y border-outline-variant py-20">
<div class="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
<div class="flex justify-between items-end mb-lg">
<div>
<h2 class="font-headline-lg text-headline-lg text-primary mb-xs">Powered by Eventura</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant">Explore how top institutions are utilizing the platform.</p>
</div>
<button class="hidden md:flex items-center gap-xs text-primary font-label-sm text-label-sm hover:underline">View Directory <span class="material-symbols-outlined text-[16px]">arrow_forward</span></button>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
<!-- Event Card 1 -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm group cursor-pointer hover:shadow-md transition-all">
<div class="h-32 bg-surface-container-high relative overflow-hidden">
<img alt="Event Image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A professional academic conference auditorium. Empty, meticulously aligned rows of seating face a brightly lit stage with a podium. The color palette is corporate modern, featuring deep slate seating and crisp white stage lighting. The atmosphere is expectant, organized, and highly professional, ready for an academic keynote." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVA5HJoteFoBXnppWSOro2X5DC6va9RKUuNb2GCGOx0-vQ6gvEZ40nE8gbAAIv1qMwY9vUsBMlxxDIP2Y9p_F33i2b9wT3tUQFzRm2jlM7yNuof6S_lq7rf_tS8O-M3fkyk_J8O0G2CdB4RNSaVQdkI_IpTaJ3IIK0aaaUIV0qp1kpcxezN9t_KxgNhLHr8Xpy5npRyYSr1Rv__5PK8cTpR-Mxrw2bBJ8ygwZjpJbwoC_sCqu6y4FujlZOiVD2LjAHYEin058FsQ"/>
<div class="absolute top-2 left-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded text-primary font-label-sm text-[10px] uppercase tracking-wider flex items-center gap-1">
<img alt="Logo" class="h-3 w-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyqd9Ij1W7CTJiCPhkH1vlPAtqJVqSauJE23o9zcWfpqm6D9KPw9kVER4rCdoY0HiD_lOgpOfTfsnw85F1HWWd9Sf_qtZiRv4gqz0bC8nn4Wfw7F7N9-ioMVwJE5KLgsTZzdc_PBg-E_ta5Ej4oltQBEXmJGu-xE8Kh5JPEpWlmYalR7QWt6GZqO5HL0w68KWHwSukSlJBUjYDPw4HxyuQSng275lgD7Ri5cV8Hd5nODm-2dDy9Qk5bzui9002MwXNge5cPn43OQ"/> Verified
                            </div>
</div>
<div class="p-4 border-t border-outline-variant">
<p class="text-on-surface-variant font-label-sm text-[10px] mb-1">State University • Oct 12</p>
<h4 class="font-title-md text-body-lg text-on-surface leading-tight mb-2 truncate">Annual Tech Symposium 2024</h4>
<div class="flex items-center justify-between">
<span class="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-semibold">Academic</span>
<span class="text-secondary text-[12px] font-semibold">Free</span>
</div>
</div>
</div>
<!-- Event Card 2 -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm group cursor-pointer hover:shadow-md transition-all">
<div class="h-32 bg-surface-container-high relative overflow-hidden">
<img alt="Event Image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A modern university career fair setting in a large, bright atrium. Rows of minimal white tables are set up with professional branding. Students in business casual attire are networking with recruiters. The lighting is natural and clear, emphasizing a high-trust, professional corporate environment with a palette of whites, light grays, and deep indigos." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-gb-E0uXflabYnljy5Jfrqra5fez_DmK7-oZ4WkvIQeUUTJCJZawDMsi4gjfnJzc7VeUaBDHZOgEWKgQTsmQiqwzYXKjLqru0IL141NTD6BoXKb8nUxLurLSd8e-miVvnTGeS6XVsqQnNVZI1RSXuGoqzxakhkRLvwvCG7EHFq2ELyQT4WFf1kkTsgvJ92M5uH__1hbfLfq0YkaP4r-az-HtrBP8TFdQrUphVXChFYgOimZX_X9oNqUiWq0B-TSnpZLZvXCmzzA"/>
<div class="absolute top-2 left-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded text-primary font-label-sm text-[10px] uppercase tracking-wider flex items-center gap-1">
<img alt="Logo" class="h-3 w-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyqd9Ij1W7CTJiCPhkH1vlPAtqJVqSauJE23o9zcWfpqm6D9KPw9kVER4rCdoY0HiD_lOgpOfTfsnw85F1HWWd9Sf_qtZiRv4gqz0bC8nn4Wfw7F7N9-ioMVwJE5KLgsTZzdc_PBg-E_ta5Ej4oltQBEXmJGu-xE8Kh5JPEpWlmYalR7QWt6GZqO5HL0w68KWHwSukSlJBUjYDPw4HxyuQSng275lgD7Ri5cV8Hd5nODm-2dDy9Qk5bzui9002MwXNge5cPn43OQ"/> Verified
                            </div>
</div>
<div class="p-4 border-t border-outline-variant">
<p class="text-on-surface-variant font-label-sm text-[10px] mb-1">Tech Institute • Nov 05</p>
<h4 class="font-title-md text-body-lg text-on-surface leading-tight mb-2 truncate">Fall Career Expo</h4>
<div class="flex items-center justify-between">
<span class="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-semibold">Networking</span>
<span class="text-secondary text-[12px] font-semibold">Registration Required</span>
</div>
</div>
</div>
<!-- Event Card 3 -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm group cursor-pointer hover:shadow-md transition-all">
<div class="h-32 bg-surface-container-high relative overflow-hidden">
<img alt="Event Image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A formal university graduation ceremony setting. A pristine white stage with a dark wood podium. In the background, rows of neatly arranged chairs. The color scheme is heavily reliant on deep indigo, white, and slate gray to convey authority, reliability, and academic prestige. The image feels structured and calm." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEUlMuGV_sR9Rm3Jv0EyMCecoE0dXuywWEVLcqzVKMP_KcKOhIgKgR8CDyPWshYusxwM8grVeGK-yDEZTQrzSd5Mi9BQiE7ly63x3-vhvVLl50vbrNoijWIahm4jorjC2BTJSwJA3HdTHnebYd2o1CgQk_61nEP86wdLCkhRmyziN0r3Jt3_EzqXDdnHlA55qiL3reCrhrnbbe1-W2ATuw9ZwycqT8CBsejrS5QAi8nej0ZfwMthbEdJ68T9pxeLGOuc2YaLGfjQ"/>
<div class="absolute top-2 left-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded text-primary font-label-sm text-[10px] uppercase tracking-wider flex items-center gap-1">
<img alt="Logo" class="h-3 w-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyqd9Ij1W7CTJiCPhkH1vlPAtqJVqSauJE23o9zcWfpqm6D9KPw9kVER4rCdoY0HiD_lOgpOfTfsnw85F1HWWd9Sf_qtZiRv4gqz0bC8nn4Wfw7F7N9-ioMVwJE5KLgsTZzdc_PBg-E_ta5Ej4oltQBEXmJGu-xE8Kh5JPEpWlmYalR7QWt6GZqO5HL0w68KWHwSukSlJBUjYDPw4HxyuQSng275lgD7Ri5cV8Hd5nODm-2dDy9Qk5bzui9002MwXNge5cPn43OQ"/> Verified
                            </div>
</div>
<div class="p-4 border-t border-outline-variant">
<p class="text-on-surface-variant font-label-sm text-[10px] mb-1">College of Arts • Dec 15</p>
<h4 class="font-title-md text-body-lg text-on-surface leading-tight mb-2 truncate">Winter Commencement Gala</h4>
<div class="flex items-center justify-between">
<span class="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-semibold">Ceremony</span>
<span class="text-secondary text-[12px] font-semibold">Invite Only</span>
</div>
</div>
</div>
<!-- Event Card 4 -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm group cursor-pointer hover:shadow-md transition-all hidden lg:block">
<div class="h-32 bg-surface-container-high relative overflow-hidden flex items-center justify-center">
<span class="material-symbols-outlined text-[48px] text-outline-variant">calendar_month</span>
</div>
<div class="p-4 border-t border-outline-variant h-[104px] flex flex-col justify-center items-center text-center">
<h4 class="font-title-md text-body-lg text-primary leading-tight mb-1">Discover More</h4>
<p class="text-on-surface-variant font-label-sm text-[10px]">Browse the full institutional calendar</p>
</div>
</div>
</div>
<button class="md:hidden mt-md w-full flex items-center justify-center gap-xs text-primary font-label-sm text-label-sm border border-primary px-4 py-2 rounded">View Directory <span class="material-symbols-outlined text-[16px]">arrow_forward</span></button>
</div>
</section>
<!-- Pricing Section -->
<section class="w-full bg-surface-container-lowest py-20 lg:py-32">
<div class="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
<div class="text-center mb-16">
<h2 class="font-headline-lg text-headline-lg text-primary mb-sm">Transparent Tiering</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Scalable solutions tailored for student organizations up to university-wide administration.</p>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-lg max-w-4xl mx-auto">
<!-- Campus Lite -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col shadow-sm">
<div class="border-b border-outline-variant pb-md mb-md">
<h3 class="font-headline-md text-headline-md text-on-surface">Campus Lite</h3>
<p class="font-body-md text-body-md text-on-surface-variant mt-xs">Perfect for independent student clubs and small societies.</p>
<div class="mt-md font-display-lg text-display-lg text-primary">Free<span class="font-body-md text-body-md text-on-surface-variant">/forever</span></div>
</div>
<ul class="flex-grow flex flex-col gap-sm mb-lg">
<li class="flex items-start gap-sm text-on-surface font-body-md"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span> Up to 3 active events/month</li>
<li class="flex items-start gap-sm text-on-surface font-body-md"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span> Basic QR ticketing</li>
<li class="flex items-start gap-sm text-on-surface font-body-md"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span> Standard email support</li>
<li class="flex items-start gap-sm text-on-surface-variant font-body-md opacity-50"><span class="material-symbols-outlined text-[20px]">cancel</span> No API access</li>
</ul>
<button class="w-full bg-surface text-secondary border border-outline-variant font-title-md text-title-md px-4 py-2 rounded-DEFAULT hover:bg-surface-variant transition-colors h-12">Create Free Account</button>
</div>
<!-- Institutional Pro -->
<div class="bg-surface-container-low border-2 border-primary rounded-xl p-lg flex flex-col shadow-md relative">
<div class="absolute top-0 right-lg transform -translate-y-1/2 bg-primary text-on-primary font-label-sm text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">Recommended</div>
<div class="border-b border-outline-variant pb-md mb-md">
<h3 class="font-headline-md text-headline-md text-primary">Institutional Pro</h3>
<p class="font-body-md text-body-md text-on-surface-variant mt-xs">Comprehensive management for university administrations.</p>
<div class="mt-md font-display-lg text-display-lg text-primary">Custom<span class="font-body-md text-body-md text-on-surface-variant">/pricing</span></div>
</div>
<ul class="flex-grow flex flex-col gap-sm mb-lg">
<li class="flex items-start gap-sm text-on-surface font-body-md"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span> Unlimited verified events &amp; credentials</li>
<li class="flex items-start gap-sm text-on-surface font-body-md"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span> Advanced treasury &amp; payment routing</li>
<li class="flex items-start gap-sm text-on-surface font-body-md"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span> Full API &amp; SSO integration</li>
<li class="flex items-start gap-sm text-on-surface font-body-md"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span> Dedicated success manager</li>
</ul>
<button class="w-full bg-primary text-on-primary font-title-md text-title-md px-4 py-2 rounded-DEFAULT hover:bg-primary/90 transition-colors h-12">Contact Sales</button>
</div>
</div>
</div>
</section>
<!-- CTA Section -->
<section class="w-full bg-primary text-on-primary py-20">
<div class="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
<h2 class="font-headline-lg text-headline-lg mb-md">Ready to Upgrade Your Campus Operations?</h2>
<p class="font-body-lg text-body-lg opacity-80 mb-lg">Join the growing network of prestigious institutions utilizing Eventura to streamline administration and verify student achievement.</p>
<div class="flex flex-col sm:flex-row gap-md justify-center">
<button class="bg-surface text-primary font-title-md text-title-md px-8 py-3 rounded-DEFAULT hover:bg-surface-variant transition-colors h-12">Schedule a Consultation</button>
</div>
</div>
</section>
</main>
<!-- Footer -->
<footer class="bg-surface-container-low border-t border-outline-variant px-margin-desktop py-lg text-on-surface-variant font-label-sm text-label-sm w-full">
<div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
<div class="flex items-center gap-sm">
<img alt="Eventura" class="h-6 w-auto grayscale opacity-70" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyqd9Ij1W7CTJiCPhkH1vlPAtqJVqSauJE23o9zcWfpqm6D9KPw9kVER4rCdoY0HiD_lOgpOfTfsnw85F1HWWd9Sf_qtZiRv4gqz0bC8nn4Wfw7F7N9-ioMVwJE5KLgsTZzdc_PBg-E_ta5Ej4oltQBEXmJGu-xE8Kh5JPEpWlmYalR7QWt6GZqO5HL0w68KWHwSukSlJBUjYDPw4HxyuQSng275lgD7Ri5cV8Hd5nODm-2dDy9Qk5bzui9002MwXNge5cPn43OQ"/>
<span class="font-headline-sm text-[16px] font-bold text-primary">© 2024 Eventura. Institutional Grade Event Management.</span>
</div>
<div class="flex flex-wrap justify-center gap-md">
<a class="hover:text-primary transition-all underline" href="#">Terms of Service</a>
<a class="hover:text-primary transition-all underline" href="#">Privacy Policy</a>
<a class="hover:text-primary transition-all underline" href="#">Institutional Support</a>
<a class="hover:text-primary transition-all underline" href="#">API Documentation</a>
</div>
</div>
</footer>
</body></html>
```

---

## PAGE: finance_dashboard_bank_validation

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - Payouts &amp; Finance</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Public Sans"],
                        "display-lg": ["Public Sans"],
                        "label-sm": ["Inter"],
                        "title-md": ["Inter"],
                        "headline-lg": ["Public Sans"]
                    },
                    "fontSize": {
                        "body-md": ["14px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400"}],
                        "body-lg": ["16px", {"lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "0.01em", "fontWeight": "600"}],
                        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "0.02em", "fontWeight": "700"}],
                        "label-sm": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600"}],
                        "title-md": ["18px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "600"}],
                        "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "0.015em", "fontWeight": "600"}]
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-surface text-on-surface font-body-md h-screen overflow-hidden flex">
<!-- SideNavBar -->
<aside class="bg-primary dark:bg-surface-container-highest flex flex-col h-full border-r border-outline-variant dark:border-outline docked left-0 h-full w-64 shadow-sm z-20 flex-shrink-0">
<div class="p-lg flex items-center gap-md">
<img alt="University Logo" class="w-12 h-12 rounded-full border-2 border-primary-container object-cover" data-alt="A stylized logo of a fictional university featuring a classic crest design with modern minimalist lines. The colors are deep indigo and crisp white. Professional, corporate modern style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiSjgwm87Zcd76pFuqVoViK9l13USAJlW4sLYcuCKFfMxiFh5JcKBUv0g-Gs-7F0dcV2yVXrPTD5k8LEejf_m4k7B7B9i4Ke0k4DX9dzSvbaTk4JewBJNaqw3zVKYOOqfK5jaZExVZrg4iuj4XZW76DwX85XpUMVRjRbGAHDGHaIyiPxY6c2IMuJ-zzpGP2tSSbMFMIitA3Ptu6G66494itTr0Ajy5EGg_4aFDdXXJKq0HHogJje37-kJ9CnuJhVYD7r_dBnA-VA"/>
<div>
<h1 class="font-headline-sm text-headline-sm font-bold text-on-primary dark:text-on-surface">Eventura Admin</h1>
<p class="font-label-sm text-label-sm text-primary-fixed-dim">State University</p>
</div>
</div>
<div class="px-md mb-lg">
<button class="w-full bg-primary-container text-on-primary-container font-label-sm text-label-sm py-sm px-md rounded-lg flex justify-center items-center gap-xs hover:bg-primary-container/80 transition-colors">
<span class="material-symbols-outlined text-[18px]">add</span>
                New Campaign
            </button>
</div>
<nav class="flex-1 overflow-y-auto py-sm flex flex-col gap-xs">
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">dashboard</span>
                Dashboard
            </a>
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">event</span>
                Events
            </a>
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">bar_chart</span>
                Analytics
            </a>
<a class="flex items-center gap-md bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-lg mx-2 my-1 px-4 py-3 font-body-md text-body-md Active: scale-95 transition-transform" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">account_balance</span>
                Payments
            </a>
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">settings</span>
                Settings
            </a>
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">admin_panel_settings</span>
                Admin Console
            </a>
</nav>
<div class="mt-auto py-lg border-t border-primary-container">
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">contact_support</span>
                Support
            </a>
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">logout</span>
                Logout
            </a>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 flex flex-col h-full overflow-hidden bg-background">
<!-- Top App Bar -->
<header class="bg-surface border-b border-outline-variant h-16 flex items-center px-margin-desktop justify-between shrink-0">
<h2 class="font-headline-md text-headline-md font-bold text-primary">Payouts &amp; Finance</h2>
<div class="flex items-center gap-md">
<button class="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
<div class="h-8 w-px bg-outline-variant"></div>
<div class="flex items-center gap-sm">
<div class="text-right">
<p class="font-label-sm text-label-sm text-on-surface">Financial Admin</p>
<p class="font-body-md text-body-md text-on-surface-variant text-[12px]">Dept. of Computing</p>
</div>
<img alt="User Profile" class="w-10 h-10 rounded-full object-cover border border-outline-variant" data-alt="A professional headshot of a mature financial administrator in a corporate setting. High-trust, professional lighting. Crisp corporate modern style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc0RYt2m9avvhlbftJcJowy57nN1ce6Y_JUOKQLWsoG-pVFJsyBJ3LUZq6syT4rA3JjZ4I6OZDYQXLFILm385Phn9l79QjXnqSsxfcEd8UmFRO1jTEqnUfpjU1M3T4FM2xRhZDkAU8wVCTRZtEPMyE6nb48jm7o8l19MrxJVcVYyazCG2tT94dzN-ZjtwuESe8_kjg1dqewyCUk_EitOaLD50gWpG5p6vkiet4YqJxirfnXAa1DKsIjzMQs6wVu9ScDm3BEqczuA"/>
</div>
</div>
</header>
<!-- Scrollable Canvas -->
<div class="flex-1 overflow-y-auto p-margin-desktop">
<div class="max-w-7xl mx-auto space-y-xl">
<!-- Financial Summary KPIs -->
<section>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
<!-- KPI Card 1 -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
<div class="flex justify-between items-start mb-sm">
<p class="font-body-md text-body-md text-on-surface-variant">Total Collected</p>
<span class="material-symbols-outlined text-primary">account_balance_wallet</span>
</div>
<h3 class="font-headline-lg text-headline-lg font-bold text-on-surface mb-xs">$142,500.00</h3>
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px] text-[#059669]">trending_up</span>
<span class="font-label-sm text-label-sm text-[#059669]">12% vs last month</span>
</div>
</div>
<!-- KPI Card 2 -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
<div class="flex justify-between items-start mb-sm">
<p class="font-body-md text-body-md text-on-surface-variant">Platform Fees Paid</p>
<span class="material-symbols-outlined text-secondary">receipt_long</span>
</div>
<h3 class="font-headline-lg text-headline-lg font-bold text-on-surface mb-xs">$4,275.00</h3>
<p class="font-label-sm text-label-sm text-on-surface-variant">3% blended rate</p>
</div>
<!-- KPI Card 3 -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
<div class="flex justify-between items-start mb-sm">
<p class="font-body-md text-body-md text-on-surface-variant">Net Payouts</p>
<span class="material-symbols-outlined text-primary">payments</span>
</div>
<h3 class="font-headline-lg text-headline-lg font-bold text-on-surface mb-xs">$118,000.00</h3>
<p class="font-label-sm text-label-sm text-on-surface-variant">Processed to bank</p>
</div>
<!-- KPI Card 4 -->
<div class="bg-surface-container-lowest border-2 border-primary rounded-xl p-lg shadow-sm bg-primary-fixed/20">
<div class="flex justify-between items-start mb-sm">
<p class="font-body-md text-body-md text-on-primary-fixed font-bold">Current Balance (Escrow)</p>
<span class="material-symbols-outlined text-primary">lock</span>
</div>
<h3 class="font-headline-lg text-headline-lg font-bold text-on-primary-fixed mb-xs">$20,225.00</h3>
<p class="font-label-sm text-label-sm text-on-primary-fixed-variant">Awaiting clearing (T+2)</p>
</div>
</div>
</section>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
<!-- Main Left Column: Transactions -->
<div class="lg:col-span-2 space-y-xl">
<!-- Transaction History -->
<section class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
<div class="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
<h3 class="font-title-md text-title-md text-on-surface">Recent Transactions</h3>
<div class="flex gap-sm">
<button class="bg-surface border border-outline-variant px-md py-sm rounded-lg font-label-sm text-label-sm text-on-surface flex items-center gap-xs hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">filter_list</span> Filter
                                    </button>
<button class="bg-surface border border-outline-variant px-md py-sm rounded-lg font-label-sm text-label-sm text-on-surface flex items-center gap-xs hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">download</span> Export
                                    </button>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="border-b border-outline-variant bg-surface">
<th class="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Date</th>
<th class="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Event / Attendee</th>
<th class="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Amount</th>
<th class="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Tax (GST)</th>
<th class="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Status</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md text-on-surface">
<tr class="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
<td class="p-md whitespace-nowrap">Oct 24, 2023</td>
<td class="p-md">
<p class="font-semibold">Tech Symposium 2023</p>
<p class="text-[12px] text-on-surface-variant">Alice Johnson</p>
</td>
<td class="p-md font-semibold">$150.00</td>
<td class="p-md text-on-surface-variant">$27.00</td>
<td class="p-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded bg-[#059669]/10 text-[#059669] font-label-sm text-label-sm">
                                                    Completed
                                                </span>
</td>
</tr>
<tr class="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
<td class="p-md whitespace-nowrap">Oct 24, 2023</td>
<td class="p-md">
<p class="font-semibold">Alumni Gala Dinner</p>
<p class="text-[12px] text-on-surface-variant">Bob Smith</p>
</td>
<td class="p-md font-semibold">$500.00</td>
<td class="p-md text-on-surface-variant">$90.00</td>
<td class="p-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                                                    Processing
                                                </span>
</td>
</tr>
<tr class="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
<td class="p-md whitespace-nowrap">Oct 23, 2023</td>
<td class="p-md">
<p class="font-semibold">Workshop: Cloud Computing</p>
<p class="text-[12px] text-on-surface-variant">Charlie Davis</p>
</td>
<td class="p-md font-semibold">$50.00</td>
<td class="p-md text-on-surface-variant">$9.00</td>
<td class="p-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded bg-[#059669]/10 text-[#059669] font-label-sm text-label-sm">
                                                    Completed
                                                </span>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors">
<td class="p-md whitespace-nowrap">Oct 22, 2023</td>
<td class="p-md">
<p class="font-semibold">Tech Symposium 2023</p>
<p class="text-[12px] text-on-surface-variant">Diana Evans</p>
</td>
<td class="p-md font-semibold">$150.00</td>
<td class="p-md text-on-surface-variant">$27.00</td>
<td class="p-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded bg-[#b91c1c]/10 text-[#b91c1c] font-label-sm text-label-sm">
                                                    On Hold
                                                </span>
</td>
</tr>
</tbody>
</table>
</div>
<div class="p-sm border-t border-outline-variant text-center">
<a class="font-label-sm text-label-sm text-primary hover:underline" href="#">View All Transactions</a>
</div>
</section>
</div>
<!-- Right Column: Integrations & Splits -->
<div class="space-y-gutter">
<!-- Integration Info -->
<section class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg">
<div class="flex items-center gap-sm mb-md">
<span class="material-symbols-outlined text-primary text-[28px]">account_balance</span>
<h3 class="font-title-md text-title-md text-on-surface">Payment Gateway</h3>
</div>
<div class="bg-surface-container rounded-lg p-md mb-md border border-outline-variant/50">
<div class="flex justify-between items-start mb-sm">
<div>
<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Connected Account</p>
<div class="flex items-center gap-sm mt-xs">
<p class="font-body-md text-body-md font-semibold text-on-surface">Razorpay Route</p>
<span class="inline-flex items-center gap-xs px-2 py-1 rounded bg-[#059669]/10 text-[#059669] font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">verified</span> Verified
                                    </span>
</div>
</div>
</div>
<div class="h-px w-full bg-outline-variant/30 my-sm"></div>
<div class="space-y-xs">
<p class="font-body-md text-body-md text-on-surface flex justify-between">
<span class="text-on-surface-variant">Bank Name:</span> <strong>State Bank</strong>
</p>
<p class="font-body-md text-body-md text-on-surface flex justify-between">
<span class="text-on-surface-variant">Acct Ending:</span> <strong>**** 4921</strong>
</p>
<p class="font-body-md text-body-md text-on-surface flex justify-between">
<span class="text-on-surface-variant">KYC Status:</span> <strong class="text-[#059669]">Verified</strong>
</p>
</div>
<div class="mt-md pt-md border-t border-outline-variant/30">
<button class="w-full bg-surface-container-lowest border border-outline-variant text-primary font-label-sm text-label-sm py-sm px-md rounded-lg flex justify-center items-center gap-xs hover:bg-primary/5 transition-colors">
<span class="material-symbols-outlined text-[18px]">network_check</span>
                                    Test Connection
                                </button>
</div>
</div>
<button class="w-full bg-surface border border-outline-variant text-on-surface font-label-sm text-label-sm py-sm px-md rounded-lg flex justify-center items-center gap-xs hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">receipt</span>
                                Download Tax Invoices
                            </button>
</section>
<!-- Split Visualization -->
<section class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg">
<h3 class="font-title-md text-title-md text-on-surface mb-md">Typical Vendor Split</h3>
<p class="font-label-sm text-label-sm text-on-surface-variant mb-md">Based on a $100.00 Standard Ticket</p>
<div class="space-y-md">
<!-- Split Item 1 -->
<div>
<div class="flex justify-between font-body-md text-body-md mb-xs">
<span class="font-semibold text-on-surface">Organizer (Dept.)</span>
<span class="text-on-surface">$85.00</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-primary h-2 rounded-full" style="width: 85%"></div>
</div>
</div>
<!-- Split Item 2 -->
<div>
<div class="flex justify-between font-body-md text-body-md mb-xs">
<span class="font-semibold text-on-surface">Catering Vendor</span>
<span class="text-on-surface">$10.00</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-tertiary-container h-2 rounded-full" style="width: 10%"></div>
</div>
</div>
<!-- Split Item 3 -->
<div>
<div class="flex justify-between font-body-md text-body-md mb-xs">
<span class="font-semibold text-on-surface">Platform Fee</span>
<span class="text-on-surface">$5.00</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-secondary h-2 rounded-full" style="width: 5%"></div>
</div>
</div>
</div>
<div class="mt-md p-sm bg-surface-container rounded border border-outline-variant/30 flex items-start gap-sm">
<span class="material-symbols-outlined text-secondary text-[20px]">info</span>
<p class="font-label-sm text-label-sm text-on-surface-variant leading-snug">Splits are automatically routed to verified vendor accounts via Razorpay Route upon event completion.</p>
</div>
</section>
</div>
</div>
</div>
<!-- Footer Spacer -->
<div class="h-xl"></div>
</div>
</main>
</body></html>
```

---

## PAGE: institution_verification_queue

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - College Verification</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "outline-variant": "#c7c5d4",
                    "on-tertiary-fixed-variant": "#574500",
                    "primary-fixed-dim": "#c0c1ff",
                    "surface-tint": "#4f54b4",
                    "on-primary-container": "#9da1ff",
                    "on-secondary-container": "#57657a",
                    "inverse-primary": "#c0c1ff",
                    "surface-container-high": "#eae7f0",
                    "on-primary-fixed-variant": "#373a9b",
                    "primary-container": "#2e3192",
                    "surface": "#fcf8ff",
                    "on-secondary-fixed": "#0d1c2e",
                    "on-primary-fixed": "#04006d",
                    "surface-bright": "#fcf8ff",
                    "secondary": "#515f74",
                    "primary": "#15157d",
                    "surface-variant": "#e4e1ea",
                    "tertiary": "#735c00",
                    "secondary-container": "#d5e3fc",
                    "on-background": "#1b1b21",
                    "background": "#fcf8ff",
                    "error-container": "#ffdad6",
                    "error": "#ba1a1a",
                    "tertiary-fixed-dim": "#e9c349",
                    "tertiary-fixed": "#ffe088",
                    "surface-container-lowest": "#ffffff",
                    "secondary-fixed": "#d5e3fc",
                    "inverse-on-surface": "#f2eff8",
                    "on-secondary": "#ffffff",
                    "on-surface": "#1b1b21",
                    "surface-dim": "#dbd9e1",
                    "on-tertiary-fixed": "#241a00",
                    "surface-container-highest": "#e4e1ea",
                    "on-surface-variant": "#464652",
                    "on-error-container": "#93000a",
                    "secondary-fixed-dim": "#b9c7df",
                    "on-error": "#ffffff",
                    "surface-container": "#f0ecf5",
                    "inverse-surface": "#303036",
                    "on-tertiary": "#ffffff",
                    "primary-fixed": "#e1e0ff",
                    "on-primary": "#ffffff",
                    "outline": "#777683",
                    "tertiary-container": "#cca730",
                    "surface-container-low": "#f5f2fb",
                    "on-tertiary-container": "#4f3d00",
                    "on-secondary-fixed-variant": "#3a485b"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "sm": "8px",
                    "md": "16px",
                    "gutter": "24px",
                    "lg": "24px",
                    "xs": "4px",
                    "margin-mobile": "16px",
                    "xl": "40px",
                    "margin-desktop": "48px",
                    "unit": "4px"
            },
            "fontFamily": {
                    "body-md": [
                            "Inter"
                    ],
                    "body-lg": [
                            "Inter"
                    ],
                    "headline-md": [
                            "Public Sans"
                    ],
                    "display-lg": [
                            "Public Sans"
                    ],
                    "label-sm": [
                            "Inter"
                    ],
                    "title-md": [
                            "Inter"
                    ],
                    "headline-lg": [
                            "Public Sans"
                    ]
            },
            "fontSize": {
                    "body-md": [
                            "14px",
                            {
                                    "lineHeight": "1.5",
                                    "letterSpacing": "0em",
                                    "fontWeight": "400"
                            }
                    ],
                    "body-lg": [
                            "16px",
                            {
                                    "lineHeight": "1.6",
                                    "letterSpacing": "0em",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-md": [
                            "24px",
                            {
                                    "lineHeight": "1.3",
                                    "letterSpacing": "0.01em",
                                    "fontWeight": "600"
                            }
                    ],
                    "display-lg": [
                            "48px",
                            {
                                    "lineHeight": "1.1",
                                    "letterSpacing": "0.02em",
                                    "fontWeight": "700"
                            }
                    ],
                    "label-sm": [
                            "12px",
                            {
                                    "lineHeight": "1",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "600"
                            }
                    ],
                    "title-md": [
                            "18px",
                            {
                                    "lineHeight": "1.5",
                                    "letterSpacing": "0em",
                                    "fontWeight": "600"
                            }
                    ],
                    "headline-lg": [
                            "32px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "0.015em",
                                    "fontWeight": "600"
                            }
                    ]
            }
    },
        },
      }
    </script>
</head>
<body class="bg-surface font-body-md text-on-surface h-screen flex overflow-hidden">
<!-- SideNavBar -->
<nav class="bg-primary text-on-primary docked left-0 h-full w-64 shadow-sm flex flex-col border-r border-outline-variant flex-shrink-0 z-20">
<div class="p-lg border-b border-primary-container">
<div class="flex items-center gap-md">
<img alt="University Logo" class="w-10 h-10 rounded-full object-cover border-2 border-primary-container" data-alt="A clean, minimalist university logo placeholder showing a modern crest or shield design. The logo is displayed in high resolution against a crisp white background. The overall aesthetic is professional, academic, and trustworthy, fitting for a higher education institutional portal." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0QVO_Svw45G__rs7KgPkIOMadSvgTUWgGShGAE-3ID6yL0E_TfCDnEEZB2wqM3y3vmiFVoF1W2kT6Z3PUDk9Jlq6cV7qym6ZY5ziR1VdshGqgRXwbnPVHzJKyN2i4Zmn_2lKJSl5Swb54SHB5GcaqZ_7bWU8nshLyxovVDSSm5MslMWoxrec9P8fBd4cHpYZQ_i5Sgq9B2tk8OJGQkW2DHonyXyTRUP0QjXRNwifCgeCtufl20Czq5owmybvn5rRGsT9IGHVDRA"/>
<div>
<h1 class="font-headline-sm text-headline-sm font-bold text-on-primary">Eventura Admin</h1>
<p class="font-label-sm text-label-sm text-primary-fixed-dim">State University</p>
</div>
</div>
</div>
<div class="flex-1 overflow-y-auto py-md">
<ul class="space-y-sm">
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                        Dashboard
                    </a>
</li>
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined" data-icon="event">event</span>
                        Events
                    </a>
</li>
<li>
<a class="flex items-center gap-md bg-primary-container text-on-primary-container rounded-lg mx-2 my-1 px-4 py-3 font-body-md text-body-md font-bold shadow-sm" href="#">
<span class="material-symbols-outlined" data-icon="admin_panel_settings">admin_panel_settings</span>
                        Verification
                    </a>
</li>
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined" data-icon="bar_chart">bar_chart</span>
                        Analytics
                    </a>
</li>
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
                        Settings
                    </a>
</li>
</ul>
</div>
<div class="p-md border-t border-primary-container">
<button class="w-full bg-white text-primary font-body-md text-body-md py-2 px-4 rounded-lg flex justify-center items-center gap-sm hover:bg-surface-container-low transition-colors mb-md">
<span class="material-symbols-outlined" data-icon="add">add</span>
                New Campaign
            </button>
<ul class="space-y-sm">
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-2 rounded-lg hover:bg-primary-container/20 transition-colors font-label-sm text-label-sm" href="#">
<span class="material-symbols-outlined" data-icon="contact_support">contact_support</span>
                        Support
                    </a>
</li>
<li>
<a class="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-2 rounded-lg hover:bg-primary-container/20 transition-colors font-label-sm text-label-sm" href="#">
<span class="material-symbols-outlined" data-icon="logout">logout</span>
                        Logout
                    </a>
</li>
</ul>
</div>
</nav>
<!-- Main Content Canvas -->
<main class="flex-1 flex flex-col h-full overflow-hidden bg-background">
<!-- Top App Bar (Contextual) -->
<header class="bg-surface flex justify-between items-center w-full px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
<div class="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
<span>Admin Console</span>
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-primary font-bold">Verification Queue</span>
</div>
<div class="flex items-center gap-md">
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">search</span>
<input class="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64" placeholder="Search organizations..." type="text"/>
</div>
</div>
</header>
<!-- Scrollable Content Area -->
<div class="flex-1 overflow-y-auto p-margin-desktop flex gap-xl relative">
<!-- Left Column: Table Container -->
<div class="flex-1 flex flex-col min-w-[700px]">
<div class="flex justify-between items-end mb-lg">
<div>
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-xs">Verification Queue</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Review and approve college and student club credentials.</p>
</div>
<div class="flex gap-sm">
<select class="border border-outline-variant rounded-lg bg-surface-container-lowest px-4 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary">
<option>Status: Pending</option>
<option>Status: Approved</option>
<option>Status: Rejected</option>
<option>Status: All</option>
</select>
<select class="border border-outline-variant rounded-lg bg-surface-container-lowest px-4 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary">
<option>Type: All</option>
<option>Type: College</option>
<option>Type: Club</option>
</select>
</div>
</div>
<!-- Bento Style Card for Table -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="border-b border-outline-variant bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant uppercase">
<th class="py-3 px-6 font-semibold">Organization Name</th>
<th class="py-3 px-6 font-semibold">Type</th>
<th class="py-3 px-6 font-semibold">Date Requested</th>
<th class="py-3 px-6 font-semibold">Requested By</th>
<th class="py-3 px-6 font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
<!-- Row 1 (Active) -->
<tr class="hover:bg-surface-container transition-colors cursor-pointer bg-primary/5">
<td class="py-4 px-6">
<div class="font-semibold text-primary">Alpha Kappa Psi</div>
<div class="text-label-sm text-on-surface-variant">ID: #REQ-8472</div>
</td>
<td class="py-4 px-6">
<span class="inline-flex items-center px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm font-label-sm">Club</span>
</td>
<td class="py-4 px-6 text-on-surface-variant">Oct 24, 2024</td>
<td class="py-4 px-6">
<div class="flex items-center gap-sm">
<div class="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold">JD</div>
<span>Jane Doe</span>
</div>
</td>
<td class="py-4 px-6 text-right">
<div class="flex justify-end gap-2">
<button class="bg-primary text-white px-3 py-1.5 rounded text-sm hover:bg-primary/90 transition-colors">Approve</button>
<button class="border border-outline text-on-surface px-3 py-1.5 rounded text-sm hover:bg-surface-container-low transition-colors">Review</button>
</div>
</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-surface-container transition-colors cursor-pointer">
<td class="py-4 px-6">
<div class="font-semibold">College of Engineering</div>
<div class="text-label-sm text-on-surface-variant">ID: #REQ-8471</div>
</td>
<td class="py-4 px-6">
<span class="inline-flex items-center px-2 py-1 rounded bg-tertiary-container text-on-tertiary-container text-label-sm font-label-sm">College</span>
</td>
<td class="py-4 px-6 text-on-surface-variant">Oct 23, 2024</td>
<td class="py-4 px-6">
<div class="flex items-center gap-sm">
<div class="w-6 h-6 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center text-xs font-bold">MS</div>
<span>Mark Smith</span>
</div>
</td>
<td class="py-4 px-6 text-right">
<div class="flex justify-end gap-2">
<button class="bg-primary text-white px-3 py-1.5 rounded text-sm hover:bg-primary/90 transition-colors">Approve</button>
<button class="border border-outline text-on-surface px-3 py-1.5 rounded text-sm hover:bg-surface-container-low transition-colors">Review</button>
</div>
</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-surface-container transition-colors cursor-pointer">
<td class="py-4 px-6">
<div class="font-semibold">Debate Society</div>
<div class="text-label-sm text-on-surface-variant">ID: #REQ-8470</div>
</td>
<td class="py-4 px-6">
<span class="inline-flex items-center px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm font-label-sm">Club</span>
</td>
<td class="py-4 px-6 text-on-surface-variant">Oct 22, 2024</td>
<td class="py-4 px-6">
<div class="flex items-center gap-sm">
<div class="w-6 h-6 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center text-xs font-bold">EJ</div>
<span>Emily Jones</span>
</div>
</td>
<td class="py-4 px-6 text-right">
<div class="flex justify-end gap-2">
<button class="bg-primary text-white px-3 py-1.5 rounded text-sm hover:bg-primary/90 transition-colors">Approve</button>
<button class="border border-outline text-on-surface px-3 py-1.5 rounded text-sm hover:bg-surface-container-low transition-colors">Review</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination Footer -->
<div class="bg-surface-container-low border-t border-outline-variant p-4 flex justify-between items-center mt-auto">
<span class="text-label-sm text-on-surface-variant">Showing 1 to 3 of 45 entries</span>
<div class="flex gap-1">
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors" disabled="">
<span class="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-label-sm">1</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-label-sm">2</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-label-sm">3</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
<!-- Right Column: Document Preview Panel -->
<div class="w-96 flex-shrink-0 flex flex-col">
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
<!-- Header -->
<div class="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
<h3 class="font-title-md text-title-md text-on-surface">Review Document</h3>
<button class="text-on-surface-variant hover:text-on-surface transition-colors">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<!-- Metadata Info -->
<div class="p-md border-b border-outline-variant bg-surface-bright space-y-sm">
<div class="flex justify-between">
<span class="text-label-sm text-on-surface-variant uppercase">Organization</span>
<span class="font-semibold text-body-md text-primary">Alpha Kappa Psi</span>
</div>
<div class="flex justify-between">
<span class="text-label-sm text-on-surface-variant uppercase">Document Type</span>
<span class="text-body-md text-on-surface">Charter Approval.pdf</span>
</div>
</div>
<!-- Document Placeholder -->
<div class="flex-1 bg-surface-container flex items-center justify-center p-md relative group">
<img alt="Document Preview" class="w-full h-full object-cover rounded shadow-sm opacity-90 transition-opacity group-hover:opacity-100" data-alt="A macro shot of a formal academic or institutional document printed on high-quality textured paper. The text is slightly blurred to indicate a generic placeholder, but an official-looking university seal or stamp is visible in the corner. The lighting is bright and clear, emphasizing professionalism and administrative authority." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMW_PImzfydgumDVYq5OoFOq8yaLXiaKc29gL1c_awH5J1rjHYbTtOvot0bupAdmtwJYsXmsKF42y74nUjm_EV1TGJPoS1udx3P4bddBGDbm-wVRFkOnOiL7-67H2qJrefWrZsqeNgxJCPOtFzHzeEszs2JOunnYYvEaP7hkjP0DBQ3vYKWScIvcULVyJiUxcKbTWTOOOangaus-N5MR-hPi4TLDOoTdVHhfDSR6VDABXpJhUptEwOpxTDVRwJQvr8i-DnsRd52g"/>
<div class="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
<div class="bg-surface/90 px-4 py-2 rounded-lg shadow-sm border border-outline-variant flex items-center gap-sm">
<span class="material-symbols-outlined text-primary">zoom_in</span>
<span class="font-label-sm text-primary">Preview Mode</span>
</div>
</div>
</div>
<!-- Action Buttons -->
<div class="p-md border-t border-outline-variant bg-surface-container-low flex flex-col gap-sm">
<button class="w-full bg-primary text-white font-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors flex justify-center items-center gap-xs">
<span class="material-symbols-outlined text-[18px]">check_circle</span>
                            Approve Verification
                        </button>
<div class="flex gap-sm">
<button class="flex-1 border border-outline-variant bg-surface-container-lowest text-on-surface font-label-sm py-2 rounded-lg hover:bg-surface-container transition-colors">
                                Request Info
                            </button>
<button class="flex-1 border border-error text-error bg-error-container/20 font-label-sm py-2 rounded-lg hover:bg-error-container/40 transition-colors">
                                Reject
                            </button>
</div>
</div>
</div>
</div>
</div>
</main>
</body></html>
```

---

## PAGE: live_management_hub

```html
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Live Event Management Hub - Eventura</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "outline-variant": "#c7c5d4",
                      "on-tertiary-fixed-variant": "#574500",
                      "primary-fixed-dim": "#c0c1ff",
                      "surface-tint": "#4f54b4",
                      "on-primary-container": "#9da1ff",
                      "on-secondary-container": "#57657a",
                      "inverse-primary": "#c0c1ff",
                      "surface-container-high": "#eae7f0",
                      "on-primary-fixed-variant": "#373a9b",
                      "primary-container": "#2e3192",
                      "surface": "#fcf8ff",
                      "on-secondary-fixed": "#0d1c2e",
                      "on-primary-fixed": "#04006d",
                      "surface-bright": "#fcf8ff",
                      "secondary": "#515f74",
                      "primary": "#15157d",
                      "surface-variant": "#e4e1ea",
                      "tertiary": "#735c00",
                      "secondary-container": "#d5e3fc",
                      "on-background": "#1b1b21",
                      "background": "#fcf8ff",
                      "error-container": "#ffdad6",
                      "error": "#ba1a1a",
                      "tertiary-fixed-dim": "#e9c349",
                      "tertiary-fixed": "#ffe088",
                      "surface-container-lowest": "#ffffff",
                      "secondary-fixed": "#d5e3fc",
                      "inverse-on-surface": "#f2eff8",
                      "on-secondary": "#ffffff",
                      "on-surface": "#1b1b21",
                      "surface-dim": "#dbd9e1",
                      "on-tertiary-fixed": "#241a00",
                      "surface-container-highest": "#e4e1ea",
                      "on-surface-variant": "#464652",
                      "on-error-container": "#93000a",
                      "secondary-fixed-dim": "#b9c7df",
                      "on-error": "#ffffff",
                      "surface-container": "#f0ecf5",
                      "inverse-surface": "#303036",
                      "on-tertiary": "#ffffff",
                      "primary-fixed": "#e1e0ff",
                      "on-primary": "#ffffff",
                      "outline": "#777683",
                      "tertiary-container": "#cca730",
                      "surface-container-low": "#f5f2fb",
                      "on-tertiary-container": "#4f3d00",
                      "on-secondary-fixed-variant": "#3a485b"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "sm": "8px",
                      "md": "16px",
                      "gutter": "24px",
                      "lg": "24px",
                      "xs": "4px",
                      "margin-mobile": "16px",
                      "xl": "40px",
                      "margin-desktop": "48px",
                      "unit": "4px"
              },
              "fontFamily": {
                      "body-md": [
                              "Inter"
                      ],
                      "body-lg": [
                              "Inter"
                      ],
                      "headline-md": [
                              "Public Sans"
                      ],
                      "display-lg": [
                              "Public Sans"
                      ],
                      "label-sm": [
                              "Inter"
                      ],
                      "title-md": [
                              "Inter"
                      ],
                      "headline-lg": [
                              "Public Sans"
                      ]
              },
              "fontSize": {
                      "body-md": [
                              "14px",
                              {
                                      "lineHeight": "1.5",
                                      "letterSpacing": "0em",
                                      "fontWeight": "400"
                              }
                      ],
                      "body-lg": [
                              "16px",
                              {
                                      "lineHeight": "1.6",
                                      "letterSpacing": "0em",
                                      "fontWeight": "400"
                              }
                      ],
                      "headline-md": [
                              "24px",
                              {
                                      "lineHeight": "1.3",
                                      "letterSpacing": "0.01em",
                                      "fontWeight": "600"
                              }
                      ],
                      "display-lg": [
                              "48px",
                              {
                                      "lineHeight": "1.1",
                                      "letterSpacing": "0.02em",
                                      "fontWeight": "700"
                              }
                      ],
                      "label-sm": [
                              "12px",
                              {
                                      "lineHeight": "1",
                                      "letterSpacing": "0.05em",
                                      "fontWeight": "600"
                              }
                      ],
                      "title-md": [
                              "18px",
                              {
                                      "lineHeight": "1.5",
                                      "letterSpacing": "0em",
                                      "fontWeight": "600"
                              }
                      ],
                      "headline-lg": [
                              "32px",
                              {
                                      "lineHeight": "1.2",
                                      "letterSpacing": "0.015em",
                                      "fontWeight": "600"
                              }
                      }
              }
            },
          }
      </script>
</head>
<body class="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
<!-- TopNavBar -->
<header class="bg-surface dark:bg-surface-container font-body-md text-body-md docked full-width top-0 border-b border-outline-variant dark:border-outline flat no shadows flex justify-between items-center w-full px-margin-desktop h-16 sticky z-50">
<div class="flex items-center gap-lg">
<span class="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Eventura</span>
<div class="hidden md:flex items-center gap-xs">
<a class="text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors px-3 py-2 rounded-md" href="#">Discover</a>
<a class="text-primary dark:text-primary-fixed-dim font-bold border-b-2 border-primary hover:text-primary dark:hover:text-primary-fixed-dim transition-colors px-3 py-2" href="#">My Events</a>
<a class="text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors px-3 py-2 rounded-md" href="#">Calendar</a>
</div>
</div>
<div class="flex items-center gap-md">
<div class="hidden md:flex relative text-on-surface-variant">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input class="pl-10 pr-4 py-2 bg-surface-container-high rounded-full border-none focus:ring-2 focus:ring-primary text-sm w-64" placeholder="Search..." type="text"/>
</div>
<button class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-variant">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-variant">
<span class="material-symbols-outlined" data-icon="help_outline">help_outline</span>
</button>
<button class="hidden md:block bg-surface border border-outline-variant text-on-surface-variant px-4 py-2 rounded-md hover:bg-surface-variant transition-colors text-sm font-semibold">Switch to Organizer</button>
<button class="bg-primary text-on-primary px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-semibold whitespace-nowrap">Create Event</button>
<img alt="User profile" class="h-8 w-8 rounded-full border border-outline-variant cursor-pointer" data-alt="A small circular profile picture of a professional individual, clean lighting, corporate style, neutral background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCHFRJo_1uknFdAWTpViWbo9bgHXfp6ILrDeB3aEq0VrzHMiALq6hzLDe-BFbambZDetUTaIGYChRHNoqmXM3g1aRgCBxL4n-uLLbJp9N2XYjgwy7YInRWlrqN4vutSxCuKrqsSQ9LjsMHOXCxX-PguKOsrPD8hT_h7ar6RiOy2_eJMI24NjxYP46oNvR4F91bB7CLD3Q_XT0Tj_pghEppkgvYJefIBKE7agNFHQ19QTBG5KYEt_zBziVOtYkutX1l71Fxcj_g5A"/>
</div>
</header>
<div class="flex flex-1 overflow-hidden">
<!-- Main Content -->
<main class="flex-1 overflow-y-auto bg-surface-container-low p-margin-mobile md:p-margin-desktop">
<!-- Event Summary Header -->
<div class="mb-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
<div>
<nav aria-label="Breadcrumb" class="flex text-on-surface-variant text-sm mb-2">
<ol class="inline-flex items-center space-x-1 md:space-x-3">
<li class="inline-flex items-center">
<a class="inline-flex items-center hover:text-primary" href="#">My Events</a>
</li>
<li>
<div class="flex items-center">
<span class="material-symbols-outlined text-sm mx-1">chevron_right</span>
<a class="hover:text-primary" href="#">Annual Tech Symposium 2024</a>
</div>
</li>
<li aria-current="page">
<div class="flex items-center">
<span class="material-symbols-outlined text-sm mx-1">chevron_right</span>
<span class="text-primary font-semibold">Manage</span>
</div>
</li>
</ol>
</nav>
<h1 class="font-display-lg text-display-lg text-on-surface">Annual Tech Symposium 2024</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant mt-2 flex items-center gap-2">
<span class="material-symbols-outlined text-base">calendar_today</span> Oct 15, 2024 | 09:00 AM - 05:00 PM
                        <span class="material-symbols-outlined text-base ml-4">location_on</span> Main Campus Auditorium
                    </p>
</div>
<div class="flex gap-3">
<button class="bg-surface border border-outline-variant text-secondary px-4 py-2 rounded-lg hover:bg-surface-variant transition-colors flex items-center gap-2 font-semibold">
<span class="material-symbols-outlined text-sm">edit</span> Edit Event
                    </button>
<button class="bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-semibold shadow-sm">
<span class="material-symbols-outlined text-sm">qr_code_scanner</span> Launch Scanner
                    </button>
</div>
</div>
<!-- Bento Grid Layout -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
<!-- Column 1: Real-time Status & Quick Actions -->
<div class="lg:col-span-4 flex flex-col gap-gutter">
<!-- Stats Card -->
<div class="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
<h2 class="font-title-md text-title-md text-on-surface mb-6 border-b border-surface-variant pb-3 flex items-center gap-2">
<span class="material-symbols-outlined text-primary">monitoring</span> Real-time Status
                        </h2>
<div class="space-y-6">
<div class="flex justify-between items-end">
<div>
<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Registered</p>
<p class="font-display-lg text-display-lg text-on-surface leading-none">450</p>
</div>
<div class="bg-surface-container-high text-on-surface px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
<span class="material-symbols-outlined text-xs">trending_up</span> +12 today
                                </div>
</div>
<div class="flex justify-between items-end">
<div>
<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Checked In</p>
<p class="font-display-lg text-display-lg text-primary leading-none">312</p>
</div>
<div class="bg-[#d1fae5] text-[#047857] px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                    69% Complete
                                </div>
</div>
<div class="flex justify-between items-end">
<div>
<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Remaining</p>
<p class="font-headline-lg text-headline-lg text-on-surface-variant leading-none">138</p>
</div>
</div>
<!-- Progress Bar -->
<div class="w-full bg-surface-variant rounded-full h-2 mt-4">
<div class="bg-primary h-2 rounded-full" style="width: 69%"></div>
</div>
</div>
</div>
<!-- Quick Actions Card -->
<div class="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
<h2 class="font-title-md text-title-md text-on-surface mb-4 border-b border-surface-variant pb-3">Quick Actions</h2>
<div class="grid grid-cols-1 gap-3">
<button class="bg-surface border border-outline-variant text-secondary px-4 py-3 rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-between font-semibold w-full">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined">download</span> Export Attendee List
                                </div>
<span class="material-symbols-outlined text-outline">chevron_right</span>
</button>
<button class="bg-surface border border-outline-variant text-secondary px-4 py-3 rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-between font-semibold w-full">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined">campaign</span> Send Announcement
                                </div>
<span class="material-symbols-outlined text-outline">chevron_right</span>
</button>
<button class="bg-surface border border-outline-variant text-secondary px-4 py-3 rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-between font-semibold w-full">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined">print</span> Print Badges
                                </div>
<span class="material-symbols-outlined text-outline">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Column 2 & 3: Attendee Management & Live Feed -->
<div class="lg:col-span-8 flex flex-col gap-gutter">
<!-- Attendee Table -->
<div class="bg-surface border border-outline-variant rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
<div class="p-6 border-b border-surface-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
<h2 class="font-title-md text-title-md text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-primary">group</span> Attendee Management
                            </h2>
<div class="flex gap-2 w-full sm:w-auto">
<div class="relative flex-1 sm:w-64">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input class="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface" placeholder="Search names, emails..." type="text"/>
</div>
<button class="bg-surface border border-outline-variant text-secondary px-3 py-2 rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-center">
<span class="material-symbols-outlined text-sm">filter_list</span>
</button>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low border-b border-surface-variant">
<th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Attendee</th>
<th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Ticket Type</th>
<th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
<th class="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Action</th>
</tr>
</thead>
<tbody class="text-sm">
<tr class="border-b border-surface-variant hover:bg-surface-container-low transition-colors group">
<td class="py-3 px-6">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">JD</div>
<div>
<div class="font-semibold text-on-surface">John Doe</div>
<div class="text-xs text-on-surface-variant">john.doe@university.edu</div>
</div>
</div>
</td>
<td class="py-3 px-6"><span class="bg-surface-container-high text-on-surface px-2 py-1 rounded text-xs">VIP</span></td>
<td class="py-3 px-6">
<span class="bg-[#d1fae5] text-[#047857] px-2 py-1 rounded text-xs font-semibold flex items-center w-fit gap-1">
<span class="material-symbols-outlined text-[14px]">check_circle</span> Checked In
                                            </span>
</td>
<td class="py-3 px-6 text-right">
<button class="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
<span class="material-symbols-outlined text-sm">more_vert</span>
</button>
</td>
</tr>
<tr class="border-b border-surface-variant hover:bg-surface-container-low transition-colors group">
<td class="py-3 px-6">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">AS</div>
<div>
<div class="font-semibold text-on-surface">Alice Smith</div>
<div class="text-xs text-on-surface-variant">alice.smith@university.edu</div>
</div>
</div>
</td>
<td class="py-3 px-6"><span class="bg-surface-container-high text-on-surface px-2 py-1 rounded text-xs">General Admission</span></td>
<td class="py-3 px-6">
<span class="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-xs font-semibold">Pending</span>
</td>
<td class="py-3 px-6 text-right">
<button class="bg-surface border border-outline-variant text-secondary px-3 py-1.5 rounded hover:bg-surface-variant transition-colors text-xs font-semibold">
                                                Check In
                                            </button>
</td>
</tr>
<tr class="border-b border-surface-variant hover:bg-surface-container-low transition-colors group">
<td class="py-3 px-6">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-xs">RJ</div>
<div>
<div class="font-semibold text-on-surface">Robert Johnson</div>
<div class="text-xs text-on-surface-variant">r.johnson@university.edu</div>
</div>
</div>
</td>
<td class="py-3 px-6"><span class="bg-surface-container-high text-on-surface px-2 py-1 rounded text-xs">Speaker</span></td>
<td class="py-3 px-6">
<span class="bg-[#d1fae5] text-[#047857] px-2 py-1 rounded text-xs font-semibold flex items-center w-fit gap-1">
<span class="material-symbols-outlined text-[14px]">check_circle</span> Checked In
                                            </span>
</td>
<td class="py-3 px-6 text-right">
<button class="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
<span class="material-symbols-outlined text-sm">more_vert</span>
</button>
</td>
</tr>
<tr class="border-b border-surface-variant hover:bg-surface-container-low transition-colors group">
<td class="py-3 px-6">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-error-container text-on-error-container flex items-center justify-center font-bold text-xs">EW</div>
<div>
<div class="font-semibold text-on-surface">Emily White</div>
<div class="text-xs text-on-surface-variant">e.white@university.edu</div>
</div>
</div>
</td>
<td class="py-3 px-6"><span class="bg-surface-container-high text-on-surface px-2 py-1 rounded text-xs">General Admission</span></td>
<td class="py-3 px-6">
<span class="bg-error-container text-on-error-container px-2 py-1 rounded text-xs font-semibold">Payment Due</span>
</td>
<td class="py-3 px-6 text-right">
<button class="bg-surface border border-outline-variant text-secondary px-3 py-1.5 rounded hover:bg-surface-variant transition-colors text-xs font-semibold opacity-50 cursor-not-allowed" disabled="">
                                                Check In
                                            </button>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="py-3 px-6">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">ML</div>
<div>
<div class="font-semibold text-on-surface">Michael Lee</div>
<div class="text-xs text-on-surface-variant">m.lee@university.edu</div>
</div>
</div>
</td>
<td class="py-3 px-6"><span class="bg-surface-container-high text-on-surface px-2 py-1 rounded text-xs">Student</span></td>
<td class="py-3 px-6">
<span class="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-xs font-semibold">Pending</span>
</td>
<td class="py-3 px-6 text-right">
<button class="bg-surface border border-outline-variant text-secondary px-3 py-1.5 rounded hover:bg-surface-variant transition-colors text-xs font-semibold">
                                                Check In
                                            </button>
</td>
</tr>
</tbody>
</table>
</div>
<div class="p-4 border-t border-surface-variant flex justify-between items-center text-sm text-on-surface-variant bg-surface-container-lowest mt-auto">
<span>Showing 1 to 5 of 450 entries</span>
<div class="flex gap-1">
<button class="px-2 py-1 border border-outline-variant rounded hover:bg-surface-variant disabled:opacity-50" disabled="">Prev</button>
<button class="px-2 py-1 border border-primary bg-primary text-on-primary rounded">1</button>
<button class="px-2 py-1 border border-outline-variant rounded hover:bg-surface-variant">2</button>
<button class="px-2 py-1 border border-outline-variant rounded hover:bg-surface-variant">3</button>
<button class="px-2 py-1 border border-outline-variant rounded hover:bg-surface-variant">Next</button>
</div>
</div>
</div>
<!-- Split Row: Live Feed & Scanner Management -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter h-64">
<!-- Live Check-in Feed -->
<div class="bg-surface border border-outline-variant rounded-xl shadow-sm flex flex-col overflow-hidden">
<h2 class="font-title-md text-title-md text-on-surface p-4 border-b border-surface-variant flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="relative flex h-3 w-3">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
<span class="relative inline-flex rounded-full h-3 w-3 bg-[#047857]"></span>
</span>
                                    Live Feed
                                </div>
<span class="text-xs font-normal text-on-surface-variant">Auto-updating</span>
</h2>
<div class="p-4 overflow-y-auto flex-1 space-y-3 bg-surface-container-low/50">
<div class="flex justify-between items-center text-sm bg-surface p-2 rounded border border-outline-variant/50">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#047857] text-base">how_to_reg</span>
<span class="font-semibold text-on-surface">Robert Johnson</span>
</div>
<span class="text-xs text-on-surface-variant">Just now</span>
</div>
<div class="flex justify-between items-center text-sm bg-surface p-2 rounded border border-outline-variant/50">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#047857] text-base">how_to_reg</span>
<span class="font-semibold text-on-surface">John Doe</span>
</div>
<span class="text-xs text-on-surface-variant">2 mins ago</span>
</div>
<div class="flex justify-between items-center text-sm bg-surface p-2 rounded border border-outline-variant/50 opacity-70">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#047857] text-base">how_to_reg</span>
<span class="font-semibold text-on-surface">Sarah Connor</span>
</div>
<span class="text-xs text-on-surface-variant">5 mins ago</span>
</div>
<div class="flex justify-between items-center text-sm bg-surface p-2 rounded border border-outline-variant/50 opacity-50">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#047857] text-base">how_to_reg</span>
<span class="font-semibold text-on-surface">Kyle Reese</span>
</div>
<span class="text-xs text-on-surface-variant">12 mins ago</span>
</div>
</div>
</div>
<!-- Scanner Management -->
<div class="bg-surface border border-outline-variant rounded-xl shadow-sm flex flex-col overflow-hidden">
<h2 class="font-title-md text-title-md text-on-surface p-4 border-b border-surface-variant flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary">badge</span> Scanners
                                </div>
<button class="text-primary hover:bg-primary-container/20 p-1 rounded text-sm flex items-center transition-colors">
<span class="material-symbols-outlined text-sm">add</span> Add
                                </button>
</h2>
<div class="p-4 overflow-y-auto flex-1">
<div class="space-y-3">
<div class="flex items-center justify-between p-3 border border-outline-variant rounded-lg">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded-full bg-surface-variant flex items-center justify-center">
<span class="material-symbols-outlined text-sm text-on-surface-variant">person</span>
</div>
<div>
<p class="text-sm font-semibold text-on-surface">Gate 1 - Main Entrance</p>
<p class="text-xs text-on-surface-variant">Active • 142 Scans</p>
</div>
</div>
<button class="text-error hover:bg-error-container p-1 rounded transition-colors">
<span class="material-symbols-outlined text-sm">block</span>
</button>
</div>
<div class="flex items-center justify-between p-3 border border-outline-variant rounded-lg">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded-full bg-surface-variant flex items-center justify-center">
<span class="material-symbols-outlined text-sm text-on-surface-variant">person</span>
</div>
<div>
<p class="text-sm font-semibold text-on-surface">Gate 2 - VIP Entrance</p>
<p class="text-xs text-on-surface-variant">Active • 45 Scans</p>
</div>
</div>
<button class="text-error hover:bg-error-container p-1 rounded transition-colors">
<span class="material-symbols-outlined text-sm">block</span>
</button>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
</body></html>
```

---

## PAGE: login_page

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - Login</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
<!-- Tailwind CSS via CDN -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter", "sans-serif"],
                        "body-lg": ["Inter", "sans-serif"],
                        "headline-md": ["Public Sans", "sans-serif"],
                        "display-lg": ["Public Sans", "sans-serif"],
                        "label-sm": ["Inter", "sans-serif"],
                        "title-md": ["Inter", "sans-serif"],
                        "headline-lg": ["Public Sans", "sans-serif"]
                    },
                    "fontSize": {
                        "body-md": ["14px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400" }],
                        "body-lg": ["16px", { "lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "1.3", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "0.02em", "fontWeight": "700" }],
                        "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
                        "title-md": ["18px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "0.015em", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-background text-on-surface antialiased min-h-screen flex selection:bg-primary-fixed selection:text-on-primary-fixed">
<!-- Left Panel: Branding & Imagery -->
<div class="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-primary flex-col justify-between overflow-hidden border-r border-outline-variant">
<!-- Background Image with Overlay -->
<img alt="University campus building" class="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-60" data-alt="A sweeping, high-quality photograph of a modern university campus building exterior at dusk. The architecture features clean lines, expansive glass windows reflecting the twilight sky, and structural concrete pillars. The scene is illuminated by warm, inviting interior lights glowing from within the building, contrasting with the cool, deep indigo shadows of the evening. The overall mood conveys prestige, academic excellence, and institutional reliability, perfectly aligning with a corporate-modern aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1UyodiD9_x0fiWbuf-f9ZgPKztt8Pag_ornzOAs7rMoIQBIjYSsj6r8IMyID4q6dazNeuxITyWYoczLlPYDbbCznq2dbjV3beObGbof9L59EGPqD1SZTu6BYGP9KLGbnV6FlGv94Q_6vvOfrcPk0Ybu-obumHJUgrphwE4Bi7QJyTtw5kQtT8HrS-dOs34kg4wjSxjj7g0nT3HPfi3r4sL25HX4ovFlID3Zq6gyDe4Tm8192ZYNZ6vY-VS50Re6NpMrDd-4qgOA"/>
<!-- Gradient Overlay to ensure text readability -->
<div class="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/70 to-primary/90"></div>
<!-- Content Area -->
<div class="relative z-10 flex flex-col h-full justify-between p-margin-desktop xl:p-16">
<!-- Logo -->
<div class="mt-lg">
<img alt="Eventura Logo" class="h-12 w-auto object-contain bg-surface-container-lowest rounded p-xs" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyqd9Ij1W7CTJiCPhkH1vlPAtqJVqSauJE23o9zcWfpqm6D9KPw9kVER4rCdoY0HiD_lOgpOfTfsnw85F1HWWd9Sf_qtZiRv4gqz0bC8nn4Wfw7F7N9-ioMVwJE5KLgsTZzdc_PBg-E_ta5Ej4oltQBEXmJGu-xE8Kh5JPEpWlmYalR7QWt6GZqO5HL0w68KWHwSukSlJBUjYDPw4HxyuQSng275lgD7Ri5cV8Hd5nODm-2dDy9Qk5bzui9002MwXNge5cPn43OQ"/>
</div>
<!-- Tagline -->
<div class="mb-xl max-w-lg">
<h1 class="font-display-lg text-display-lg text-on-primary mb-md">
                    Enterprise Event Management for Higher Education
                </h1>
<p class="font-body-lg text-body-lg text-primary-fixed-dim">
                    Streamline institutional event planning, coordination, and execution with our secure, built-to-last platform.
                </p>
</div>
</div>
</div>
<!-- Right Panel: Login Form -->
<div class="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface-container-lowest">
<div class="w-full max-w-md flex flex-col">
<!-- Mobile Logo (Hidden on Desktop) -->
<div class="lg:hidden mb-xl flex justify-center">
<img alt="Eventura Logo" class="h-10 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyqd9Ij1W7CTJiCPhkH1vlPAtqJVqSauJE23o9zcWfpqm6D9KPw9kVER4rCdoY0HiD_lOgpOfTfsnw85F1HWWd9Sf_qtZiRv4gqz0bC8nn4Wfw7F7N9-ioMVwJE5KLgsTZzdc_PBg-E_ta5Ej4oltQBEXmJGu-xE8Kh5JPEpWlmYalR7QWt6GZqO5HL0w68KWHwSukSlJBUjYDPw4HxyuQSng275lgD7Ri5cV8Hd5nODm-2dDy9Qk5bzui9002MwXNge5cPn43OQ"/>
</div>
<!-- Header -->
<div class="mb-xl text-center lg:text-left">
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-xs">Welcome Back</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Please enter your credentials to access your dashboard.</p>
</div>
<!-- Form -->
<form class="space-y-md">
<!-- Email Field -->
<div>
<label class="block font-label-sm text-label-sm text-on-surface mb-sm" for="email">Email Address</label>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
<span class="material-symbols-outlined text-outline text-[20px]">mail</span>
</div>
<input class="block w-full pl-xl pr-sm py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none" id="email" name="email" placeholder="admin@university.edu" required="" type="email"/>
</div>
</div>
<!-- Password Field -->
<div>
<div class="flex items-center justify-between mb-sm">
<label class="block font-label-sm text-label-sm text-on-surface" for="password">Password</label>
<a class="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors focus:outline-none focus:underline" href="#">Forgot Password?</a>
</div>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
<span class="material-symbols-outlined text-outline text-[20px]">lock</span>
</div>
<input class="block w-full pl-xl pr-sm py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none" id="password" name="password" placeholder="••••••••" required="" type="password"/>
</div>
</div>
<!-- Primary Action -->
<button class="w-full h-12 lg:h-10 mt-lg flex justify-center items-center bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm" type="submit">
                    Sign In
                </button>
</form>
<!-- Divider -->
<div class="mt-xl mb-lg relative">
<div aria-hidden="true" class="absolute inset-0 flex items-center">
<div class="w-full border-t border-outline-variant"></div>
</div>
<div class="relative flex justify-center">
<span class="px-md bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Or continue with</span>
</div>
</div>
<!-- Social Login -->
<button class="w-full h-12 lg:h-10 flex justify-center items-center gap-sm bg-surface-container-lowest border border-outline-variant text-on-surface font-label-sm text-label-sm rounded-lg hover:bg-surface-container hover:border-outline transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-outline" type="button">
<!-- Simple SVG for Google Icon as it's standard for social login -->
<svg class="w-5 h-5" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
</svg>
                Sign in with Google
            </button>
<!-- Sign Up Link -->
<p class="mt-xl text-center font-body-md text-body-md text-on-surface-variant">
                Don't have an account? 
                <a class="font-bold text-primary hover:text-primary-container hover:underline transition-colors focus:outline-none" href="#">Sign up</a>
</p>
</div>
</div>
</body></html>
```

---

## PAGE: organizer_dashboard

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - Organizer Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
                "outline-variant": "#c7c5d4",
                "on-tertiary-fixed-variant": "#574500",
                "primary-fixed-dim": "#c0c1ff",
                "surface-tint": "#4f54b4",
                "on-primary-container": "#9da1ff",
                "on-secondary-container": "#57657a",
                "inverse-primary": "#c0c1ff",
                "surface-container-high": "#eae7f0",
                "on-primary-fixed-variant": "#373a9b",
                "primary-container": "#2e3192",
                "surface": "#fcf8ff",
                "on-secondary-fixed": "#0d1c2e",
                "on-primary-fixed": "#04006d",
                "surface-bright": "#fcf8ff",
                "secondary": "#515f74",
                "primary": "#15157d",
                "surface-variant": "#e4e1ea",
                "tertiary": "#735c00",
                "secondary-container": "#d5e3fc",
                "on-background": "#1b1b21",
                "background": "#fcf8ff",
                "error-container": "#ffdad6",
                "error": "#ba1a1a",
                "tertiary-fixed-dim": "#e9c349",
                "tertiary-fixed": "#ffe088",
                "surface-container-lowest": "#ffffff",
                "secondary-fixed": "#d5e3fc",
                "inverse-on-surface": "#f2eff8",
                "on-secondary": "#ffffff",
                "on-surface": "#1b1b21",
                "surface-dim": "#dbd9e1",
                "on-tertiary-fixed": "#241a00",
                "surface-container-highest": "#e4e1ea",
                "on-surface-variant": "#464652",
                "on-error-container": "#93000a",
                "secondary-fixed-dim": "#b9c7df",
                "on-error": "#ffffff",
                "surface-container": "#f0ecf5",
                "inverse-surface": "#303036",
                "on-tertiary": "#ffffff",
                "primary-fixed": "#e1e0ff",
                "on-primary": "#ffffff",
                "outline": "#777683",
                "tertiary-container": "#cca730",
                "surface-container-low": "#f5f2fb",
                "on-tertiary-container": "#4f3d00",
                "on-secondary-fixed-variant": "#3a485b"
        },
        "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
        },
        "spacing": {
                "sm": "8px",
                "md": "16px",
                "gutter": "24px",
                "lg": "24px",
                "xs": "4px",
                "margin-mobile": "16px",
                "xl": "40px",
                "margin-desktop": "48px",
                "unit": "4px"
        },
        "fontFamily": {
                "body-md": [
                        "Inter"
                ],
                "body-lg": [
                        "Inter"
                ],
                "headline-md": [
                        "Public Sans"
                ],
                "display-lg": [
                        "Public Sans"
                ],
                "label-sm": [
                        "Inter"
                ],
                "title-md": [
                        "Inter"
                ],
                "headline-lg": [
                        "Public Sans"
                ]
        },
        "fontSize": {
                "body-md": [
                        "14px",
                        {
                                "lineHeight": "1.5",
                                "letterSpacing": "0em",
                                "fontWeight": "400"
                        }
                ],
                "body-lg": [
                        "16px",
                        {
                                "lineHeight": "1.6",
                                "letterSpacing": "0em",
                                "fontWeight": "400"
                        }
                ],
                "headline-md": [
                        "24px",
                        {
                                "lineHeight": "1.3",
                                "letterSpacing": "0.01em",
                                "fontWeight": "600"
                        }
                ],
                "display-lg": [
                        "48px",
                        {
                                "lineHeight": "1.1",
                                "letterSpacing": "0.02em",
                                "fontWeight": "700"
                        }
                ],
                "label-sm": [
                        "12px",
                        {
                                "lineHeight": "1",
                                "letterSpacing": "0.05em",
                                "fontWeight": "600"
                        }
                ],
                "title-md": [
                        "18px",
                        {
                                "lineHeight": "1.5",
                                "letterSpacing": "0em",
                                "fontWeight": "600"
                        }
                ],
                "headline-lg": [
                        "32px",
                        {
                                "lineHeight": "1.2",
                                "letterSpacing": "0.015em",
                                "fontWeight": "600"
                        }
                ]
        }
},
    },
  }
</script>
<style>
  body {
    background-color: #fcf8ff;
  }
</style>
</head>
<body class="bg-surface text-on-surface font-body-md h-screen flex overflow-hidden">
<!-- SideNavBar -->
<aside class="hidden md:flex bg-primary text-on-primary font-body-md text-body-md h-full w-64 shadow-sm flex-col border-r border-outline-variant z-10">
<div class="p-6 border-b border-primary-container/30">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded bg-white flex items-center justify-center font-bold text-primary text-xl">
                E
            </div>
<div>
<h1 class="font-headline-sm text-headline-sm font-bold text-on-primary">Eventura Admin</h1>
<p class="text-sm text-primary-fixed-dim">State University</p>
</div>
</div>
<button class="mt-6 w-full bg-white text-primary font-bold py-2 px-4 rounded hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-sm">add</span>
            New Campaign
        </button>
</div>
<nav class="flex-1 overflow-y-auto py-4">
<ul class="space-y-1">
<li>
<a class="flex items-center gap-3 bg-primary-container text-on-primary-container rounded-lg mx-2 my-1 px-4 py-3 hover:bg-primary-container/80 transition-colors" href="#">
<span class="material-symbols-outlined" data-weight="fill" style="font-variation-settings: 'FILL' 1;">dashboard</span>
<span class="font-bold">Dashboard</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">event</span>
<span>Events</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">bar_chart</span>
<span>Analytics</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">settings</span>
<span>Settings</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">admin_panel_settings</span>
<span>Admin Console</span>
</a>
</li>
</ul>
</nav>
<div class="p-4 border-t border-primary-container/30">
<ul class="space-y-1">
<li>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">contact_support</span>
<span>Support</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 text-primary-fixed-dim mx-2 my-1 px-4 py-3 hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">logout</span>
<span>Logout</span>
</a>
</li>
</ul>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 flex flex-col overflow-hidden bg-background">
<!-- TopNavBar (Mobile Only) -->
<header class="md:hidden bg-surface flex justify-between items-center w-full px-margin-mobile h-16 border-b border-outline-variant">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-2xl">menu</span>
<span class="font-headline-md text-headline-md font-bold text-primary">Eventura</span>
</div>
<div class="flex items-center gap-4">
<span class="material-symbols-outlined text-on-surface-variant">notifications</span>
<div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
                SU
            </div>
</div>
</header>
<!-- Content Area -->
<div class="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
<div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-4">
<div>
<h2 class="font-headline-lg text-headline-lg font-bold text-primary">Organizer Overview</h2>
<p class="text-on-surface-variant mt-1 text-body-lg">Welcome back. Here is your dashboard summary.</p>
</div>
<div class="flex gap-3 w-full md:w-auto">
<button class="flex-1 md:flex-none bg-white border border-outline-variant text-on-surface font-semibold py-2 px-4 rounded hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-sm">download</span>
                    Export Report
                </button>
</div>
</div>
<!-- Bento Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-gutter">
<!-- KPIs Section (Span 8 cols on desktop) -->
<div class="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-gutter">
<!-- Revenue KPI -->
<div class="bg-white rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between">
<div class="flex justify-between items-start">
<div>
<p class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Total Revenue</p>
<h3 class="font-headline-md text-headline-md font-bold text-on-surface mt-2">$42,500.00</h3>
</div>
<div class="bg-primary-container text-on-primary-container p-2 rounded">
<span class="material-symbols-outlined">payments</span>
</div>
</div>
<div class="mt-4 flex items-center gap-2 text-sm">
<span class="flex items-center text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
<span class="material-symbols-outlined text-xs mr-1">trending_up</span>
                            +12.5%
                        </span>
<span class="text-on-surface-variant">vs last month</span>
</div>
</div>
<!-- Registrations KPI -->
<div class="bg-white rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between">
<div class="flex justify-between items-start">
<div>
<p class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Total Registrations</p>
<h3 class="font-headline-md text-headline-md font-bold text-on-surface mt-2">1,248</h3>
</div>
<div class="bg-secondary-container text-on-secondary-container p-2 rounded">
<span class="material-symbols-outlined">group</span>
</div>
</div>
<div class="mt-4 flex items-center gap-2 text-sm">
<span class="flex items-center text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
<span class="material-symbols-outlined text-xs mr-1">trending_up</span>
                            +8.2%
                        </span>
<span class="text-on-surface-variant">vs last month</span>
</div>
</div>
<!-- Active Events KPI -->
<div class="bg-white rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between">
<div class="flex justify-between items-start">
<div>
<p class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Active Events</p>
<h3 class="font-headline-md text-headline-md font-bold text-on-surface mt-2">14</h3>
</div>
<div class="bg-tertiary-container text-on-tertiary-container p-2 rounded">
<span class="material-symbols-outlined">event_available</span>
</div>
</div>
<div class="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
<span>Across 3 campuses</span>
</div>
</div>
<!-- Avg Check-in Rate KPI -->
<div class="bg-white rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between">
<div class="flex justify-between items-start">
<div>
<p class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Avg Check-in Rate</p>
<h3 class="font-headline-md text-headline-md font-bold text-on-surface mt-2">86%</h3>
</div>
<div class="bg-surface-variant text-on-surface-variant p-2 rounded">
<span class="material-symbols-outlined">how_to_reg</span>
</div>
</div>
<div class="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
<span>Consistently high engagement</span>
</div>
</div>
</div>
<!-- Payout & Tasks Side Column (Span 4 cols on desktop) -->
<div class="md:col-span-4 flex flex-col gap-gutter">
<!-- Payout Status Card -->
<div class="bg-white rounded-xl border border-outline-variant p-6 shadow-sm">
<div class="flex items-center justify-between border-b border-surface-variant pb-4 mb-4">
<h3 class="font-title-md text-title-md font-bold text-primary">Payout Status</h3>
<span class="material-symbols-outlined text-outline">account_balance</span>
</div>
<div>
<p class="text-sm text-on-surface-variant mb-1">Current Balance (Razorpay Route)</p>
<h4 class="font-headline-md text-headline-md font-bold text-on-surface mb-6">$12,450.00</h4>
<div class="bg-surface-container-low p-4 rounded-lg flex items-start gap-3">
<span class="material-symbols-outlined text-primary mt-0.5">calendar_month</span>
<div>
<p class="text-sm font-semibold text-on-surface">Next Scheduled Payout</p>
<p class="text-sm text-on-surface-variant">October 15, 2024</p>
</div>
</div>
</div>
</div>
<!-- Tasks & Approvals -->
<div class="bg-white rounded-xl border border-outline-variant p-6 shadow-sm flex-1">
<div class="flex items-center justify-between border-b border-surface-variant pb-4 mb-4">
<h3 class="font-title-md text-title-md font-bold text-primary">Tasks &amp; Approvals</h3>
<span class="bg-error-container text-on-error-container text-xs font-bold px-2 py-1 rounded-full">3</span>
</div>
<ul class="space-y-4">
<li class="flex items-start gap-3 pb-3 border-b border-surface-variant/50 last:border-0 last:pb-0">
<div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0 mt-1">
<span class="material-symbols-outlined text-on-secondary-container text-sm">question_mark</span>
</div>
<div>
<p class="text-sm font-semibold text-on-surface">Pending Attendee Queries</p>
<p class="text-xs text-on-surface-variant mt-1">5 unread messages regarding "Tech Symposium 2024"</p>
<button class="text-primary text-xs font-bold mt-2 hover:underline">Review Queries</button>
</div>
</li>
<li class="flex items-start gap-3">
<div class="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center flex-shrink-0 mt-1">
<span class="material-symbols-outlined text-on-tertiary-container text-sm">verified</span>
</div>
<div>
<p class="text-sm font-semibold text-on-surface">Event Approval Request</p>
<p class="text-xs text-on-surface-variant mt-1">"Alumni Networking Mixer" requires administrative sign-off.</p>
<button class="text-primary text-xs font-bold mt-2 hover:underline">Review Event</button>
</div>
</li>
</ul>
</div>
</div>
<!-- Recent Events Section (Full Width below KPIs) -->
<div class="md:col-span-12 bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm mt-md">
<div class="p-6 border-b border-surface-variant flex justify-between items-center bg-surface-container-low">
<h3 class="font-title-md text-title-md font-bold text-primary">Recent Events</h3>
<button class="text-primary text-sm font-semibold hover:underline">View All</button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-bright border-b border-surface-variant text-sm text-on-surface-variant">
<th class="py-4 px-6 font-semibold w-1/3">Event Name</th>
<th class="py-4 px-6 font-semibold">Date &amp; Location</th>
<th class="py-4 px-6 font-semibold">Status</th>
<th class="py-4 px-6 font-semibold">Registrations</th>
<th class="py-4 px-6 font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody class="text-sm">
<tr class="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
<td class="py-4 px-6">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded bg-primary-container flex items-center justify-center text-on-primary-container">
<span class="material-symbols-outlined text-lg">science</span>
</div>
<div>
<p class="font-semibold text-on-surface">Annual Science Fair 2024</p>
<p class="text-xs text-on-surface-variant">Faculty of Science</p>
</div>
</div>
</td>
<td class="py-4 px-6">
<p class="text-on-surface">Oct 20 - 22, 2024</p>
<p class="text-xs text-on-surface-variant">Main Campus Hall</p>
</td>
<td class="py-4 px-6">
<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-semibold">Published</span>
</td>
<td class="py-4 px-6">
<div class="flex items-center gap-2">
<div class="w-16 bg-surface-variant rounded-full h-1.5">
<div class="bg-primary h-1.5 rounded-full" style="width: 75%"></div>
</div>
<span class="text-on-surface text-xs font-semibold">450/600</span>
</div>
</td>
<td class="py-4 px-6 text-right">
<div class="flex justify-end gap-2">
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded transition-colors" title="Manage">
<span class="material-symbols-outlined text-sm">settings</span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded transition-colors" title="Edit">
<span class="material-symbols-outlined text-sm">edit</span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded transition-colors" title="View Analytics">
<span class="material-symbols-outlined text-sm">insights</span>
</button>
</div>
</td>
</tr>
<tr class="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
<td class="py-4 px-6">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
<span class="material-symbols-outlined text-lg">music_note</span>
</div>
<div>
<p class="font-semibold text-on-surface">Fall Concert Series</p>
<p class="text-xs text-on-surface-variant">Student Union</p>
</div>
</div>
</td>
<td class="py-4 px-6">
<p class="text-on-surface">Nov 5, 2024</p>
<p class="text-xs text-on-surface-variant">Outdoor Amphitheater</p>
</td>
<td class="py-4 px-6">
<span class="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-xs font-semibold">Draft</span>
</td>
<td class="py-4 px-6">
<span class="text-on-surface-variant text-xs italic">Not started</span>
</td>
<td class="py-4 px-6 text-right">
<div class="flex justify-end gap-2">
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded transition-colors" title="Manage">
<span class="material-symbols-outlined text-sm">settings</span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded transition-colors" title="Edit">
<span class="material-symbols-outlined text-sm">edit</span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded transition-colors opacity-50 cursor-not-allowed" title="View Analytics">
<span class="material-symbols-outlined text-sm">insights</span>
</button>
</div>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-4 px-6">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span class="material-symbols-outlined text-lg">code</span>
</div>
<div>
<p class="font-semibold text-on-surface">Hackathon 2024</p>
<p class="text-xs text-on-surface-variant">Computer Science Dept</p>
</div>
</div>
</td>
<td class="py-4 px-6">
<p class="text-on-surface">Sep 10 - 12, 2024</p>
<p class="text-xs text-on-surface-variant">Innovation Lab</p>
</td>
<td class="py-4 px-6">
<span class="bg-surface-dim text-on-surface-variant px-2 py-1 rounded text-xs font-semibold">Completed</span>
</td>
<td class="py-4 px-6">
<div class="flex items-center gap-2">
<div class="w-16 bg-surface-variant rounded-full h-1.5">
<div class="bg-primary h-1.5 rounded-full" style="width: 100%"></div>
</div>
<span class="text-on-surface text-xs font-semibold">300/300</span>
</div>
</td>
<td class="py-4 px-6 text-right">
<div class="flex justify-end gap-2">
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded transition-colors" title="Manage">
<span class="material-symbols-outlined text-sm">settings</span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded transition-colors opacity-50 cursor-not-allowed" title="Edit">
<span class="material-symbols-outlined text-sm">edit</span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded transition-colors" title="View Analytics">
<span class="material-symbols-outlined text-sm">insights</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</main>
</body></html>
```

---

## PAGE: payouts_finance_dashboard

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - Payouts &amp; Finance</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Public Sans"],
                        "display-lg": ["Public Sans"],
                        "label-sm": ["Inter"],
                        "title-md": ["Inter"],
                        "headline-lg": ["Public Sans"]
                    },
                    "fontSize": {
                        "body-md": ["14px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400"}],
                        "body-lg": ["16px", {"lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "0.01em", "fontWeight": "600"}],
                        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "0.02em", "fontWeight": "700"}],
                        "label-sm": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600"}],
                        "title-md": ["18px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "600"}],
                        "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "0.015em", "fontWeight": "600"}]
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-surface text-on-surface font-body-md h-screen overflow-hidden flex">
<!-- SideNavBar -->
<aside class="bg-primary dark:bg-surface-container-highest flex flex-col h-full border-r border-outline-variant dark:border-outline docked left-0 h-full w-64 shadow-sm z-20 flex-shrink-0">
<div class="p-lg flex items-center gap-md">
<img alt="University Logo" class="w-12 h-12 rounded-full border-2 border-primary-container object-cover" data-alt="A stylized logo of a fictional university featuring a classic crest design with modern minimalist lines. The colors are deep indigo and crisp white. Professional, corporate modern style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiSjgwm87Zcd76pFuqVoViK9l13USAJlW4sLYcuCKFfMxiFh5JcKBUv0g-Gs-7F0dcV2yVXrPTD5k8LEejf_m4k7B7B9i4Ke0k4DX9dzSvbaTk4JewBJNaqw3zVKYOOqfK5jaZExVZrg4iuj4XZW76DwX85XpUMVRjRbGAHDGHaIyiPxY6c2IMuJ-zzpGP2tSSbMFMIitA3Ptu6G66494itTr0Ajy5EGg_4aFDdXXJKq0HHogJje37-kJ9CnuJhVYD7r_dBnA-VA"/>
<div>
<h1 class="font-headline-sm text-headline-sm font-bold text-on-primary dark:text-on-surface">Eventura Admin</h1>
<p class="font-label-sm text-label-sm text-primary-fixed-dim">State University</p>
</div>
</div>
<div class="px-md mb-lg">
<button class="w-full bg-primary-container text-on-primary-container font-label-sm text-label-sm py-sm px-md rounded-lg flex justify-center items-center gap-xs hover:bg-primary-container/80 transition-colors">
<span class="material-symbols-outlined text-[18px]">add</span>
                New Campaign
            </button>
</div>
<nav class="flex-1 overflow-y-auto py-sm flex flex-col gap-xs">
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">dashboard</span>
                Dashboard
            </a>
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">event</span>
                Events
            </a>
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">bar_chart</span>
                Analytics
            </a>
<a class="flex items-center gap-md bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-lg mx-2 my-1 px-4 py-3 font-body-md text-body-md Active: scale-95 transition-transform" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">account_balance</span>
                Payments
            </a>
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">settings</span>
                Settings
            </a>
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">admin_panel_settings</span>
                Admin Console
            </a>
</nav>
<div class="mt-auto py-lg border-t border-primary-container">
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">contact_support</span>
                Support
            </a>
<a class="flex items-center gap-md text-primary-fixed-dim dark:text-on-surface-variant mx-2 my-1 px-4 py-3 rounded-lg hover:bg-primary-container/20 dark:hover:bg-surface-variant transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">logout</span>
                Logout
            </a>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 flex flex-col h-full overflow-hidden bg-background">
<!-- Top App Bar -->
<header class="bg-surface border-b border-outline-variant h-16 flex items-center px-margin-desktop justify-between shrink-0">
<h2 class="font-headline-md text-headline-md font-bold text-primary">Payouts &amp; Finance</h2>
<div class="flex items-center gap-md">
<button class="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
<div class="h-8 w-px bg-outline-variant"></div>
<div class="flex items-center gap-sm">
<div class="text-right">
<p class="font-label-sm text-label-sm text-on-surface">Financial Admin</p>
<p class="font-body-md text-body-md text-on-surface-variant text-[12px]">Dept. of Computing</p>
</div>
<img alt="User Profile" class="w-10 h-10 rounded-full object-cover border border-outline-variant" data-alt="A professional headshot of a mature financial administrator in a corporate setting. High-trust, professional lighting. Crisp corporate modern style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc0RYt2m9avvhlbftJcJowy57nN1ce6Y_JUOKQLWsoG-pVFJsyBJ3LUZq6syT4rA3JjZ4I6OZDYQXLFILm385Phn9l79QjXnqSsxfcEd8UmFRO1jTEqnUfpjU1M3T4FM2xRhZDkAU8wVCTRZtEPMyE6nb48jm7o8l19MrxJVcVYyazCG2tT94dzN-ZjtwuESe8_kjg1dqewyCUk_EitOaLD50gWpG5p6vkiet4YqJxirfnXAa1DKsIjzMQs6wVu9ScDm3BEqczuA"/>
</div>
</div>
</header>
<!-- Scrollable Canvas -->
<div class="flex-1 overflow-y-auto p-margin-desktop">
<div class="max-w-7xl mx-auto space-y-xl">
<!-- Financial Summary KPIs -->
<section>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
<!-- KPI Card 1 -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
<div class="flex justify-between items-start mb-sm">
<p class="font-body-md text-body-md text-on-surface-variant">Total Collected</p>
<span class="material-symbols-outlined text-primary">account_balance_wallet</span>
</div>
<h3 class="font-headline-lg text-headline-lg font-bold text-on-surface mb-xs">$142,500.00</h3>
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px] text-[#059669]">trending_up</span>
<span class="font-label-sm text-label-sm text-[#059669]">12% vs last month</span>
</div>
</div>
<!-- KPI Card 2 -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
<div class="flex justify-between items-start mb-sm">
<p class="font-body-md text-body-md text-on-surface-variant">Platform Fees Paid</p>
<span class="material-symbols-outlined text-secondary">receipt_long</span>
</div>
<h3 class="font-headline-lg text-headline-lg font-bold text-on-surface mb-xs">$4,275.00</h3>
<p class="font-label-sm text-label-sm text-on-surface-variant">3% blended rate</p>
</div>
<!-- KPI Card 3 -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
<div class="flex justify-between items-start mb-sm">
<p class="font-body-md text-body-md text-on-surface-variant">Net Payouts</p>
<span class="material-symbols-outlined text-primary">payments</span>
</div>
<h3 class="font-headline-lg text-headline-lg font-bold text-on-surface mb-xs">$118,000.00</h3>
<p class="font-label-sm text-label-sm text-on-surface-variant">Processed to bank</p>
</div>
<!-- KPI Card 4 -->
<div class="bg-surface-container-lowest border-2 border-primary rounded-xl p-lg shadow-sm bg-primary-fixed/20">
<div class="flex justify-between items-start mb-sm">
<p class="font-body-md text-body-md text-on-primary-fixed font-bold">Current Balance (Escrow)</p>
<span class="material-symbols-outlined text-primary">lock</span>
</div>
<h3 class="font-headline-lg text-headline-lg font-bold text-on-primary-fixed mb-xs">$20,225.00</h3>
<p class="font-label-sm text-label-sm text-on-primary-fixed-variant">Awaiting clearing (T+2)</p>
</div>
</div>
</section>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
<!-- Main Left Column: Transactions -->
<div class="lg:col-span-2 space-y-xl">
<!-- Transaction History -->
<section class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
<div class="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
<h3 class="font-title-md text-title-md text-on-surface">Recent Transactions</h3>
<div class="flex gap-sm">
<button class="bg-surface border border-outline-variant px-md py-sm rounded-lg font-label-sm text-label-sm text-on-surface flex items-center gap-xs hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">filter_list</span> Filter
                                    </button>
<button class="bg-surface border border-outline-variant px-md py-sm rounded-lg font-label-sm text-label-sm text-on-surface flex items-center gap-xs hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">download</span> Export
                                    </button>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="border-b border-outline-variant bg-surface">
<th class="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Date</th>
<th class="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Event / Attendee</th>
<th class="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Amount</th>
<th class="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Tax (GST)</th>
<th class="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Status</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md text-on-surface">
<tr class="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
<td class="p-md whitespace-nowrap">Oct 24, 2023</td>
<td class="p-md">
<p class="font-semibold">Tech Symposium 2023</p>
<p class="text-[12px] text-on-surface-variant">Alice Johnson</p>
</td>
<td class="p-md font-semibold">$150.00</td>
<td class="p-md text-on-surface-variant">$27.00</td>
<td class="p-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded bg-[#059669]/10 text-[#059669] font-label-sm text-label-sm">
                                                    Completed
                                                </span>
</td>
</tr>
<tr class="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
<td class="p-md whitespace-nowrap">Oct 24, 2023</td>
<td class="p-md">
<p class="font-semibold">Alumni Gala Dinner</p>
<p class="text-[12px] text-on-surface-variant">Bob Smith</p>
</td>
<td class="p-md font-semibold">$500.00</td>
<td class="p-md text-on-surface-variant">$90.00</td>
<td class="p-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                                                    Processing
                                                </span>
</td>
</tr>
<tr class="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
<td class="p-md whitespace-nowrap">Oct 23, 2023</td>
<td class="p-md">
<p class="font-semibold">Workshop: Cloud Computing</p>
<p class="text-[12px] text-on-surface-variant">Charlie Davis</p>
</td>
<td class="p-md font-semibold">$50.00</td>
<td class="p-md text-on-surface-variant">$9.00</td>
<td class="p-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded bg-[#059669]/10 text-[#059669] font-label-sm text-label-sm">
                                                    Completed
                                                </span>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors">
<td class="p-md whitespace-nowrap">Oct 22, 2023</td>
<td class="p-md">
<p class="font-semibold">Tech Symposium 2023</p>
<p class="text-[12px] text-on-surface-variant">Diana Evans</p>
</td>
<td class="p-md font-semibold">$150.00</td>
<td class="p-md text-on-surface-variant">$27.00</td>
<td class="p-md">
<span class="inline-flex items-center gap-xs px-2 py-1 rounded bg-[#b91c1c]/10 text-[#b91c1c] font-label-sm text-label-sm">
                                                    On Hold
                                                </span>
</td>
</tr>
</tbody>
</table>
</div>
<div class="p-sm border-t border-outline-variant text-center">
<a class="font-label-sm text-label-sm text-primary hover:underline" href="#">View All Transactions</a>
</div>
</section>
</div>
<!-- Right Column: Integrations & Splits -->
<div class="space-y-gutter">
<!-- Integration Info -->
<section class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg">
<div class="flex items-center gap-sm mb-md">
<span class="material-symbols-outlined text-primary text-[28px]">account_balance</span>
<h3 class="font-title-md text-title-md text-on-surface">Payment Gateway</h3>
</div>
<div class="bg-surface-container rounded-lg p-md mb-md border border-outline-variant/50">
<div class="flex justify-between items-start mb-sm">
<div>
<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Connected Account</p>
<p class="font-body-md text-body-md font-semibold text-on-surface mt-xs">Razorpay Route</p>
</div>
<span class="inline-flex items-center gap-xs px-2 py-1 rounded bg-[#059669]/10 text-[#059669] font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> Active
                                    </span>
</div>
<div class="h-px w-full bg-outline-variant/30 my-sm"></div>
<div class="space-y-xs">
<p class="font-body-md text-body-md text-on-surface flex justify-between">
<span class="text-on-surface-variant">Bank Name:</span> <strong>State Bank</strong>
</p>
<p class="font-body-md text-body-md text-on-surface flex justify-between">
<span class="text-on-surface-variant">Acct Ending:</span> <strong>**** 4921</strong>
</p>
<p class="font-body-md text-body-md text-on-surface flex justify-between">
<span class="text-on-surface-variant">KYC Status:</span> <strong class="text-[#059669]">Verified</strong>
</p>
</div>
</div>
<button class="w-full bg-surface border border-outline-variant text-on-surface font-label-sm text-label-sm py-sm px-md rounded-lg flex justify-center items-center gap-xs hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">receipt</span>
                                Download Tax Invoices
                            </button>
</section>
<!-- Split Visualization -->
<section class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg">
<h3 class="font-title-md text-title-md text-on-surface mb-md">Typical Vendor Split</h3>
<p class="font-label-sm text-label-sm text-on-surface-variant mb-md">Based on a $100.00 Standard Ticket</p>
<div class="space-y-md">
<!-- Split Item 1 -->
<div>
<div class="flex justify-between font-body-md text-body-md mb-xs">
<span class="font-semibold text-on-surface">Organizer (Dept.)</span>
<span class="text-on-surface">$85.00</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-primary h-2 rounded-full" style="width: 85%"></div>
</div>
</div>
<!-- Split Item 2 -->
<div>
<div class="flex justify-between font-body-md text-body-md mb-xs">
<span class="font-semibold text-on-surface">Catering Vendor</span>
<span class="text-on-surface">$10.00</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-tertiary-container h-2 rounded-full" style="width: 10%"></div>
</div>
</div>
<!-- Split Item 3 -->
<div>
<div class="flex justify-between font-body-md text-body-md mb-xs">
<span class="font-semibold text-on-surface">Platform Fee</span>
<span class="text-on-surface">$5.00</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-secondary h-2 rounded-full" style="width: 5%"></div>
</div>
</div>
</div>
<div class="mt-md p-sm bg-surface-container rounded border border-outline-variant/30 flex items-start gap-sm">
<span class="material-symbols-outlined text-secondary text-[20px]">info</span>
<p class="font-label-sm text-label-sm text-on-surface-variant leading-snug">Splits are automatically routed to verified vendor accounts via Razorpay Route upon event completion.</p>
</div>
</section>
</div>
</div>
</div>
<!-- Footer Spacer -->
<div class="h-xl"></div>
</div>
</main>
</body></html>
```

---

## PAGE: pending_approval_status

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Application Under Review - Eventura</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Public Sans"],
                        "display-lg": ["Public Sans"],
                        "label-sm": ["Inter"],
                        "title-md": ["Inter"],
                        "headline-lg": ["Public Sans"]
                    },
                    "fontSize": {
                        "body-md": ["14px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400" }],
                        "body-lg": ["16px", { "lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "1.3", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "0.02em", "fontWeight": "700" }],
                        "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
                        "title-md": ["18px", { "lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "0.015em", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop">
<div class="w-full max-w-[600px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0px_4px_20px_rgba(46,49,146,0.08)] overflow-hidden">
<div class="p-xl text-center">
<div class="mb-lg flex justify-center">
<span class="material-symbols-outlined text-[64px] text-primary" style="font-variation-settings: 'FILL' 1;">
                    hourglass_top
                </span>
</div>
<h1 class="font-headline-lg text-headline-lg text-on-surface mb-sm">Application Under Review</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-md mx-auto">
                Thank you for registering [Organization Name]. Our Super Admin team is currently verifying your institutional credentials to ensure a high-trust environment.
            </p>
<div class="mb-xl text-left">
<h2 class="font-title-md text-title-md text-on-surface mb-md">Status Progress</h2>
<div class="relative">
<div class="absolute top-1/2 left-0 w-full h-1 bg-surface-variant -translate-y-1/2 rounded-full"></div>
<div class="relative flex justify-between">
<div class="flex flex-col items-center">
<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10 text-on-primary">
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="font-label-sm text-label-sm text-primary mt-sm">Email Verified</span>
</div>
<div class="absolute top-1/2 left-0 w-1/2 h-1 bg-primary -translate-y-1/2 rounded-full z-0"></div>
<div class="flex flex-col items-center">
<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10 text-on-primary">
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="font-label-sm text-label-sm text-primary mt-sm">Identity Check</span>
</div>
<div class="absolute top-1/2 left-1/2 w-1/2 h-1 bg-surface-variant -translate-y-1/2 rounded-full z-0"></div>
<div class="flex flex-col items-center">
<div class="w-8 h-8 rounded-full bg-surface-variant border-2 border-outline-variant flex items-center justify-center z-10">
<span class="w-2 h-2 rounded-full bg-outline"></span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant mt-sm text-center">Super Admin<br/>Approval</span>
</div>
</div>
</div>
</div>
<div class="flex flex-col sm:flex-row gap-md justify-center mt-xl">
<button class="bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 h-12 w-full sm:w-auto">
                    Explore as Attendee
                </button>
<button class="bg-surface-container-lowest border border-outline-variant hover:bg-surface-variant text-on-surface font-label-sm text-label-sm py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 h-12 w-full sm:w-auto">
                    Contact Support
                </button>
</div>
</div>
<div class="bg-surface-container-low border-t border-outline-variant p-md flex justify-center items-center">
<span class="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">EVENTURA</span>
</div>
</div>
</body></html>
```

---

## PAGE: persistent_event_discovery

```html
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - Discover Events</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    spacing: {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    fontFamily: {
                        "body-md": ["Inter", "sans-serif"],
                        "body-lg": ["Inter", "sans-serif"],
                        "headline-md": ["Public Sans", "sans-serif"],
                        "display-lg": ["Public Sans", "sans-serif"],
                        "label-sm": ["Inter", "sans-serif"],
                        "title-md": ["Inter", "sans-serif"],
                        "headline-lg": ["Public Sans", "sans-serif"]
                    },
                    fontSize: {
                        "body-md": ["14px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" }],
                        "body-lg": ["16px", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }],
                        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "0.01em", fontWeight: "600" }],
                        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "0.02em", fontWeight: "700" }],
                        "label-sm": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
                        "title-md": ["18px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "600" }],
                        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "0.015em", fontWeight: "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-fill {
            font-variation-settings: 'FILL' 1;
        }
    </style>
</head>
<body class="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
<nav class="bg-surface dark:bg-surface-container font-body-md text-body-md docked full-width top-0 border-b border-outline-variant dark:border-outline flat no shadows opacity-100 transition-all z-50">
<div class="flex justify-between items-center w-full px-margin-desktop h-16 max-w-[1440px] mx-auto">
<div class="flex items-center gap-gutter">
<div class="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">
                    Eventura
                </div>
<div class="relative hidden md:block w-64">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
<input class="w-full h-10 pl-10 pr-4 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant" placeholder="Search events..." type="text"/>
</div>
</div>
<div class="hidden md:flex items-center h-full gap-lg">
<a class="h-full flex items-center text-primary dark:text-primary-fixed-dim font-bold border-b-2 border-primary" href="#">Discover</a>
<a class="h-full flex items-center text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#">My Events</a>
<a class="h-full flex items-center text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#">Calendar</a>
</div>
<div class="flex items-center gap-md">
<button class="hidden lg:flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span class="font-label-sm text-label-sm mr-2">Switch to Organizer</span>
</button>
<div class="h-6 w-px bg-outline-variant hidden lg:block mx-2"></div>
<button class="text-on-surface-variant hover:text-primary transition-colors relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors hidden sm:block">
<span class="material-symbols-outlined">help_outline</span>
</button>
<button class="h-10 px-4 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:brightness-95 transition-all ml-2 shadow-sm">
                    Create Event
                </button>
<div class="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant overflow-hidden ml-2 cursor-pointer">
<img alt="User profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiKpvhU39K9RIAlmnJrVJG0HQvA_FUm_Z7J9p9FcZBsdE3vbdJTRltYi3qAVM-TC3Ke03XzxTxItEw7rJbKz2bV_zMYW0gDzLtB9e3tmWaqJJxufG-3LpffzBmvVEGD4UYqIml6NkMI3cGwer1U6Ki4fbKxl7bouCtEA6KDtV3CKphSgqs_ZLtRhfgtUUcEO2OJY14LMPHqe6mDTAT01GrPVQ8pSVFBM7XMwlOawiSE921UDzak2Sl5xDpl_6xOxEx90B0Juzj_Q"/>
</div>
</div>
</div>
</nav>
<main class="flex-1 w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col lg:flex-row gap-xl">
<aside class="w-full lg:w-[260px] flex-shrink-0 flex flex-col gap-xl border-r border-outline-variant pr-md hidden lg:flex sticky top-20 self-start">
<div><div class="flex items-center justify-between">
<h2 class="font-headline-md text-title-md text-on-surface">Filters</h2>
<button class="text-primary font-label-sm text-label-sm hover:underline py-1 px-2 hover:bg-primary/5 rounded transition-colors" id="clear-filters">
        Clear all
    </button>
</div></div>
<div class="border-t border-outline-variant pt-md">
<h3 class="font-title-md text-on-surface mb-md">College</h3>
<div class="flex flex-col gap-sm">
<label class="flex items-center gap-sm cursor-pointer group">
<input checked="" class="w-4 h-4 text-primary border-outline-variant focus:ring-primary" name="college" type="radio"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Current Institution</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant focus:ring-primary" name="college" type="radio"/>
<span class="text-on-surface group-hover:text-primary transition-colors">All Consortium</span>
</label>
</div>
</div>
<div class="border-t border-outline-variant pt-md">
<h3 class="font-title-md text-on-surface mb-md">Format</h3>
<div class="flex flex-col gap-sm">
<label class="flex items-center gap-sm cursor-pointer group">
<input checked="" class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">In-person</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Online</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Hybrid</span>
</label>
</div>
</div>
<div class="border-t border-outline-variant pt-md">
<h3 class="font-title-md text-on-surface mb-md">Category</h3>
<div class="flex flex-col gap-sm">
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Academic</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Career &amp; Alumni</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Social</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Sports &amp; Rec</span>
</label>
</div>
</div>
<div class="border-t border-outline-variant pt-md">
<h3 class="font-title-md text-on-surface mb-md">Price</h3>
<div class="flex flex-col gap-sm">
<label class="flex items-center gap-sm cursor-pointer group">
<input checked="" class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Free</span>
</label>
<label class="flex items-center gap-sm cursor-pointer group">
<input class="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" type="checkbox"/>
<span class="text-on-surface group-hover:text-primary transition-colors">Paid</span>
</label>
</div>
</div>
</aside>
<section class="flex-1 flex flex-col gap-lg min-w-0">
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-container-low p-md border border-outline-variant rounded-xl">
<div class="flex-1 w-full max-w-md relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input class="w-full h-10 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Search events by keyword..." type="text"/>
</div>
<div class="flex items-center gap-sm w-full sm:w-auto">
<span class="text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">Sort by:</span>
<select class="h-10 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none px-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23464652%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:0.65em_auto]">
<option>Relevance</option>
<option>Date: Upcoming</option>
<option>Popularity</option>
</select>
<button class="lg:hidden h-10 px-3 border border-outline-variant rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined">filter_list</span>
</button>
</div>
</div>
<div class="mb-lg flex flex-wrap items-center gap-sm">
<span class="text-on-surface-variant font-body-md">Results for:</span>
<div class="flex flex-wrap gap-xs">
<span class="inline-flex items-center gap-1 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-label-sm">
            Current Institution
            <button class="material-symbols-outlined text-[14px] hover:text-on-surface">close</button>
</span>
<span class="inline-flex items-center gap-1 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-label-sm">
            In-person
            <button class="material-symbols-outlined text-[14px] hover:text-on-surface">close</button>
</span>
<span class="inline-flex items-center gap-1 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-label-sm">
            Free
            <button class="material-symbols-outlined text-[14px] hover:text-on-surface">close</button>
</span>
</div>
</div><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
<article class="flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
<div class="relative h-48 w-full overflow-hidden">
<img alt="Auditorium" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A modern, high-tech university auditorium filled with students attending a guest lecture. The lighting is bright and even, highlighting the sleek wooden panels and comfortable tiered seating. A large projection screen displays academic charts. The scene conveys a sense of intellectual engagement and institutional prestige, adhering to a sophisticated corporate academic visual style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAagScjqCnnWXXZraFTWhcRr11YKfD2-fs1z6395yNiu74sg-febZRpililAv4Y_oYoFN1QrdancqelaAICujr3an40TtSNdhpTyMNbswQewDEikvwyjhOA1eIW0d556D6CBhYvQdteYaIj928zQcVqsrPW8i3-4wt5oK5SjzRZflfM4XzksPca6vzENWHeJjXPSP0x7otaUdz7g4rEx6PuJJkeMrgfBs9Ha8hC86PLBTlP9SJdoSIe0PeQKUKxv2azUe_uTAdLjg"/>
<div class="absolute top-sm left-sm flex flex-col gap-xs">
<span class="bg-surface-container-lowest/90 backdrop-blur text-primary border border-primary/20 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">Verified</span>
</div>
<div class="absolute bottom-sm right-sm bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded text-body-sm font-bold text-on-surface shadow-sm">
                            Free
                        </div>
</div>
<div class="p-md flex flex-col flex-1 gap-sm">
<div class="flex items-start justify-between gap-sm">
<h3 class="font-title-md text-on-surface line-clamp-2 leading-tight">Annual Symposium on Artificial Intelligence &amp; Ethics</h3>
</div>
<div class="flex flex-col gap-xs text-on-surface-variant mt-auto pt-sm">
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">calendar_today</span>
<span class="text-[13px]">Oct 24, 2024 • 9:00 AM</span>
</div>
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">location_on</span>
<span class="text-[13px] truncate">Main Auditorium, Science Building</span>
</div>
<div class="flex items-center gap-xs mt-1">
<div class="w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">CS</div>
<span class="text-[12px] font-medium">Computer Science Dept.</span>
</div>
</div>
<div class="border-t border-outline-variant pt-md mt-sm flex items-center gap-sm">
<button class="flex-1 h-10 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:brightness-95 transition-all">
                                Register
                            </button>
<button aria-label="Save event" class="h-10 w-10 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined">bookmark_border</span>
</button>
</div>
</div>
</article>
<article class="flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
<div class="relative h-48 w-full overflow-hidden">
<img alt="Students networking" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A bright, airy campus atrium with floor-to-ceiling windows letting in natural daylight. Groups of smartly dressed college students are standing around high-top tables, engaged in professional networking. The atmosphere is energetic yet formal. The color palette emphasizes clean whites, professional slate grays, and subtle accents of deep university indigo, presenting a modern institutional vibe." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3FOW2qA11hu0-Xcaes93ZXvnL9Gg3MdhBNu7Pt0TxSZvMMzTBi3fnh6DyQbNRolE6QHrlyPow6kgCAkrmOdkKynwXJSYs3uDeE2MVFkRpnkF8nVZyeEzcsFgLYoMzUtxm77nabQ5YGkejhTNlOvKlaGzUs3vF-5z1PmrMn6Obq9HCpBl3Udqh2dEOdoSez9amaVInk9KLcfkjGvJ9TVZsYqt5XQb416cw2JVV2T0g3d6sz3FMQwmnpBDqOs5sgaNIRhxe83LvtA"/>
<div class="absolute top-sm left-sm flex flex-col gap-xs">
<span class="bg-error/10 backdrop-blur text-error border border-error/20 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">Limited Seats</span>
</div>
<div class="absolute bottom-sm right-sm bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded text-body-sm font-bold text-on-surface shadow-sm">
                            $15.00
                        </div>
</div>
<div class="p-md flex flex-col flex-1 gap-sm">
<div class="flex items-start justify-between gap-sm">
<h3 class="font-title-md text-on-surface line-clamp-2 leading-tight">Alumni Networking Mixer: Finance &amp; Consulting</h3>
</div>
<div class="flex flex-col gap-xs text-on-surface-variant mt-auto pt-sm">
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">calendar_today</span>
<span class="text-[13px]">Nov 02, 2024 • 6:00 PM</span>
</div>
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">location_on</span>
<span class="text-[13px] truncate">Student Union Grand Hall</span>
</div>
<div class="flex items-center gap-xs mt-1">
<div class="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold">CS</div>
<span class="text-[12px] font-medium">Career Services</span>
</div>
</div>
<div class="border-t border-outline-variant pt-md mt-sm flex items-center gap-sm">
<button class="flex-1 h-10 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:brightness-95 transition-all">
                                Register
                            </button>
<button aria-label="Save event" class="h-10 w-10 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined">bookmark_border</span>
</button>
</div>
</div>
</article>
<article class="flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
<div class="relative h-48 w-full overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-br from-primary-container to-primary opacity-90 z-0"></div>
<div class="absolute inset-0 flex items-center justify-center z-10 text-on-primary opacity-20">
<span class="material-symbols-outlined text-[80px]">laptop_mac</span>
</div>
<div class="absolute top-sm left-sm z-20 flex flex-col gap-xs">
<span class="bg-surface-container-lowest/90 backdrop-blur text-primary border border-primary/20 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">Online</span>
</div>
<div class="absolute bottom-sm right-sm z-20 bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded text-body-sm font-bold text-on-surface shadow-sm">
                            Free
                        </div>
</div>
<div class="p-md flex flex-col flex-1 gap-sm relative z-20 bg-surface-container-lowest">
<div class="flex items-start justify-between gap-sm">
<h3 class="font-title-md text-on-surface line-clamp-2 leading-tight">Mastering Graduate School Applications Workshop</h3>
</div>
<div class="flex flex-col gap-xs text-on-surface-variant mt-auto pt-sm">
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">calendar_today</span>
<span class="text-[13px]">Nov 05, 2024 • 4:00 PM</span>
</div>
<div class="flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">videocam</span>
<span class="text-[13px] truncate">Virtual Event (Zoom)</span>
</div>
<div class="flex items-center gap-xs mt-1">
<div class="w-5 h-5 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center text-[10px] font-bold text-on-surface">AA</div>
<span class="text-[12px] font-medium">Academic Advising</span>
</div>
</div>
<div class="border-t border-outline-variant pt-md mt-sm flex items-center gap-sm">
<button class="flex-1 h-10 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:brightness-95 transition-all">
                                Register
                            </button>
<button aria-label="Save event" class="h-10 w-10 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined">bookmark_border</span>
</button>
</div>
</div>
</article>
</div>
</section>
</main>
<footer class="bg-surface-container-low dark:bg-surface-dim font-label-sm text-label-sm full-width bottom-0 border-t border-outline-variant dark:border-outline flat no shadows opacity-100 mt-auto z-10">
<div class="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-lg max-w-7xl mx-auto gap-md">
<div class="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">
                Eventura
            </div>
<div class="text-on-surface-variant dark:text-on-secondary-fixed-variant text-center md:text-left">
                © 2024 Eventura. Institutional Grade Event Management.
            </div>
<div class="flex flex-wrap justify-center gap-md">
<a class="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim underline transition-all" href="#">Terms of Service</a>
<a class="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim underline transition-all" href="#">Privacy Policy</a>
<a class="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim underline transition-all" href="#">Institutional Support</a>
<a class="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim underline transition-all" href="#">API Documentation</a>
</div>
</div>
</footer>
</body></html>
```

---

## PAGE: qr_scanner_enhanced_feedback

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Scanner View - Eventura</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    borderRadius: {
                        DEFAULT: "0.25rem",
                        lg: "0.5rem",
                        xl: "0.75rem",
                        full: "9999px"
                    },
                    spacing: {
                        sm: "8px",
                        md: "16px",
                        gutter: "24px",
                        lg: "24px",
                        xs: "4px",
                        "margin-mobile": "16px",
                        xl: "40px",
                        "margin-desktop": "48px",
                        unit: "4px"
                    },
                    fontFamily: {
                        "body-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Public Sans"],
                        "display-lg": ["Public Sans"],
                        "label-sm": ["Inter"],
                        "title-md": ["Inter"],
                        "headline-lg": ["Public Sans"]
                    },
                    fontSize: {
                        "body-md": ["14px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" }],
                        "body-lg": ["16px", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }],
                        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "0.01em", fontWeight: "600" }],
                        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "0.02em", fontWeight: "700" }],
                        "label-sm": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
                        "title-md": ["18px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "600" }],
                        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "0.015em", fontWeight: "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .scanner-frame {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
</head>
<body class="bg-black text-on-surface h-screen w-screen overflow-hidden relative flex flex-col font-body-md">
<!-- Camera Background Pattern / Image Placeholder -->
<div class="absolute inset-0 z-0 bg-gray-900 flex items-center justify-center overflow-hidden">
<img alt="Camera View" class="w-full h-full object-cover opacity-70" data-alt="A slightly blurred, high contrast background image showing a crowd at a college event or concert. The lighting is dim with some bright stage lights or colorful spots to suggest an active venue environment. This serves as the background behind the scanner interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXT9b6CRZzOP1kOpnY0wXLYARB0ko3p9T8NwZ3HIH2Z5JDaHy0tmVsGGJyuHGHYYBivn27H4DkjA-SgPbRtYvxCn0-FGk5HqR3dejT1ZnUK49zpA_I7kpclzqHwcHysO07jmRRx0tpBjgcN905Nfx7f4MFx6gbqg8BaxHgDzVcfJKWiiH_ObXYMey-HZDbG7dmK8B-jBOYy9Q36aJv3iYq3lPEyjXKmzf1Q5lZ9MK5LmYtlslO6SWmhiofC4uiBAL1wRDIXOxSUA"/>
</div>
<!-- Header Overlay -->
<header class="relative z-20 flex justify-between items-center p-md bg-gradient-to-b from-black/80 to-transparent pt-8">
<button class="w-10 h-10 rounded-full bg-surface-container-highest/30 flex items-center justify-center text-white border border-white/20">
<span class="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<h1 class="font-title-md text-title-md text-white">Spring Gala 2024</h1>
<div class="flex items-center gap-xs bg-primary/80 px-3 py-1 rounded-full mt-1 border border-primary-container">
<span class="material-symbols-outlined text-[14px] text-white" data-icon="group">group</span>
<span class="font-label-sm text-label-sm text-white">45 / 200 Scanned</span>
</div>
</div>
<button class="w-10 h-10 rounded-full bg-surface-container-highest/30 flex items-center justify-center text-white border border-white/20">
<span class="material-symbols-outlined" data-icon="flash_on">flash_on</span>
</button>
</header>
<!-- Scanner Target Area -->
<main class="flex-grow relative z-10 flex items-center justify-center">
<!-- The overlay mask -->
<div class="absolute inset-0 scanner-frame z-10 pointer-events-none"></div>
<!-- Target Box -->
<div class="relative w-64 h-64 z-20">
<!-- Corners -->
<div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
<div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
<div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
<div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
<!-- Scanning Line Animation Simulation -->
<div class="absolute top-1/2 left-0 w-full h-[2px] bg-primary shadow-[0_0_8px_rgba(21,21,125,0.8)] opacity-80"></div>
<div class="absolute -bottom-10 left-0 w-full text-center">
<span class="font-label-sm text-label-sm text-white bg-black/50 px-3 py-1 rounded-full">Align QR Code within frame</span>
</div>
</div><div class="absolute inset-0 z-30 bg-emerald-500/90 flex flex-col items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300" id="success-overlay">
<div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-md">
<span class="material-symbols-outlined text-[64px] text-emerald-600">check_circle</span>
</div>
<h2 class="font-headline-md text-headline-md text-white mb-sm">Valid Ticket</h2>
<p class="font-body-lg text-body-lg text-white/90">Sarah Jenkins - VIP Access</p>
</div><div class="absolute inset-0 z-30 bg-error/90 flex flex-col items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300" id="error-overlay">
<div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-md">
<span class="material-symbols-outlined text-[64px] text-error">cancel</span>
</div>
<h2 class="font-headline-md text-headline-md text-white mb-sm">Invalid Ticket</h2>
<p class="font-body-lg text-body-lg text-white/90">Duplicate or Expired</p>
</div>
<!-- Hidden Status Overlays (Mocked in DOM for visual reference if needed by user, but default hidden/opacity-0 to show clean UI first) -->
<!-- Success Overlay Example (Uncomment or add opacity to see) -->
<!--
        <div class="absolute inset-0 z-30 bg-emerald-500/90 flex flex-col items-center justify-center">
            <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-md">
                <span class="material-symbols-outlined text-[64px] text-emerald-600" data-icon="check_circle">check_circle</span>
            </div>
            <h2 class="font-headline-md text-headline-md text-white mb-sm">Valid Ticket</h2>
            <p class="font-body-lg text-body-lg text-white/90">Sarah Jenkins - VIP Access</p>
        </div>
        -->
</main>
<!-- Footer Controls -->
<footer class="relative z-20 p-md pb-8 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-md items-center w-full">
<div class="flex gap-gutter justify-center w-full max-w-[300px] mb-sm">
<button class="flex flex-col items-center gap-xs text-white/70 hover:text-white transition-colors">
<div class="w-12 h-12 rounded-full bg-surface-container-highest/20 flex items-center justify-center border border-white/10">
<span class="material-symbols-outlined" data-icon="flip_camera_ios">flip_camera_ios</span>
</div>
<span class="font-label-sm text-label-sm">Flip</span>
</button>
<button class="flex flex-col items-center gap-xs text-white/70 hover:text-white transition-colors">
<div class="w-12 h-12 rounded-full bg-surface-container-highest/20 flex items-center justify-center border border-white/10">
<span class="material-symbols-outlined" data-icon="history">history</span>
</div>
<span class="font-label-sm text-label-sm">History</span>
</button>
</div>
<button class="w-full max-w-sm h-14 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-sm font-title-md text-title-md shadow-lg border-2 border-primary-container">
<span class="material-symbols-outlined">search</span>
    Manual Search
</button>
</footer>
</body></html>
```

---

## PAGE: qr_scanner_view

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Scanner View - Eventura</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    borderRadius: {
                        DEFAULT: "0.25rem",
                        lg: "0.5rem",
                        xl: "0.75rem",
                        full: "9999px"
                    },
                    spacing: {
                        sm: "8px",
                        md: "16px",
                        gutter: "24px",
                        lg: "24px",
                        xs: "4px",
                        "margin-mobile": "16px",
                        xl: "40px",
                        "margin-desktop": "48px",
                        unit: "4px"
                    },
                    fontFamily: {
                        "body-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Public Sans"],
                        "display-lg": ["Public Sans"],
                        "label-sm": ["Inter"],
                        "title-md": ["Inter"],
                        "headline-lg": ["Public Sans"]
                    },
                    fontSize: {
                        "body-md": ["14px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" }],
                        "body-lg": ["16px", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }],
                        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "0.01em", fontWeight: "600" }],
                        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "0.02em", fontWeight: "700" }],
                        "label-sm": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
                        "title-md": ["18px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "600" }],
                        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "0.015em", fontWeight: "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .scanner-frame {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-black text-on-surface h-screen w-screen overflow-hidden relative flex flex-col font-body-md">
<!-- Camera Background Pattern / Image Placeholder -->
<div class="absolute inset-0 z-0 bg-gray-900 flex items-center justify-center overflow-hidden">
<img alt="Camera View" class="w-full h-full object-cover opacity-70" data-alt="A slightly blurred, high contrast background image showing a crowd at a college event or concert. The lighting is dim with some bright stage lights or colorful spots to suggest an active venue environment. This serves as the background behind the scanner interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXT9b6CRZzOP1kOpnY0wXLYARB0ko3p9T8NwZ3HIH2Z5JDaHy0tmVsGGJyuHGHYYBivn27H4DkjA-SgPbRtYvxCn0-FGk5HqR3dejT1ZnUK49zpA_I7kpclzqHwcHysO07jmRRx0tpBjgcN905Nfx7f4MFx6gbqg8BaxHgDzVcfJKWiiH_ObXYMey-HZDbG7dmK8B-jBOYy9Q36aJv3iYq3lPEyjXKmzf1Q5lZ9MK5LmYtlslO6SWmhiofC4uiBAL1wRDIXOxSUA"/>
</div>
<!-- Header Overlay -->
<header class="relative z-20 flex justify-between items-center p-md bg-gradient-to-b from-black/80 to-transparent pt-8">
<button class="w-10 h-10 rounded-full bg-surface-container-highest/30 flex items-center justify-center text-white border border-white/20">
<span class="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<h1 class="font-title-md text-title-md text-white">Spring Gala 2024</h1>
<div class="flex items-center gap-xs bg-primary/80 px-3 py-1 rounded-full mt-1 border border-primary-container">
<span class="material-symbols-outlined text-[14px] text-white" data-icon="group">group</span>
<span class="font-label-sm text-label-sm text-white">45 / 200 Scanned</span>
</div>
</div>
<button class="w-10 h-10 rounded-full bg-surface-container-highest/30 flex items-center justify-center text-white border border-white/20">
<span class="material-symbols-outlined" data-icon="flash_on">flash_on</span>
</button>
</header>
<!-- Scanner Target Area -->
<main class="flex-grow relative z-10 flex items-center justify-center">
<!-- The overlay mask -->
<div class="absolute inset-0 scanner-frame z-10 pointer-events-none"></div>
<!-- Target Box -->
<div class="relative w-64 h-64 z-20">
<!-- Corners -->
<div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
<div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
<div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
<div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
<!-- Scanning Line Animation Simulation -->
<div class="absolute top-1/2 left-0 w-full h-[2px] bg-primary shadow-[0_0_8px_rgba(21,21,125,0.8)] opacity-80"></div>
<div class="absolute -bottom-10 left-0 w-full text-center">
<span class="font-label-sm text-label-sm text-white bg-black/50 px-3 py-1 rounded-full">Align QR Code within frame</span>
</div>
</div>
<!-- Hidden Status Overlays (Mocked in DOM for visual reference if needed by user, but default hidden/opacity-0 to show clean UI first) -->
<!-- Success Overlay Example (Uncomment or add opacity to see) -->
<!--
        <div class="absolute inset-0 z-30 bg-emerald-500/90 flex flex-col items-center justify-center">
            <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-md">
                <span class="material-symbols-outlined text-[64px] text-emerald-600" data-icon="check_circle">check_circle</span>
            </div>
            <h2 class="font-headline-md text-headline-md text-white mb-sm">Valid Ticket</h2>
            <p class="font-body-lg text-body-lg text-white/90">Sarah Jenkins - VIP Access</p>
        </div>
        -->
</main>
<!-- Footer Controls -->
<footer class="relative z-20 p-md pb-8 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-md items-center w-full">
<div class="flex gap-gutter justify-center w-full max-w-[300px] mb-sm">
<button class="flex flex-col items-center gap-xs text-white/70 hover:text-white transition-colors">
<div class="w-12 h-12 rounded-full bg-surface-container-highest/20 flex items-center justify-center border border-white/10">
<span class="material-symbols-outlined" data-icon="flip_camera_ios">flip_camera_ios</span>
</div>
<span class="font-label-sm text-label-sm">Flip</span>
</button>
<button class="flex flex-col items-center gap-xs text-white/70 hover:text-white transition-colors">
<div class="w-12 h-12 rounded-full bg-surface-container-highest/20 flex items-center justify-center border border-white/10">
<span class="material-symbols-outlined" data-icon="history">history</span>
</div>
<span class="font-label-sm text-label-sm">History</span>
</button>
</div>
<button class="w-full max-w-sm h-12 bg-white rounded-lg flex items-center justify-center gap-sm text-primary font-title-md text-title-md shadow-sm border border-slate-200">
<span class="material-symbols-outlined" data-icon="search">search</span>
            Manual Search
        </button>
</footer>
</body></html>
```

---

## PAGE: role_selection

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura - Role Selection</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter", "sans-serif"],
                        "body-lg": ["Inter", "sans-serif"],
                        "headline-md": ["Public Sans", "sans-serif"],
                        "display-lg": ["Public Sans", "sans-serif"],
                        "label-sm": ["Inter", "sans-serif"],
                        "title-md": ["Inter", "sans-serif"],
                        "headline-lg": ["Public Sans", "sans-serif"]
                    },
                    "fontSize": {
                        "body-md": ["14px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400"}],
                        "body-lg": ["16px", {"lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "0.01em", "fontWeight": "600"}],
                        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "0.02em", "fontWeight": "700"}],
                        "label-sm": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600"}],
                        "title-md": ["18px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "600"}],
                        "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "0.015em", "fontWeight": "600"}]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined.filled {
            font-variation-settings: 'FILL' 1;
        }
    </style>
</head>
<body class="bg-surface text-on-surface min-h-screen flex flex-col font-body-md selection:bg-primary-container selection:text-on-primary-container">
<!-- Main Canvas -->
<main class="flex-grow flex items-center justify-center py-xl px-margin-mobile md:px-margin-desktop">
<div class="max-w-7xl w-full mx-auto flex flex-col items-center">
<!-- Branding Header -->
<div class="mb-xl flex flex-col items-center text-center w-full max-w-3xl">
<!-- Using a stylized text representation as placeholder for the logo to maintain high-end feel -->
<div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-md shadow-sm">
<span class="material-symbols-outlined text-on-primary text-[32px] filled">local_activity</span>
</div>
<h1 class="font-display-lg text-display-lg text-primary mb-sm tracking-tight">Choose Your Path on Eventura</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
                    Select how you will be using the platform today. Don't worry, you can always adjust your primary role later in your account settings.
                </p>
</div>
<!-- Role Selection Grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full max-w-5xl">
<!-- Card 1: Attendee -->
<button class="group relative bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center text-center transition-all duration-300 hover:border-primary hover:shadow-[0px_4px_20px_rgba(46,49,146,0.08)] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
<div class="w-16 h-16 rounded-full bg-secondary-container text-primary flex items-center justify-center mb-md transition-colors group-hover:bg-primary group-hover:text-on-primary">
<span class="material-symbols-outlined text-[32px]">local_activity</span>
</div>
<h2 class="font-headline-md text-headline-md text-on-surface mb-sm">Attendee</h2>
<p class="font-body-md text-body-md text-on-surface-variant flex-grow mb-lg">
                        I want to explore campus events, register for activities, earn attendance credits, and download certificates.
                    </p>
<div class="w-full bg-surface-container-high text-on-surface py-3 px-4 rounded-lg font-label-sm text-label-sm transition-colors group-hover:bg-primary group-hover:text-on-primary border border-outline-variant group-hover:border-primary">
                        Select Attendee
                    </div>
</button>
<!-- Card 2: Club President -->
<button class="group relative bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center text-center transition-all duration-300 hover:border-primary hover:shadow-[0px_4px_20px_rgba(46,49,146,0.08)] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
<div class="w-16 h-16 rounded-full bg-secondary-container text-primary flex items-center justify-center mb-md transition-colors group-hover:bg-primary group-hover:text-on-primary">
<span class="material-symbols-outlined text-[32px]">diversity_3</span>
</div>
<h2 class="font-headline-md text-headline-md text-on-surface mb-sm">Club President</h2>
<p class="font-body-md text-body-md text-on-surface-variant flex-grow mb-lg">
                        I want to create and manage events for my student organization, track attendance, and securely collect ticketing payments.
                    </p>
<div class="w-full bg-surface-container-high text-on-surface py-3 px-4 rounded-lg font-label-sm text-label-sm transition-colors group-hover:bg-primary group-hover:text-on-primary border border-outline-variant group-hover:border-primary">
                        Select Organizer
                    </div>
</button>
<!-- Card 3: College Admin -->
<button class="group relative bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center text-center transition-all duration-300 hover:border-primary hover:shadow-[0px_4px_20px_rgba(46,49,146,0.08)] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
<div class="w-16 h-16 rounded-full bg-secondary-container text-primary flex items-center justify-center mb-md transition-colors group-hover:bg-primary group-hover:text-on-primary">
<span class="material-symbols-outlined text-[32px]">account_balance</span>
</div>
<h2 class="font-headline-md text-headline-md text-on-surface mb-sm">College Admin</h2>
<p class="font-body-md text-body-md text-on-surface-variant flex-grow mb-lg">
                        I want to manage institutional branding, verify student clubs, and oversee all campus-wide events and administrative compliance.
                    </p>
<div class="w-full bg-surface-container-high text-on-surface py-3 px-4 rounded-lg font-label-sm text-label-sm transition-colors group-hover:bg-primary group-hover:text-on-primary border border-outline-variant group-hover:border-primary">
                        Select Administrator
                    </div>
</button>
</div>
<!-- Auxiliary Action -->
<div class="mt-xl text-center">
<p class="font-body-sm text-body-sm text-on-surface-variant">
                    Already have an account? 
                    <a class="font-label-sm text-label-sm text-primary hover:underline ml-xs" href="#">Log in here</a>
</p>
</div>
</div>
</main>
</body></html>
```

---

## PAGE: super_admin_dashboard

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura Super Admin Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Public Sans"],
                        "display-lg": ["Public Sans"],
                        "label-sm": ["Inter"],
                        "title-md": ["Inter"],
                        "headline-lg": ["Public Sans"]
                    },
                    "fontSize": {
                        "body-md": ["14px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400"}],
                        "body-lg": ["16px", {"lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "0.01em", "fontWeight": "600"}],
                        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "0.02em", "fontWeight": "700"}],
                        "label-sm": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600"}],
                        "title-md": ["18px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "600"}],
                        "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "0.015em", "fontWeight": "600"}]
                    }
                }
            }
        }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; background-color: #fcf8ff; color: #1b1b21; }
        .font-headline { font-family: 'Public Sans', sans-serif; }
    </style>
</head>
<body class="flex h-screen bg-background overflow-hidden antialiased">
<!-- SideNavBar -->
<aside class="flex flex-col h-full border-r border-outline-variant bg-primary text-on-primary w-64 shadow-sm z-20 flex-shrink-0">
<!-- Header -->
<div class="p-lg border-b border-primary-container">
<div class="flex items-center gap-md">
<div class="w-10 h-10 rounded-lg bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
<img alt="Eventura Admin Logo" class="w-full h-full object-cover" data-alt="A clean, abstract logo graphic suitable for a corporate enterprise software application. Deep indigo and slate colors, sharp geometric lines, white background, professional and authoritative mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL4Isv8pgUsJWg9xDOg2qV6_dB_T4Ma3e-FUHuWuWssTLNg5kSjV5a2EL-7hykPoiAiSLI7Leikvj6YYx2vSlOffweYM5QYviWtjDafmDPYkHB2ZoPffLhllN8yfeJP7HvES0V7YlgeWntg_jK5eyXiN4DAZoPkaNN-y4kwUfhz0tIKXMNNYCQjd69sKpyeNr5-uwm2i-vqz_-4V_Xp592q22PJbORViPTwrXLbET5TDMlW6OIP_bDw0q-6D_Xy41g4o8kwnCGLQ"/>
</div>
<div>
<h1 class="font-headline-sm text-headline-sm font-bold text-on-primary tracking-tight">Eventura Admin</h1>
<p class="font-label-sm text-label-sm text-primary-fixed-dim mt-xs">Super Admin Portal</p>
</div>
</div>
</div>
<!-- Navigation -->
<nav class="flex-1 py-md overflow-y-auto font-body-md text-body-md">
<ul class="space-y-xs">
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg transition-transform scale-95 origin-left" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
                        Dashboard
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">domain</span>
                        Institutions
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">group</span>
                        Clubs &amp; Orgs
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">event</span>
                        Platform Events
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">payments</span>
                        Financials
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">security</span>
                        Audit Logs
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">settings</span>
                        Settings
                    </a>
</li>
</ul>
</nav>
<!-- Footer Actions -->
<div class="p-md border-t border-primary-container">
<ul class="space-y-xs font-body-md text-body-md">
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">contact_support</span>
                        Support
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">logout</span>
                        Logout
                    </a>
</li>
</ul>
</div>
</aside>
<!-- Main Content Canvas -->
<main class="flex-1 flex flex-col h-full overflow-hidden bg-background">
<!-- Top App Bar (Contextual for Super Admin) -->
<header class="h-16 flex justify-between items-center px-margin-desktop border-b border-outline-variant bg-surface flex-shrink-0">
<div class="flex items-center gap-md">
<h2 class="font-headline-md text-headline-md font-bold text-on-surface">Global Command Center</h2>
<span class="px-2 py-1 bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm rounded ml-md flex items-center gap-xs">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span> System Operational
                </span>
</div>
<div class="flex items-center gap-gutter">
<div class="relative">
<span class="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</div>
<div class="flex items-center gap-sm">
<div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-label-sm text-label-sm">
                        SA
                    </div>
</div>
</div>
</header>
<!-- Scrollable Dashboard Content -->
<div class="flex-1 overflow-y-auto p-margin-desktop space-y-xl">
<!-- Global Ecosystem Health KPIs -->
<section>
<h3 class="font-title-md text-title-md text-on-surface mb-lg flex items-center gap-sm">
<span class="material-symbols-outlined text-primary">monitoring</span>
                    Global Ecosystem Health
                </h3>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
<!-- KPI Card 1 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
<div class="flex justify-between items-start">
<span class="font-body-md text-body-md text-on-surface-variant">Total Institutions</span>
<span class="material-symbols-outlined text-secondary">domain</span>
</div>
<div class="flex items-end gap-sm">
<span class="font-display-lg text-display-lg text-on-surface">142</span>
<span class="font-label-sm text-label-sm text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mb-1 flex items-center">
<span class="material-symbols-outlined text-[14px]">arrow_upward</span> 12%
                            </span>
</div>
</div>
<!-- KPI Card 2 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
<div class="flex justify-between items-start">
<span class="font-body-md text-body-md text-on-surface-variant">Active Clubs</span>
<span class="material-symbols-outlined text-secondary">groups</span>
</div>
<div class="flex items-end gap-sm">
<span class="font-display-lg text-display-lg text-on-surface">3,845</span>
<span class="font-label-sm text-label-sm text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mb-1 flex items-center">
<span class="material-symbols-outlined text-[14px]">arrow_upward</span> 5%
                            </span>
</div>
</div>
<!-- KPI Card 3 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
<div class="flex justify-between items-start">
<span class="font-body-md text-body-md text-on-surface-variant">Platform Revenue (YTD)</span>
<span class="material-symbols-outlined text-secondary">payments</span>
</div>
<div class="flex items-end gap-sm">
<span class="font-display-lg text-display-lg text-on-surface">$1.2M</span>
<span class="font-label-sm text-label-sm text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mb-1 flex items-center">
<span class="material-symbols-outlined text-[14px]">arrow_upward</span> 22%
                            </span>
</div>
</div>
<!-- KPI Card 4 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
<div class="flex justify-between items-start">
<span class="font-body-md text-body-md text-on-surface-variant">Total Users</span>
<span class="material-symbols-outlined text-secondary">person</span>
</div>
<div class="flex items-end gap-sm">
<span class="font-display-lg text-display-lg text-on-surface">850k</span>
<span class="font-label-sm text-label-sm text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mb-1 flex items-center">
<span class="material-symbols-outlined text-[14px]">arrow_upward</span> 8%
                            </span>
</div>
</div>
</div>
</section>
<!-- Complex Bento Grid Section -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
<!-- Chart Area (Spans 2 columns) -->
<section class="lg:col-span-2 bg-surface border border-outline-variant rounded-xl p-lg flex flex-col">
<div class="flex justify-between items-center mb-lg border-b border-surface-container-high pb-md">
<h3 class="font-title-md text-title-md text-on-surface">Platform Revenue &amp; GMV</h3>
<div class="flex gap-sm">
<button class="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-label-sm border border-outline-variant hover:bg-surface-variant transition-colors">1M</button>
<button class="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-label-sm border border-outline-variant hover:bg-surface-variant transition-colors">6M</button>
<button class="px-3 py-1 bg-primary text-on-primary rounded font-label-sm text-label-sm">YTD</button>
</div>
</div>
<!-- Faux Chart Container -->
<div class="flex-1 relative min-h-[300px] w-full bg-surface-container-lowest rounded border border-surface-container-high p-md flex items-end justify-between overflow-hidden group">
<!-- Simulated Grid Lines -->
<div class="absolute inset-0 flex flex-col justify-between pointer-events-none p-md opacity-20">
<div class="w-full h-px bg-outline-variant"></div>
<div class="w-full h-px bg-outline-variant"></div>
<div class="w-full h-px bg-outline-variant"></div>
<div class="w-full h-px bg-outline-variant"></div>
<div class="w-full h-px bg-outline-variant"></div>
</div>
<!-- Simulated Bars / Line Data Points -->
<div class="w-12 h-[30%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
<div class="w-12 h-[45%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
<div class="w-12 h-[40%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
<div class="w-12 h-[60%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
<div class="w-12 h-[80%] bg-primary rounded-t relative z-10 opacity-90 shadow-[0_0_15px_rgba(46,49,146,0.2)]"></div>
<div class="w-12 h-[75%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
<div class="w-12 h-[90%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
</div>
<div class="flex justify-between text-on-surface-variant font-label-sm text-label-sm mt-sm px-md">
<span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
</div>
</section>
<!-- Actionable List (Spans 1 column) -->
<section class="bg-surface border border-outline-variant rounded-xl flex flex-col h-full">
<div class="p-lg border-b border-surface-container-high">
<h3 class="font-title-md text-title-md text-on-surface flex items-center gap-sm">
<span class="material-symbols-outlined text-tertiary-container">pending_actions</span>
                            Pending Approvals
                        </h3>
</div>
<div class="flex-1 overflow-y-auto p-0">
<ul class="divide-y divide-surface-container-high">
<li class="p-md hover:bg-surface-container-lowest transition-colors cursor-pointer">
<div class="flex justify-between items-start">
<div>
<p class="font-body-md text-body-md font-semibold text-on-surface">University of Michigan</p>
<p class="font-label-sm text-label-sm text-on-surface-variant mt-xs">New College Registration</p>
</div>
<span class="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded font-label-sm text-label-sm border border-tertiary-container/20">Review</span>
</div>
</li>
<li class="p-md hover:bg-surface-container-lowest transition-colors cursor-pointer">
<div class="flex justify-between items-start">
<div>
<p class="font-body-md text-body-md font-semibold text-on-surface">Stanford Debate Society</p>
<p class="font-label-sm text-label-sm text-on-surface-variant mt-xs">Premium Tier Upgrade</p>
</div>
<span class="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded font-label-sm text-label-sm border border-tertiary-container/20">Review</span>
</div>
</li>
<li class="p-md hover:bg-surface-container-lowest transition-colors cursor-pointer">
<div class="flex justify-between items-start">
<div>
<p class="font-body-md text-body-md font-semibold text-on-surface">NYU Tech Club</p>
<p class="font-label-sm text-label-sm text-on-surface-variant mt-xs">API Access Request</p>
</div>
<span class="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded font-label-sm text-label-sm border border-tertiary-container/20">Review</span>
</div>
</li>
<li class="p-md hover:bg-surface-container-lowest transition-colors cursor-pointer">
<div class="flex justify-between items-start">
<div>
<p class="font-body-md text-body-md font-semibold text-on-surface">Texas A&amp;M Engineering</p>
<p class="font-label-sm text-label-sm text-on-surface-variant mt-xs">Payment Gateway Config</p>
</div>
<span class="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded font-label-sm text-label-sm border border-tertiary-container/20">Review</span>
</div>
</li>
</ul>
</div>
<div class="p-md border-t border-surface-container-high bg-surface-container-lowest rounded-b-xl">
<button class="w-full text-center font-label-sm text-label-sm text-primary hover:underline">View All Requests (12)</button>
</div>
</section>
</div>
<!-- Recent Platform Activity Audit Log -->
<section class="bg-surface border border-outline-variant rounded-xl p-lg">
<div class="flex justify-between items-center mb-md border-b border-surface-container-high pb-md">
<h3 class="font-title-md text-title-md text-on-surface flex items-center gap-sm">
<span class="material-symbols-outlined text-secondary">history</span>
                        Recent Platform Activity
                    </h3>
<button class="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[16px]">filter_list</span> Filter Logs
                    </button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="font-label-sm text-label-sm text-on-surface-variant border-b border-outline-variant">
<th class="py-sm font-semibold">Timestamp</th>
<th class="py-sm font-semibold">Action Event</th>
<th class="py-sm font-semibold">Actor</th>
<th class="py-sm font-semibold">Severity/Status</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md text-on-surface divide-y divide-surface-container-high">
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md text-on-surface-variant whitespace-nowrap">Today, 14:32 PST</td>
<td class="py-md font-medium">New University Onboarded: UC Berkeley</td>
<td class="py-md">System Auto-Provision</td>
<td class="py-md">
<span class="bg-surface-container text-on-surface-variant px-2 py-1 rounded text-xs border border-outline-variant">INFO</span>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md text-on-surface-variant whitespace-nowrap">Today, 11:15 PST</td>
<td class="py-md font-medium">Security Audit Completed (Monthly)</td>
<td class="py-md">Admin: J. Doe</td>
<td class="py-md">
<span class="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs border border-emerald-200">SUCCESS</span>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md text-on-surface-variant whitespace-nowrap">Today, 09:45 PST</td>
<td class="py-md font-medium">Global Feature Flag Toggled: 'New Ticketing UI'</td>
<td class="py-md">Admin: S. Smith</td>
<td class="py-md">
<span class="bg-surface-container text-on-surface-variant px-2 py-1 rounded text-xs border border-outline-variant">INFO</span>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md text-on-surface-variant whitespace-nowrap">Yesterday, 18:20 PST</td>
<td class="py-md font-medium">Payment Gateway Sync Failure detected</td>
<td class="py-md">System Monitor</td>
<td class="py-md">
<span class="bg-error-container text-on-error-container px-2 py-1 rounded text-xs border border-error/20">WARNING</span>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
</main>
</body></html>
```

---

## PAGE: super_admin_multi_tenant_health_dashboard

```html
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Eventura Super Admin Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Public+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#c7c5d4",
                        "on-tertiary-fixed-variant": "#574500",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-tint": "#4f54b4",
                        "on-primary-container": "#9da1ff",
                        "on-secondary-container": "#57657a",
                        "inverse-primary": "#c0c1ff",
                        "surface-container-high": "#eae7f0",
                        "on-primary-fixed-variant": "#373a9b",
                        "primary-container": "#2e3192",
                        "surface": "#fcf8ff",
                        "on-secondary-fixed": "#0d1c2e",
                        "on-primary-fixed": "#04006d",
                        "surface-bright": "#fcf8ff",
                        "secondary": "#515f74",
                        "primary": "#15157d",
                        "surface-variant": "#e4e1ea",
                        "tertiary": "#735c00",
                        "secondary-container": "#d5e3fc",
                        "on-background": "#1b1b21",
                        "background": "#fcf8ff",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#e9c349",
                        "tertiary-fixed": "#ffe088",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed": "#d5e3fc",
                        "inverse-on-surface": "#f2eff8",
                        "on-secondary": "#ffffff",
                        "on-surface": "#1b1b21",
                        "surface-dim": "#dbd9e1",
                        "on-tertiary-fixed": "#241a00",
                        "surface-container-highest": "#e4e1ea",
                        "on-surface-variant": "#464652",
                        "on-error-container": "#93000a",
                        "secondary-fixed-dim": "#b9c7df",
                        "on-error": "#ffffff",
                        "surface-container": "#f0ecf5",
                        "inverse-surface": "#303036",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#e1e0ff",
                        "on-primary": "#ffffff",
                        "outline": "#777683",
                        "tertiary-container": "#cca730",
                        "surface-container-low": "#f5f2fb",
                        "on-tertiary-container": "#4f3d00",
                        "on-secondary-fixed-variant": "#3a485b"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "xl": "40px",
                        "margin-desktop": "48px",
                        "unit": "4px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-md": ["Public Sans"],
                        "display-lg": ["Public Sans"],
                        "label-sm": ["Inter"],
                        "title-md": ["Inter"],
                        "headline-lg": ["Public Sans"]
                    },
                    "fontSize": {
                        "body-md": ["14px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400"}],
                        "body-lg": ["16px", {"lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "0.01em", "fontWeight": "600"}],
                        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "0.02em", "fontWeight": "700"}],
                        "label-sm": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600"}],
                        "title-md": ["18px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "600"}],
                        "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "0.015em", "fontWeight": "600"}]
                    }
                }
            }
        }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; background-color: #fcf8ff; color: #1b1b21; }
        .font-headline { font-family: 'Public Sans', sans-serif; }
    </style>
</head>
<body class="flex h-screen bg-background overflow-hidden antialiased">
<!-- SideNavBar -->
<aside class="flex flex-col h-full border-r border-outline-variant bg-primary text-on-primary w-64 shadow-sm z-20 flex-shrink-0">
<!-- Header -->
<div class="p-lg border-b border-primary-container">
<div class="flex items-center gap-md">
<div class="w-10 h-10 rounded-lg bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
<img alt="Eventura Admin Logo" class="w-full h-full object-cover" data-alt="A clean, abstract logo graphic suitable for a corporate enterprise software application. Deep indigo and slate colors, sharp geometric lines, white background, professional and authoritative mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL4Isv8pgUsJWg9xDOg2qV6_dB_T4Ma3e-FUHuWuWssTLNg5kSjV5a2EL-7hykPoiAiSLI7Leikvj6YYx2vSlOffweYM5QYviWtjDafmDPYkHB2ZoPffLhllN8yfeJP7HvES0V7YlgeWntg_jK5eyXiN4DAZoPkaNN-y4kwUfhz0tIKXMNNYCQjd69sKpyeNr5-uwm2i-vqz_-4V_Xp592q22PJbORViPTwrXLbET5TDMlW6OIP_bDw0q-6D_Xy41g4o8kwnCGLQ"/>
</div>
<div>
<h1 class="font-headline-sm text-headline-sm font-bold text-on-primary tracking-tight">Eventura Admin</h1>
<p class="font-label-sm text-label-sm text-primary-fixed-dim mt-xs">Super Admin Portal</p>
</div>
</div>
</div>
<!-- Navigation -->
<nav class="flex-1 py-md overflow-y-auto font-body-md text-body-md">
<ul class="space-y-xs">
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg transition-transform scale-95 origin-left" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
                        Dashboard
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">domain</span>
                        Institutions
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">group</span>
                        Clubs &amp; Orgs
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">event</span>
                        Platform Events
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">payments</span>
                        Financials
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">security</span>
                        Audit Logs
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">settings</span>
                        Settings
                    </a>
</li>
</ul>
</nav>
<!-- Footer Actions -->
<div class="p-md border-t border-primary-container">
<ul class="space-y-xs font-body-md text-body-md">
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">contact_support</span>
                        Support
                    </a>
</li>
<li>
<a class="flex items-center gap-md mx-2 my-1 px-4 py-3 text-primary-fixed-dim hover:bg-primary-container/20 transition-colors rounded-lg" href="#">
<span class="material-symbols-outlined">logout</span>
                        Logout
                    </a>
</li>
</ul>
</div>
</aside>
<!-- Main Content Canvas -->
<main class="flex-1 flex flex-col h-full overflow-hidden bg-background">
<!-- Top App Bar (Contextual for Super Admin) -->
<header class="h-16 flex justify-between items-center px-margin-desktop border-b border-outline-variant bg-surface flex-shrink-0">
<div class="flex items-center gap-md">
<h2 class="font-headline-md text-headline-md font-bold text-on-surface">Global Command Center</h2>
<span class="px-2 py-1 bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm rounded ml-md flex items-center gap-xs">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span> System Operational
                </span>
</div>
<div class="flex items-center gap-gutter">
<div class="relative">
<span class="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</div>
<div class="flex items-center gap-sm">
<div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-label-sm text-label-sm">
                        SA
                    </div>
</div>
</div>
</header>
<!-- Scrollable Dashboard Content -->
<div class="flex-1 overflow-y-auto p-margin-desktop space-y-xl">
<!-- Global Ecosystem Health KPIs -->
<section>
<h3 class="font-title-md text-title-md text-on-surface mb-lg flex items-center gap-sm">
<span class="material-symbols-outlined text-primary">monitoring</span>
                    Global Ecosystem Health
                </h3>
<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-gutter">
<!-- KPI Card 1 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
<div class="flex justify-between items-start">
<span class="font-body-md text-body-md text-on-surface-variant">Total Institutions</span>
<span class="material-symbols-outlined text-secondary">domain</span>
</div>
<div class="flex items-end gap-sm">
<span class="font-display-lg text-display-lg text-on-surface">142</span>
<span class="font-label-sm text-label-sm text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mb-1 flex items-center">
<span class="material-symbols-outlined text-[14px]">arrow_upward</span> 12%
                            </span>
</div>
</div>
<!-- KPI Card 2 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
<div class="flex justify-between items-start">
<span class="font-body-md text-body-md text-on-surface-variant">Active Clubs</span>
<span class="material-symbols-outlined text-secondary">groups</span>
</div>
<div class="flex items-end gap-sm">
<span class="font-display-lg text-display-lg text-on-surface">3,845</span>
<span class="font-label-sm text-label-sm text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mb-1 flex items-center">
<span class="material-symbols-outlined text-[14px]">arrow_upward</span> 5%
                            </span>
</div>
</div>
<!-- KPI Card 3 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
<div class="flex justify-between items-start">
<span class="font-body-md text-body-md text-on-surface-variant">Platform Revenue (YTD)</span>
<span class="material-symbols-outlined text-secondary">payments</span>
</div>
<div class="flex items-end gap-sm">
<span class="font-display-lg text-display-lg text-on-surface">$1.2M</span>
<span class="font-label-sm text-label-sm text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mb-1 flex items-center">
<span class="material-symbols-outlined text-[14px]">arrow_upward</span> 22%
                            </span>
</div>
</div>
<!-- KPI Card 4 -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
<div class="flex justify-between items-start">
<span class="font-body-md text-body-md text-on-surface-variant">Total Users</span>
<span class="material-symbols-outlined text-secondary">person</span>
</div>
<div class="flex items-end gap-sm">
<span class="font-display-lg text-display-lg text-on-surface">850k</span>
<span class="font-label-sm text-label-sm text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mb-1 flex items-center">
<span class="material-symbols-outlined text-[14px]">arrow_upward</span> 8%
                            </span>
</div>
</div>
<!-- KPI Card 5 (New Tenant Status) -->
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
<div class="flex justify-between items-start">
<span class="font-body-md text-body-md text-on-surface-variant">Tenant Status</span>
<span class="material-symbols-outlined text-secondary">admin_panel_settings</span>
</div>
<div class="flex flex-col gap-xs mt-auto">
<div class="flex justify-between items-center w-full">
<span class="font-label-sm text-label-sm text-on-surface-variant">Active</span>
<span class="font-title-md text-title-md text-emerald-600">138</span>
</div>
<div class="flex justify-between items-center w-full">
<span class="font-label-sm text-label-sm text-on-surface-variant">Suspended</span>
<span class="font-title-md text-title-md text-error">4</span>
</div>
</div>
</div>
</div>
</section>
<!-- Multi-Tenant Health Section -->
<section>
<h3 class="font-title-md text-title-md text-on-surface mb-lg flex items-center gap-sm">
<span class="material-symbols-outlined text-primary">health_and_safety</span>
                    Multi-Tenant Health
                </h3>
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md hover:shadow-sm transition-shadow">
<div class="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">database</span>
</div>
<div>
<p class="font-body-md text-body-md text-on-surface-variant">Total Storage Usage</p>
<p class="font-headline-md text-headline-md text-on-surface">4.2 TB</p>
</div>
</div>
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md hover:shadow-sm transition-shadow">
<div class="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
<span class="material-symbols-outlined">event_note</span>
</div>
<div>
<p class="font-body-md text-body-md text-on-surface-variant">Avg Events / Tenant</p>
<p class="font-headline-md text-headline-md text-on-surface">184</p>
</div>
</div>
<div class="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md hover:shadow-sm transition-shadow">
<div class="w-12 h-12 rounded-full bg-error-container/30 flex items-center justify-center text-error">
<span class="material-symbols-outlined">policy</span>
</div>
<div class="w-full">
<p class="font-body-md text-body-md text-on-surface-variant mb-1">Security Pulse (RLS)</p>
<div class="flex justify-between items-center w-full">
<span class="font-label-sm text-label-sm text-on-surface-variant">Detected Violations</span>
<span class="font-title-md text-title-md text-error">12</span>
</div>
<div class="flex justify-between items-center w-full">
<span class="font-label-sm text-label-sm text-on-surface-variant">Blocked Actions</span>
<span class="font-title-md text-title-md text-emerald-600">12</span>
</div>
</div>
</div>
</div>
</section>
<!-- Complex Bento Grid Section -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
<!-- Chart Area (Spans 2 columns) -->
<section class="lg:col-span-2 bg-surface border border-outline-variant rounded-xl p-lg flex flex-col">
<div class="flex justify-between items-center mb-lg border-b border-surface-container-high pb-md">
<h3 class="font-title-md text-title-md text-on-surface">Platform Revenue &amp; GMV</h3>
<div class="flex gap-sm">
<button class="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-label-sm border border-outline-variant hover:bg-surface-variant transition-colors">1M</button>
<button class="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-label-sm border border-outline-variant hover:bg-surface-variant transition-colors">6M</button>
<button class="px-3 py-1 bg-primary text-on-primary rounded font-label-sm text-label-sm">YTD</button>
</div>
</div>
<!-- Faux Chart Container -->
<div class="flex-1 relative min-h-[300px] w-full bg-surface-container-lowest rounded border border-surface-container-high p-md flex items-end justify-between overflow-hidden group">
<!-- Simulated Grid Lines -->
<div class="absolute inset-0 flex flex-col justify-between pointer-events-none p-md opacity-20">
<div class="w-full h-px bg-outline-variant"></div>
<div class="w-full h-px bg-outline-variant"></div>
<div class="w-full h-px bg-outline-variant"></div>
<div class="w-full h-px bg-outline-variant"></div>
<div class="w-full h-px bg-outline-variant"></div>
</div>
<!-- Simulated Bars / Line Data Points -->
<div class="w-12 h-[30%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
<div class="w-12 h-[45%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
<div class="w-12 h-[40%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
<div class="w-12 h-[60%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
<div class="w-12 h-[80%] bg-primary rounded-t relative z-10 opacity-90 shadow-[0_0_15px_rgba(46,49,146,0.2)]"></div>
<div class="w-12 h-[75%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
<div class="w-12 h-[90%] bg-secondary-container rounded-t relative z-10 group-hover:bg-secondary-fixed transition-colors"></div>
</div>
<div class="flex justify-between text-on-surface-variant font-label-sm text-label-sm mt-sm px-md">
<span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
</div>
</section>
<!-- Actionable List (Spans 1 column) -->
<section class="bg-surface border border-outline-variant rounded-xl flex flex-col h-full">
<div class="p-lg border-b border-surface-container-high">
<h3 class="font-title-md text-title-md text-on-surface flex items-center gap-sm">
<span class="material-symbols-outlined text-tertiary-container">pending_actions</span>
                            Pending Approvals
                        </h3>
</div>
<div class="flex-1 overflow-y-auto p-0">
<ul class="divide-y divide-surface-container-high">
<li class="p-md hover:bg-surface-container-lowest transition-colors cursor-pointer">
<div class="flex justify-between items-start">
<div>
<p class="font-body-md text-body-md font-semibold text-on-surface">University of Michigan</p>
<p class="font-label-sm text-label-sm text-on-surface-variant mt-xs">New College Registration</p>
</div>
<span class="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded font-label-sm text-label-sm border border-tertiary-container/20">Review</span>
</div>
</li>
<li class="p-md hover:bg-surface-container-lowest transition-colors cursor-pointer">
<div class="flex justify-between items-start">
<div>
<p class="font-body-md text-body-md font-semibold text-on-surface">Stanford Debate Society</p>
<p class="font-label-sm text-label-sm text-on-surface-variant mt-xs">Premium Tier Upgrade</p>
</div>
<span class="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded font-label-sm text-label-sm border border-tertiary-container/20">Review</span>
</div>
</li>
<li class="p-md hover:bg-surface-container-lowest transition-colors cursor-pointer">
<div class="flex justify-between items-start">
<div>
<p class="font-body-md text-body-md font-semibold text-on-surface">NYU Tech Club</p>
<p class="font-label-sm text-label-sm text-on-surface-variant mt-xs">API Access Request</p>
</div>
<span class="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded font-label-sm text-label-sm border border-tertiary-container/20">Review</span>
</div>
</li>
<li class="p-md hover:bg-surface-container-lowest transition-colors cursor-pointer">
<div class="flex justify-between items-start">
<div>
<p class="font-body-md text-body-md font-semibold text-on-surface">Texas A&amp;M Engineering</p>
<p class="font-label-sm text-label-sm text-on-surface-variant mt-xs">Payment Gateway Config</p>
</div>
<span class="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded font-label-sm text-label-sm border border-tertiary-container/20">Review</span>
</div>
</li>
</ul>
</div>
<div class="p-md border-t border-surface-container-high bg-surface-container-lowest rounded-b-xl">
<button class="w-full text-center font-label-sm text-label-sm text-primary hover:underline">View All Requests (12)</button>
</div>
</section>
</div>
<!-- Lower Grid: Performance and Audit -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
<!-- Tenant Performance Section -->
<section class="bg-surface border border-outline-variant rounded-xl p-lg">
<div class="flex justify-between items-center mb-md border-b border-surface-container-high pb-md">
<h3 class="font-title-md text-title-md text-on-surface flex items-center gap-sm">
<span class="material-symbols-outlined text-tertiary">speed</span>
                        Tenant Performance
                    </h3>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="font-label-sm text-label-sm text-on-surface-variant border-b border-outline-variant">
<th class="py-sm font-semibold">Institution</th>
<th class="py-sm font-semibold">Reg. Volume</th>
<th class="py-sm font-semibold">System Load</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md text-on-surface divide-y divide-surface-container-high">
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md font-medium">University of Michigan</td>
<td class="py-md">12,450/hr</td>
<td class="py-md">
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-error h-2 rounded-full" style="width: 85%"></div>
</div>
<span class="text-xs text-error mt-1 block">High (85%)</span>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md font-medium">Texas A&amp;M Engineering</td>
<td class="py-md">8,200/hr</td>
<td class="py-md">
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-tertiary-container h-2 rounded-full" style="width: 60%"></div>
</div>
<span class="text-xs text-tertiary-container mt-1 block">Medium (60%)</span>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md font-medium">Stanford Debate Society</td>
<td class="py-md">3,100/hr</td>
<td class="py-md">
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-emerald-500 h-2 rounded-full" style="width: 25%"></div>
</div>
<span class="text-xs text-emerald-600 mt-1 block">Normal (25%)</span>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md font-medium">NYU Tech Club</td>
<td class="py-md">1,800/hr</td>
<td class="py-md">
<div class="w-full bg-surface-variant rounded-full h-2">
<div class="bg-emerald-500 h-2 rounded-full" style="width: 15%"></div>
</div>
<span class="text-xs text-emerald-600 mt-1 block">Normal (15%)</span>
</td>
</tr>
</tbody>
</table>
</div>
</section>
<!-- Recent Platform Activity Audit Log -->
<section class="bg-surface border border-outline-variant rounded-xl p-lg">
<div class="flex justify-between items-center mb-md border-b border-surface-container-high pb-md">
<h3 class="font-title-md text-title-md text-on-surface flex items-center gap-sm">
<span class="material-symbols-outlined text-secondary">history</span>
                        Recent Platform Activity
                    </h3>
<button class="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[16px]">filter_list</span> Filter Logs
                    </button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="font-label-sm text-label-sm text-on-surface-variant border-b border-outline-variant">
<th class="py-sm font-semibold">Timestamp</th>
<th class="py-sm font-semibold">Action Event</th>
<th class="py-sm font-semibold">Actor</th>
<th class="py-sm font-semibold">Severity/Status</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md text-on-surface divide-y divide-surface-container-high">
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md text-on-surface-variant whitespace-nowrap">Today, 14:32 PST</td>
<td class="py-md font-medium">New University Onboarded: UC Berkeley</td>
<td class="py-md">System Auto-Provision</td>
<td class="py-md">
<span class="bg-surface-container text-on-surface-variant px-2 py-1 rounded text-xs border border-outline-variant">INFO</span>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md text-on-surface-variant whitespace-nowrap">Today, 11:15 PST</td>
<td class="py-md font-medium">Security Audit Completed (Monthly)</td>
<td class="py-md">Admin: J. Doe</td>
<td class="py-md">
<span class="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs border border-emerald-200">SUCCESS</span>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md text-on-surface-variant whitespace-nowrap">Today, 09:45 PST</td>
<td class="py-md font-medium">Global Feature Flag Toggled: 'New Ticketing UI'</td>
<td class="py-md">Admin: S. Smith</td>
<td class="py-md">
<span class="bg-surface-container text-on-surface-variant px-2 py-1 rounded text-xs border border-outline-variant">INFO</span>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="py-md text-on-surface-variant whitespace-nowrap">Yesterday, 18:20 PST</td>
<td class="py-md font-medium">Payment Gateway Sync Failure detected</td>
<td class="py-md">System Monitor</td>
<td class="py-md">
<span class="bg-error-container text-on-error-container px-2 py-1 rounded text-xs border border-error/20">WARNING</span>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
</div>
</main>
</body></html>
```

