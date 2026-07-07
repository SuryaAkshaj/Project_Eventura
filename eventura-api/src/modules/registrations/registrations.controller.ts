import { asyncHandler } from '@shared/utils/asyncHandler';
import { success, created } from '@shared/utils/apiResponse';
import * as registrationsService from './registrations.service';

export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const idempotencyKey = req.headers['x-idempotency-key'] as string || `${req.user!.sub}-${eventId}-${Date.now()}`;

  const result = await registrationsService.registerForEvent(
    { eventId, idempotencyKey },
    req.user!.sub,
    req.user!.activeContext.collegeId!
  );

  if ((result as any).alreadyRegistered) {
    return success(res, result, 'Already registered for this event', 200);
  }
  if ((result as any).waitlisted) {
    return success(res, result, `Added to waitlist at position ${(result as any).waitlistPosition}`, 202);
  }
  return created(res, result, 'Successfully registered for event');
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationsService.getUserRegistrations(req.user!.sub);
  return success(res, registrations);
});

export const getRegistrationById = asyncHandler(async (req, res) => {
  const registration = await registrationsService.getRegistrationById(
    req.params.id,
    req.user!.sub
  );
  return success(res, registration);
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationsService.cancelRegistration(
    req.params.id,
    req.user!.sub
  );
  return success(res, registration, 'Registration cancelled');
});

export const getEventAttendees = asyncHandler(async (req, res) => {
  const attendees = await registrationsService.getEventAttendees(
    req.params.eventId,
    req.user!.activeContext.collegeId!
  );
  return success(res, attendees);
});
