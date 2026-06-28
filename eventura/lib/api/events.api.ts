import apiClient from './client';

export interface EventQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  format?: string;
  isFree?: boolean;
  city?: string;
  state?: string;
  collegeId?: string;
  hasPrize?: boolean;
  minPrize?: number;
  closingSoon?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: string;
  sortOrder?: string;
  eventType?: string;
  isFest?: boolean;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  bannerUrl?: string;
  clubId?: string;
  visibility: 'ONLY_MY_COLLEGE' | 'SELECTED_COLLEGES' | 'ALL_PLATFORM' | 'PUBLIC';
  category?: string;
  format?: string;
  venue?: string;
  onlineLink?: string;
  startDate: string;
  endDate: string;
  timezone?: string;
  maxCapacity?: number;
  isMultiDay?: boolean;
  ticketPrice?: number;
  prizePool?: number;
  registrationDeadline?: string;
  teamSizeMin?: number;
  teamSizeMax?: number;
  contactEmail?: string;
  contactPhone?: string;
  selectedCollegeIds?: string[];
  sessions?: { title: string; startTime: string; endTime: string; venue?: string; speakerName?: string }[];

  // Event type system
  eventType?: 'FEST' | 'COMPETITION' | 'WORKSHOP' | 'SEMINAR' | 'OTHER';
  parentEventId?: string;

  // Fest-specific
  accommodation?: boolean;
  accommodationInfo?: string;
  guestPerformers?: string;
  sponsorNames?: string;
  festEdition?: number;

  // Competition-specific
  competitionRules?: string;
  judgingCriteria?: string;
  submissionFormat?: string;
}

export const eventsApi = {
  // Public / Attendee
  getEvents: (query?: EventQuery) =>
    apiClient.get('/events', { params: query }),

  getEventById: (id: string) =>
    apiClient.get(`/events/${id}`),

  getSubEvents: (eventId: string) =>
    apiClient.get(`/events/${eventId}/sub-events`),

  // Organiser
  getOrgEvents: (query?: EventQuery) =>
    apiClient.get('/events/org/my-events', { params: query }),

  getOrgFests: () =>
    apiClient.get('/events/org/my-events?eventType=FEST'),

  createEvent: (payload: CreateEventPayload) =>
    apiClient.post('/events', payload),

  updateEvent: (id: string, payload: Partial<CreateEventPayload>) =>
    apiClient.patch(`/events/${id}`, payload),

  publishEvent: (id: string) =>
    apiClient.post(`/events/${id}/publish`),

  cancelEvent: (id: string) =>
    apiClient.post(`/events/${id}/cancel`),

  deleteEvent: (id: string) =>
    apiClient.delete(`/events/${id}`),

  getReadiness: (id: string) =>
    apiClient.get(`/events/${id}/readiness`),

  getEventStats: (id: string) =>
    apiClient.get(`/events/${id}/stats`),

  // Colleges
  getApprovedColleges: () =>
    apiClient.get('/colleges/approved'),

  getClubsByCollege: (collegeId: string) =>
    apiClient.get(`/colleges/${collegeId}/clubs`),
};
