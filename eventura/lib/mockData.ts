// ─── TypeScript Interfaces ───────────────────────────────────────────────────

export interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  imageUrl: string;
  tags: string[];
  capacity: number;
  registered: number;
  price: number | "Free";
  organizer: string;
  format: "In-Person" | "Virtual" | "Hybrid";
  status: "upcoming" | "live" | "past";
}

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  date: string;
  venue: string;
  imageUrl: string;
  category: string;
  ticketNumber: string;
}

export interface Certificate {
  id: string;
  title: string;
  category: string;
  issuer: string;
  issuedDate: string;
  icon: string;
  bgColor: string;
  iconColor: string;
  verified: boolean;
}

export interface OrgEvent {
  id: string;
  title: string;
  date: string;
  status: "draft" | "published" | "live" | "completed";
  registered: number;
  capacity: number;
  revenue: number;
}

export interface ScanRecord {
  id: string;
  ticketId: string;
  attendee: string;
  time: string;
  status: "success" | "duplicate" | "invalid";
}

export interface College {
  id: string;
  name: string;
  type: "College" | "Club";
  requestDate: string;
  status: "pending" | "approved" | "rejected";
  documentUrl: string;
}

export interface PayoutRecord {
  id: string;
  eventTitle: string;
  amount: number;
  status: "paid" | "pending" | "processing";
  date: string;
}

export interface HealthMetric {
  institution: string;
  activeEvents: number;
  ticketsSold: number;
  uptime: number;
  status: "healthy" | "warning" | "critical";
}

