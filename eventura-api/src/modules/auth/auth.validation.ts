import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  requestedRole: z.enum(['ATTENDEE', 'COLLEGE_ADMIN', 'CLUB_PRESIDENT']),
  collegeName: z.string().min(1).max(100).optional(),
  collegeDomain: z
    .string()
    .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain format (e.g. university.edu)')
    .optional(),
  clubName: z.string().min(1).max(100).optional(),
  collegeId: z.string().uuid('Invalid college ID').optional(),
}).superRefine((data, ctx) => {
  if (data.requestedRole === 'COLLEGE_ADMIN') {
    if (!data.collegeName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'collegeName is required for College Admin', path: ['collegeName'] });
    }
    if (!data.collegeDomain) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'collegeDomain is required for College Admin', path: ['collegeDomain'] });
    }
  }
  if (data.requestedRole === 'CLUB_PRESIDENT') {
    if (!data.clubName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'clubName is required for Club President', path: ['clubName'] });
    }
    if (!data.collegeId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'collegeId is required for Club President', path: ['collegeId'] });
    }
  }
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const contextSwitchSchema = z.object({
  roleId: z.string().uuid('Invalid role assignment ID'),
  collegeId: z.string().uuid().nullable().optional(),
  clubId: z.string().uuid().nullable().optional(),
});
