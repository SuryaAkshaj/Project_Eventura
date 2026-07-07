import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { success, created, paginated } from '@shared/utils/apiResponse';
import { createEventSchema, updateEventSchema, eventQuerySchema } from './events.validation';
import * as eventsService from './events.service';

// ─── Public / Attendee endpoints ──────────────────────────────────────────────

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const query = eventQuerySchema.parse(req.query);
  const userContext = {
    collegeId: req.user?.activeContext?.collegeId ?? null,
    role: req.user?.activeContext?.role ?? 'PUBLIC',
  };
  const result = await eventsService.getEvents(query, userContext);
  return paginated(res, result.events, result.meta.total, result.meta.page, result.meta.limit);
});

export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userContext = {
    collegeId: req.user?.activeContext?.collegeId ?? null,
    role: req.user?.activeContext?.role ?? 'PUBLIC',
  };
  const event = await eventsService.getEventById(id, userContext);
  return success(res, event);
});

// ─── Organiser endpoints ───────────────────────────────────────────────────────

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const dto = createEventSchema.parse(req.body);
  const organizerContext = {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId,
    clubId: req.user!.activeContext.clubId ?? null,
  };
  const event = await eventsService.createEvent(dto, organizerContext);
  return created(res, event, 'Event created successfully');
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto = updateEventSchema.parse(req.body);
  const organizerContext = {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId!,
  };
  const event = await eventsService.updateEvent(id, dto, organizerContext);
  return success(res, event, 'Event updated successfully');
});

export const publishEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const event = await eventsService.publishEvent(id, {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId!,
  });
  return success(res, event, 'Event published successfully');
});

export const cancelEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const event = await eventsService.cancelEvent(id, {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId!,
  });
  return success(res, event, 'Event cancelled');
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await eventsService.deleteEvent(id, {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId!,
  });
  return success(res, result, 'Event deleted');
});

export const getReadinessScore = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await eventsService.getReadinessScore(id, {
    userId: req.user!.sub,
    collegeId: req.user!.activeContext.collegeId!,
  });
  return success(res, result);
});

export const getOrgEvents = asyncHandler(async (req: Request, res: Response) => {
  const query = eventQuerySchema.parse(req.query);
  const result = await eventsService.getOrgEvents(
    { collegeId: req.user!.activeContext.collegeId! },
    query,
  );
  return paginated(res, result.events, result.meta.total, result.meta.page, result.meta.limit);
});

export const getEventStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const stats = await eventsService.getEventStats(id, {
    collegeId: req.user!.activeContext.collegeId!,
  });
  return success(res, stats);
});