export type MemberRole = "Observer" | "Event Manager" | "Co-Organiser" | "Admin";

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  joinDate: string;
  role: MemberRole;
  eventsManaged: number;
  status: "active" | "invited" | "inactive";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const mockEvents: Event[] = [
  {
    id: "evt-001",
    title: "Annual Innovation Summit 2024",
    category: "Technology",
    date: "October 15, 2024",
    time: "9:00 AM – 5:00 PM",
    venue: "Main Auditorium",
    description: "Exploring the frontiers of artificial intelligence and sustainable technology in higher education.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWTXLBIJ9xNidZGWXjkiGASTLyd-keNNSTYG4k0u7zR11qXztRA_6GVRTnHasOCLpnR1FDs_x6SaBiKQuVizPphJjn09v4gJjP9aN9FsZEXpt_ofqg8bN8VmNHXXaPf07zuKFKu9lRDF4jNtt5P7SMfzz-rBCCGZZjDxujbqkYMgeIFQ3nCtH7Xtb-SIJvHrsa7H7KBuvjzP_iZlYwAA2pnkjswb7j3_bCl3RvP1zEb5rVMbE6VoF_rL7ZoiRCh-LXmcnt08YMAg",
    tags: ["AI", "Technology", "Academic"],
    capacity: 350,
    registered: 287,
    price: 0,
    organizer: "State University Office of Innovation",
    format: "In-Person",
    status: "upcoming",
  },
  {
    id: "evt-002",
    title: "Annual Tech Symposium 2024",
    category: "Academic",
    date: "October 15, 2024",
    time: "10:00 AM – 4:00 PM",
    venue: "Main Auditorium",
    description: "A premier academic gathering for technology and engineering students.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkAA7ATCJSM0CYNvj-iDq8sXgSoK30HTRfv34ZM9hoBzA_aNSKmUqUZVrsgshADrSPHlvxnoyo3gM-UXeNuZdWIEuZJfzCzwQ6r8-SgKBlqiCqhnDjvWYg0zHffeX2RRq52tM4DeDSxKjYVTUD-rLY0yCyLMT2Bc0NJd2GKQG1mzMWh6EDenXM_63vZrs4JEC1AKjvIdQq6OnCzv6GkyR6P7WzWsf3cPqTKbRmE-srugHCkHDIvZtMLC89OY2ZB2g4FMwj4ukqFQ",
    tags: ["Academic", "Engineering"],
    capacity: 500,
    registered: 412,
    price: 0,
    organizer: "Computer Science Department",
    format: "In-Person",
    status: "upcoming",
  },
  {
    id: "evt-003",
    title: "Fall Career Expo",
    category: "Career",
    date: "October 18, 2024",
    time: "11:00 AM – 3:00 PM",
    venue: "Student Union Hall",
    description: "Connect with top employers and recruiters across multiple industries.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7sQMVfrnELpQ6IJ-j0D9ZDtQryOUQwHqRtnJpshVA2RrLs2OcUL8RIRqBxkQEY2l17Kz2dZreMdkkQEsaHNlvZ5rl_08GMuhmffwLMWkTzjNYG6OJZ39vk-ykcxGIMsPmTlpI7EyLKl2LyA5nqJhA8_JZa0UPo1OKElPzt3MbZZ9Ei0lDG7TSAbGH__wDHmPpeVIURcxoALam6JMiLNTsSQ6a0FKzfof6eZ3I9E9rE_93YGPUX5-hZP1Qu9TT8VUrW8F9O4TOdA",
    tags: ["Career", "Networking"],
    capacity: 800,
    registered: 634,
    price: 0,
    organizer: "Career Services Office",
    format: "In-Person",
    status: "upcoming",
  },
  {
    id: "evt-004",
    title: "Alumni Networking Mixer",
    category: "Social",
    date: "October 20, 2024",
    time: "6:00 PM – 9:00 PM",
    venue: "Faculty Lounge",
    description: "Connect with recent graduates in your major.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvrtI6sJmDM5LCfiRdupZaL_08kPF-5ZvqW6fTSxsst45cDqCfnXPImyeW2uSvls8oCw9Z8RI1KwwxDUY_ZffRBWC6fNue3hMZXuEG18PV3dTQSE9pATzezDqF9dptZqHlpCLlFpGxOIjHP1M3W9zxFOBgZBDMb2tpgByWQoZI1m3bAnsxwNDGX5qbOFQojSlYB75qR22RbZxIw6eU2I9BhOhPbaSqDk4PALTWLmZ_yeH-H8YcSX0ujqKFmX5tYo_BXun3DdHDEQ",
    tags: ["Social", "Networking"],
    capacity: 120,
    registered: 78,
    price: "Free",
    organizer: "Alumni Association",
    format: "In-Person",
    status: "upcoming",
  },
  {
    id: "evt-005",
    title: "Advanced Data Analytics Workshop",
    category: "Workshop",
    date: "October 22, 2024",
    time: "2:00 PM – 6:00 PM",
    venue: "CS Lab 301",
    description: "Hands-on session with industry tools including Python, Tableau, and Power BI.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8QvEggDEjzOdaETHo55rhYZpvihxyxZh0q2Z9dxFGuQfO7p0CwtIxV9MbLwrORaXIU5AK9ESms2zw0FMt_RGaEXim3ZXMaFAn2j76Y2YkTZ5JXwVr0xG9UTbDoO39vfT4D2baNqAfAu-ng_OU2fQuoSGqWcYKTwfmw17t5XwRfrDX2a9olakGC84eHyA9mLgxpS2aZT3tKGkYF8rLFKO7iypvtLWV1i5opKGB_6uDPuJjuJx-2D0SLsGYbmUMvE-QxK1pQvdRrQ",
    tags: ["Workshop", "Academic", "Technical"],
    capacity: 60,
    registered: 57,
    price: 2,
    organizer: "Data Science Club",
    format: "In-Person",
    status: "upcoming",
  },
];

