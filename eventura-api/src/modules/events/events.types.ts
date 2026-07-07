export interface CreateEventDto {
  title: string;
  description?: string;
  bannerUrl?: string;
  clubId?: string;
  visibility: 'ONLY_MY_COLLEGE' | 'SELECTED_COLLEGES' | 'ALL_PLATFORM' | 'PUBLIC';
  category?: string;
  format?: string;
  venue?: string;
  onlineLink?: string;
  startDate: string;        // ISO string
  endDate: string;          // ISO string
  timezone?: string;
  maxCapacity?: number;
  isMultiDay?: boolean;
  isFree?: boolean;
  ticketPrice?: number;
  prizePool?: number;                      // Total prize pool in INR
  registrationDeadline?: string;           // ISO string
  teamSizeMin?: number;
  teamSizeMax?: number;
  contactEmail?: string;
  contactPhone?: string;
  selectedCollegeIds?: string[];   // For SELECTED_COLLEGES visibility
  sessions?: CreateSessionDto[];

  // New type system fields
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

export interface CreateSessionDto {
  title: string;
  startTime: string;
  endTime: string;
  venue?: string;
  speakerName?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface EventQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  format?: string;
  visibility?: string;
  status?: string;
  collegeId?: string;
  isFree?: boolean;
  city?: string;               // Filter by college city
  state?: string;              // Filter by college state
  hasPrize?: boolean;          // Only events with prize pool > 0
  minPrize?: number;           // Minimum prize pool amount
  closingSoon?: boolean;       // Closing in next 7 days
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: 'startDate' | 'createdAt' | 'title' | 'prizePool' | 'registrationDeadline';
  sortOrder?: 'asc' | 'desc';
  eventType?: string;          // Filter by event type
  isFest?: boolean;            // Only show fests
}
