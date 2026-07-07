// Maps organisation type to context-appropriate language
export interface OrgLanguage {
  organisation: string;     // e.g. "University" or "Company"
  team: string;             // e.g. "Club" or "Department"
  teamAdmin: string;        // e.g. "Club President" or "Team Lead"
  orgAdmin: string;         // e.g. "College Admin" or "HR Admin"
  members: string;          // e.g. "Students" or "Employees"
  attendees: string;        // e.g. "Students" or "Participants"
  events: string;           // e.g. "Fests" or "Events"
}

const ORG_LANGUAGE: Record<string, OrgLanguage> = {
  UNIVERSITY: {
    organisation: 'University',
    team: 'Club',
    teamAdmin: 'Club President',
    orgAdmin: 'College Admin',
    members: 'Students',
    attendees: 'Students',
    events: 'Fests & Events',
  },
  COMPANY: {
    organisation: 'Company',
    team: 'Department',
    teamAdmin: 'Team Lead',
    orgAdmin: 'HR Admin',
    members: 'Employees',
    attendees: 'Attendees',
    events: 'Corporate Events',
  },
  COMMUNITY: {
    organisation: 'Community',
    team: 'Chapter',
    teamAdmin: 'Chapter Lead',
    orgAdmin: 'Community Admin',
    members: 'Members',
    attendees: 'Participants',
    events: 'Meetups & Events',
  },
  CREATOR: {
    organisation: 'Brand',
    team: 'Team',
    teamAdmin: 'Creator',
    orgAdmin: 'Brand Manager',
    members: 'Fans',
    attendees: 'Attendees',
    events: 'Sessions & Workshops',
  },
  NGO: {
    organisation: 'Organisation',
    team: 'Chapter',
    teamAdmin: 'Chapter Head',
    orgAdmin: 'NGO Admin',
    members: 'Volunteers',
    attendees: 'Participants',
    events: 'Drives & Events',
  },
  SPORTS: {
    organisation: 'Sports Organisation',
    team: 'Squad',
    teamAdmin: 'Team Captain',
    orgAdmin: 'Sports Admin',
    members: 'Athletes',
    attendees: 'Participants',
    events: 'Tournaments & Meets',
  },
  ENTERTAINMENT: {
    organisation: 'Production House',
    team: 'Team',
    teamAdmin: 'Show Manager',
    orgAdmin: 'Production Admin',
    members: 'Staff',
    attendees: 'Audience',
    events: 'Shows & Events',
  },
  GOVERNMENT: {
    organisation: 'Department',
    team: 'Division',
    teamAdmin: 'Division Head',
    orgAdmin: 'Department Admin',
    members: 'Staff',
    attendees: 'Citizens',
    events: 'Public Events',
  },
};

const DEFAULT_LANGUAGE: OrgLanguage = {
  organisation: 'Organisation',
  team: 'Team',
  teamAdmin: 'Team Admin',
  orgAdmin: 'Organisation Admin',
  members: 'Members',
  attendees: 'Attendees',
  events: 'Events',
};

export function getOrgLanguage(orgType?: string | null): OrgLanguage {
  if (!orgType) return DEFAULT_LANGUAGE;
  return ORG_LANGUAGE[orgType] || DEFAULT_LANGUAGE;
}

// Hook to get org language from auth store
// Get org type from college.type field in user context
// For now default to UNIVERSITY since that's our main use case
// This will be enhanced when we add org type to JWT context
export function useOrgLanguage(): OrgLanguage {
  return DEFAULT_LANGUAGE;
}