export const mockTickets: Ticket[] = [
  {
    id: "tkt-001",
    eventId: "evt-002",
    eventTitle: "Annual Tech Symposium 2024",
    date: "Oct 15",
    venue: "Main Auditorium",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkAA7ATCJSM0CYNvj-iDq8sXgSoK30HTRfv34ZM9hoBzA_aNSKmUqUZVrsgshADrSPHlvxnoyo3gM-UXeNuZdWIEuZJfzCzwQ6r8-SgKBlqiCqhnDjvWYg0zHffeX2RRq52tM4DeDSxKjYVTUD-rLY0yCyLMT2Bc0NJd2GKQG1mzMWh6EDenXM_63vZrs4JEC1AKjvIdQq6OnCzv6GkyR6P7WzWsf3cPqTKbRmE-srugHCkHDIvZtMLC89OY2ZB2g4FMwj4ukqFQ",
    category: "Academic",
    ticketNumber: "EV-4921",
  },
  {
    id: "tkt-002",
    eventId: "evt-003",
    eventTitle: "Fall Career Expo",
    date: "Oct 18",
    venue: "Student Union Hall",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7sQMVfrnELpQ6IJ-j0D9ZDtQryOUQwHqRtnJpshVA2RrLs2OcUL8RIRqBxkQEY2l17Kz2dZreMdkkQEsaHNlvZ5rl_08GMuhmffwLMWkTzjNYG6OJZ39vk-ykcxGIMsPmTlpI7EyLKl2LyA5nqJhA8_JZa0UPo1OKElPzt3MbZZ9Ei0lDG7TSAbGH__wDHmPpeVIURcxoALam6JMiLNTsSQ6a0FKzfof6eZ3I9E9rE_93YGPUX5-hZP1Qu9TT8VUrW8F9O4TOdA",
    category: "Career",
    ticketNumber: "EV-8832",
  },
];

export const mockCertificates: Certificate[] = [
  {
    id: "cert-001",
    title: "Global Leadership Summit 2024",
    category: "Academic Excellence",
    issuer: "State University",
    issuedDate: "May 15, 2024",
    icon: "local_library",
    bgColor: "bg-secondary-container",
    iconColor: "text-primary",
    verified: true,
  },
  {
    id: "cert-002",
    title: "Diversity & Inclusion Workshop Series",
    category: "Community Engagement",
    issuer: "Student Affairs Office",
    issuedDate: "April 02, 2024",
    icon: "groups",
    bgColor: "bg-primary-fixed-dim",
    iconColor: "text-primary",
    verified: true,
  },
  {
    id: "cert-003",
    title: "Advanced Python Bootcamp",
    category: "Technical Skill",
    issuer: "Computer Science Dept",
    issuedDate: "March 10, 2024",
    icon: "terminal",
    bgColor: "bg-tertiary-fixed-dim",
    iconColor: "text-tertiary",
    verified: true,
  },
  {
    id: "cert-004",
    title: "Spring Campus Clean-up Initiative",
    category: "Volunteer Service",
    issuer: "Sustainability Office",
    issuedDate: "Feb 28, 2024",
    icon: "handshake",
    bgColor: "bg-surface-container-high",
    iconColor: "text-secondary",
    verified: true,
  },
];

export const mockOrgEvents: OrgEvent[] = [
  { id: "org-evt-001", title: "Annual Tech Symposium", date: "Oct 15, 2024", status: "live", registered: 412, capacity: 500, revenue: 0 },
  { id: "org-evt-002", title: "Fall Workshop Series", date: "Oct 22, 2024", status: "published", registered: 57, capacity: 60, revenue: 114 },
  { id: "org-evt-003", title: "Spring Gala", date: "Nov 10, 2024", status: "draft", registered: 0, capacity: 300, revenue: 0 },
];

export const mockScanRecords: ScanRecord[] = [
  { id: "scan-001", ticketId: "EV-4921", attendee: "Sarah Johnson", time: "10:03 AM", status: "success" },
  { id: "scan-002", ticketId: "EV-8832", attendee: "Michael Chen", time: "10:05 AM", status: "success" },
  { id: "scan-003", ticketId: "EV-4921", attendee: "Sarah Johnson", time: "10:08 AM", status: "duplicate" },
  { id: "scan-004", ticketId: "EV-9999", attendee: "Unknown", time: "10:12 AM", status: "invalid" },
  { id: "scan-005", ticketId: "EV-3310", attendee: "Alex Rivera", time: "10:15 AM", status: "success" },
];

