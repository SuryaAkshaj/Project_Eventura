/**
 * Mock data for UI prototype screens.
 * These are used for pages pending real API integration.
 * @deprecated Replace with real API calls as each feature area is connected.
 */

// ─── Ticket types ───────────────────────────────────────────────────────────

export interface MockTicket {
  id: string;
  eventTitle: string;
  date: string;
  venue: string;
  category: string;
  imageUrl: string;
  ticketNumber: string;
}

export const mockTickets: MockTicket[] = [
  {
    id: '1',
    eventTitle: 'Tech Entrepreneurship Summit',
    date: 'Nov 15, 2024',
    venue: 'Main Auditorium',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    ticketNumber: 'EVT-001-2024',
  },
  {
    id: '2',
    eventTitle: 'Spring Cultural Gala',
    date: 'Nov 22, 2024',
    venue: 'Campus Amphitheater',
    category: 'Cultural',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    ticketNumber: 'EVT-002-2024',
  },
];

// ─── Scan records ────────────────────────────────────────────────────────────

export interface ScanRecord {
  id: string;
  ticketId: string;
  attendee: string;
  time: string;
  status: 'success' | 'duplicate' | 'invalid';
}

export const mockScanRecords: ScanRecord[] = [
  { id: '1', ticketId: 'QR-001', attendee: 'Aisha Patel', time: '10:03 AM', status: 'success' },
  { id: '2', ticketId: 'QR-002', attendee: 'Rahul Kumar', time: '10:07 AM', status: 'success' },
  { id: '3', ticketId: 'QR-003', attendee: 'Priya Sharma', time: '10:11 AM', status: 'duplicate' },
  { id: '4', ticketId: 'QR-004', attendee: 'Dev Nair', time: '10:15 AM', status: 'invalid' },
];

// ─── Org members ─────────────────────────────────────────────────────────────

export type MemberRole = 'Admin' | 'Event Manager' | 'Co-Organiser' | 'Observer';

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: 'active' | 'invited' | 'inactive';
  eventsManaged: number;
  joinDate: string;
  avatarInitials: string;
  avatarColor: string;
}

export const mockOrgMembers: OrgMember[] = [
  {
    id: '1',
    name: 'Arjun Mehta',
    email: 'arjun@woxsen.edu.in',
    role: 'Admin',
    status: 'active',
    eventsManaged: 12,
    joinDate: 'Aug 2023',
    avatarInitials: 'AM',
    avatarColor: 'bg-primary-container',
  },
  {
    id: '2',
    name: 'Sneha Rao',
    email: 'sneha@woxsen.edu.in',
    role: 'Event Manager',
    status: 'active',
    eventsManaged: 7,
    joinDate: 'Jan 2024',
    avatarInitials: 'SR',
    avatarColor: 'bg-secondary-container',
  },
  {
    id: '3',
    name: 'Kiran Desai',
    email: 'kiran@woxsen.edu.in',
    role: 'Observer',
    status: 'invited',
    eventsManaged: 0,
    joinDate: 'Pending',
    avatarInitials: 'KD',
    avatarColor: 'bg-surface-variant',
  },
];

// ─── Org events (for role assignment scoping) ────────────────────────────────

export interface OrgEvent {
  id: string;
  title: string;
}

export const mockOrgEvents: OrgEvent[] = [
  { id: 'evt-1', title: 'Tech Entrepreneurship Summit' },
  { id: 'evt-2', title: 'Spring Cultural Gala' },
  { id: 'evt-3', title: 'AI Workshop Series' },
];
