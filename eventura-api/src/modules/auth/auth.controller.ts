import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { success, created, error as apiError } from '@shared/utils/apiResponse';
import * as authService from './auth.service';
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  contextSwitchSchema,
} from './auth.validation';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// POST /auth/signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const dto = signupSchema.parse(req.body);
  const result = await authService.signup(dto);
  created(res, result, result.message);
});

// POST /auth/verify-email
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { userId, otp } = verifyEmailSchema.parse(req.body);
  await authService.verifyEmail(userId, otp);
  success(res, null, 'Email verified successfully');
});

// POST /auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const dto = loginSchema.parse(req.body);
  const result = await authService.login(dto);

  if (result.statusCode === 202) {
    res.status(202).json({
      success: true,
      requiresApproval: true,
      data: { user: result.user },
      message: 'Account is pending approval',
    });
    return;
  }

  if (result.statusCode === 206) {
    res.status(206).json({
      success: true,
      requiresContextSelection: true,
      data: { user: result.user, roles: (result as any).roles },
      message: 'Multiple roles found — select a context',
    });
    return;
  }

  // 200 — successful login
  res.cookie('eventura_refresh', result.tokenPair!.refreshToken, COOKIE_OPTIONS);
  success(res, {
    user: result.user,
    accessToken: result.tokenPair!.accessToken,
    activeContext: result.activeContext,
  }, 'Login successful');
});

// POST /auth/refresh
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.eventura_refresh;
  if (!token) {
    apiError(res, 'MISSING_REFRESH_TOKEN', 'No refresh token provided', undefined, 401);
    return;
  }
  const tokenPair = await authService.refreshToken(token);
  res.cookie('eventura_refresh', tokenPair.refreshToken, COOKIE_OPTIONS);
  success(res, { accessToken: tokenPair.accessToken });
});

// POST /auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const userId = (req as any).user?.sub ?? req.body?.userId;

  if (userId) {
    await authService.logout(userId, accessToken);
  }

  res.clearCookie('eventura_refresh', { path: '/' });
  success(res, null, 'Logged out successfully');
});

// GET /auth/status
export const getApprovalStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.sub ?? req.query.userId as string;
  if (!userId) {
    apiError(res, 'MISSING_USER_ID', 'userId is required', undefined, 400);
    return;
  }
  const status = await authService.getApprovalStatus(userId);
  success(res, status);
});

// POST /auth/context-switch
export const contextSwitch = asyncHandler(async (req: Request, res: Response) => {
  const { roleId, collegeId, clubId } = contextSwitchSchema.parse(req.body);
  const userId = (req as any).user?.sub ?? req.body?.userId;
  if (!userId) {
    apiError(res, 'MISSING_USER_ID', 'userId is required', undefined, 400);
    return;
  }
  const tokenPair = await authService.contextSwitch(userId, roleId, collegeId, clubId);
  res.cookie('eventura_refresh', tokenPair.refreshToken, COOKIE_OPTIONS);
  success(res, { accessToken: tokenPair.accessToken });
});

// POST /auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  await authService.forgotPassword(email);
  success(res, null, 'OTP sent to console (dev mode)');
});

// POST /auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { userId, otp, newPassword } = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(userId, otp, newPassword);
  success(res, null, 'Password reset successfully');
});