export const mockColleges: College[] = [
  { id: "col-001", name: "Alpha Kappa Psi", type: "Club", requestDate: "Oct 24, 2024", status: "pending", documentUrl: "#" },
  { id: "col-002", name: "College of Engineering", type: "College", requestDate: "Oct 23, 2024", status: "pending", documentUrl: "#" },
  { id: "col-003", name: "Debate Society", type: "Club", requestDate: "Oct 22, 2024", status: "pending", documentUrl: "#" },
  { id: "col-004", name: "Business School", type: "College", requestDate: "Oct 20, 2024", status: "approved", documentUrl: "#" },
];

export const mockPayouts: PayoutRecord[] = [
  { id: "pay-001", eventTitle: "Advanced Data Analytics Workshop", amount: 114, status: "pending", date: "Oct 22, 2024" },
  { id: "pay-002", eventTitle: "Spring Leadership Seminar", amount: 450, status: "paid", date: "Sep 15, 2024" },
  { id: "pay-003", eventTitle: "Networking Mixer Oct", amount: 0, status: "processing", date: "Oct 20, 2024" },
];

export const mockHealthMetrics: HealthMetric[] = [
  { institution: "State University", activeEvents: 12, ticketsSold: 1450, uptime: 99.8, status: "healthy" },
  { institution: "City College", activeEvents: 5, ticketsSold: 430, uptime: 98.2, status: "healthy" },
  { institution: "Tech Institute", activeEvents: 8, ticketsSold: 720, uptime: 94.1, status: "warning" },
  { institution: "Arts Academy", activeEvents: 3, ticketsSold: 180, uptime: 87.5, status: "critical" },
];

export const mockOrgMembers: OrgMember[] = [
  { id: "mem-001", name: "Priya Sharma", email: "p.sharma@university.edu", avatarInitials: "PS", avatarColor: "bg-primary-container/40", joinDate: "Sep 01, 2024", role: "Admin", eventsManaged: 5, status: "active" },
  { id: "mem-002", name: "James Whitfield", email: "j.whitfield@university.edu", avatarInitials: "JW", avatarColor: "bg-secondary-container", joinDate: "Sep 15, 2024", role: "Event Manager", eventsManaged: 3, status: "active" },
  { id: "mem-003", name: "Anaya Obi", email: "a.obi@university.edu", avatarInitials: "AO", avatarColor: "bg-tertiary-fixed/50", joinDate: "Oct 01, 2024", role: "Event Manager", eventsManaged: 2, status: "active" },
  { id: "mem-004", name: "Carlos Mendez", email: "c.mendez@university.edu", avatarInitials: "CM", avatarColor: "bg-primary-container/20", joinDate: "Oct 05, 2024", role: "Co-Organiser", eventsManaged: 1, status: "active" },
  { id: "mem-005", name: "Yuki Tanaka", email: "y.tanaka@university.edu", avatarInitials: "YT", avatarColor: "bg-secondary-container", joinDate: "Oct 10, 2024", role: "Observer", eventsManaged: 0, status: "active" },
  { id: "mem-006", name: "Fatima Al-Rashid", email: "f.alrashid@university.edu", avatarInitials: "FA", avatarColor: "bg-tertiary-fixed/30", joinDate: "Oct 18, 2024", role: "Observer", eventsManaged: 0, status: "invited" },
  { id: "mem-007", name: "Daniel Okafor", email: "d.okafor@university.edu", avatarInitials: "DO", avatarColor: "bg-primary-container/40", joinDate: "Oct 20, 2024", role: "Observer", eventsManaged: 0, status: "invited" },
  { id: "mem-008", name: "Sofia Reyes", email: "s.reyes@university.edu", avatarInitials: "SR", avatarColor: "bg-surface-container-high", joinDate: "Aug 20, 2024", role: "Co-Organiser", eventsManaged: 4, status: "inactive" },
];

