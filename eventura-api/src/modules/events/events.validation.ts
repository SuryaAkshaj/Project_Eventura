import { z } from 'zod';

// Base shape without refinements — used for .partial() (updateEventSchema)
const eventBaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  bannerUrl: z.string().url().optional(),
  clubId: z.string().uuid().optional(),
  visibility: z.enum(['ONLY_MY_COLLEGE', 'SELECTED_COLLEGES', 'ALL_PLATFORM', 'PUBLIC']),
  category: z.string().optional(),
  format: z.enum(['In-Person', 'Online', 'Hybrid']).optional(),
  venue: z.string().optional(),
  onlineLink: z.string().url().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string().default('Asia/Kolkata'),
  maxCapacity: z.number().int().positive().optional(),
  isMultiDay: z.boolean().default(false),
  ticketPrice: z.number().min(0).default(0),
  prizePool: z.number().min(0).optional(),
  registrationDeadline: z.string().datetime().optional(),
  teamSizeMin: z.number().int().positive().optional(),
  teamSizeMax: z.number().int().positive().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  selectedCollegeIds: z.array(z.string().uuid()).optional(),
  sessions: z.array(z.object({
    title: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    venue: z.string().optional(),
    speakerName: z.string().optional(),
  })).optional(),

  // Event type system
  eventType: z.enum(['FEST', 'COMPETITION', 'WORKSHOP', 'SEMINAR', 'OTHER']).default('OTHER'),
  parentEventId: z.string().uuid().optional(),

  // Fest-specific
  accommodation: z.boolean().default(false),
  accommodationInfo: z.string().max(1000).optional(),
  guestPerformers: z.string().optional(),
  sponsorNames: z.string().optional(),
  festEdition: z.number().int().positive().optional(),

  // Competition-specific
  competitionRules: z.string().max(5000).optional(),
  judgingCriteria: z.string().max(2000).optional(),
  submissionFormat: z.string().max(1000).optional(),
});

// createEventSchema with cross-field refinements
export const createEventSchema = eventBaseSchema
  .refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine(data => {
    if (data.visibility === 'SELECTED_COLLEGES') {
      return data.selectedCollegeIds && data.selectedCollegeIds.length > 0;
    }
    return true;
  }, {
    message: 'selectedCollegeIds is required when visibility is SELECTED_COLLEGES',
    path: ['selectedCollegeIds'],
  });

// updateEventSchema — all fields optional, no cross-field refinements needed
export const updateEventSchema = eventBaseSchema.partial();

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  format: z.string().optional(),
  isFree: z.coerce.boolean().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  collegeId: z.string().uuid().optional(),
  hasPrize: z.coerce.boolean().optional(),
  minPrize: z.coerce.number().optional(),
  closingSoon: z.coerce.boolean().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  sortBy: z.enum(['startDate', 'createdAt', 'title', 'prizePool', 'registrationDeadline']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  eventType: z.string().optional(),
  isFest: z.coerce.boolean().optional(),
});
