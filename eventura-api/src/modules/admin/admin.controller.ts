import { asyncHandler } from '@shared/utils/asyncHandler';
import * as adminService from './admin.service';

export const getPlatformStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getPlatformStats();
  return res.json({ success: true, data: stats });
});

export const getPendingColleges = asyncHandler(async (req, res) => {
  const colleges = await adminService.getPendingColleges();
  return res.json({ success: true, data: colleges });
});

export const getAllColleges = asyncHandler(async (req, res) => {
  const result = await adminService.getAllColleges(req.query);
  return res.json({ success: true, data: result.colleges, meta: result.meta });
});

export const approveCollege = asyncHandler(async (req, res) => {
  const college = await adminService.approveCollege(req.params.id, req.user!.sub);
  return res.json({ success: true, data: college, message: 'College approved successfully' });
});

export const rejectCollege = asyncHandler(async (req, res) => {
  const result = await adminService.rejectCollege(req.params.id, req.user!.sub, req.body.reason);
  return res.json({ success: true, data: result, message: 'College rejected' });
});

export const suspendCollege = asyncHandler(async (req, res) => {
  const result = await adminService.suspendCollege(req.params.id, req.user!.sub);
  return res.json({ success: true, data: result, message: 'College suspended' });
});

export const getPendingClubs = asyncHandler(async (req, res) => {
  const clubs = await adminService.getPendingClubs();
  return res.json({ success: true, data: clubs });
});

export const approveClub = asyncHandler(async (req, res) => {
  const club = await adminService.approveClub(req.params.id, req.user!.sub);
  return res.json({ success: true, data: club, message: 'Club approved successfully' });
});

export const rejectClub = asyncHandler(async (req, res) => {
  const result = await adminService.rejectClub(req.params.id, req.user!.sub, req.body.reason);
  return res.json({ success: true, data: result, message: 'Club rejected' });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);
  return res.json({ success: true, data: result.users, meta: result.meta });
});

export const getPlatformSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.getPlatformSettings();
  return res.json({ success: true, data: settings });
});

export const updatePlatformSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.updatePlatformSettings(req.body, req.user!.sub);
  return res.json({ success: true, data: settings, message: 'Settings updated' });
});

export const getAuditLog = asyncHandler(async (req, res) => {
  const result = await adminService.getAuditLog(req.query);
  return res.json({ success: true, data: result.logs, meta: result.meta });
});

export const getMultiTenantHealth = asyncHandler(async (req, res) => {
  const health = await adminService.getMultiTenantHealth();
  return res.json({ success: true, data: health });
});

export const getAllEvents = asyncHandler(async (req, res) => {
  const result = await adminService.getAllEvents(req.query as any);
  return res.json({ success: true, data: result.events, meta: result.meta });
});
