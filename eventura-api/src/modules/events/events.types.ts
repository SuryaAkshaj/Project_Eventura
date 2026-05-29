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
  ticketPrice?: number;
  selectedCollegeIds?: string[];   // For SELECTED_COLLEGES visibility
  sessions?: CreateSessionDto[];
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
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: 'startDate' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}
