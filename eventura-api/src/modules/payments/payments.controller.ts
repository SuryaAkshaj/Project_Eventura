import { asyncHandler } from '@shared/utils/asyncHandler';
import * as apiResponse from '@shared/utils/apiResponse';
import * as paymentsService from './payments.service';

export const createOrder = asyncHandler(async (req, res) => {
  const { registrationId } = req.body;
  if (!registrationId) {
    return apiResponse.error(res, 'MISSING_FIELD', 'registrationId is required', 400);
  }
  const order = await paymentsService.createOrder(registrationId, req.user!.sub);
  return apiResponse.success(res, order);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { registrationId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!registrationId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return apiResponse.error(res, 'MISSING_FIELDS', 'All payment fields are required', 400);
  }
  const result = await paymentsService.verifyPayment(
    registrationId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    req.user!.sub,
  );
  return apiResponse.success(res, result, 'Payment verified successfully');
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  if (!signature) {
    return apiResponse.error(res, 'MISSING_SIGNATURE', 'Webhook signature missing', 400);
  }
  // Use raw body (Buffer) for signature verification — stored by raw body middleware
  const rawBody = (req as any).rawBody as string;
  if (!rawBody) {
    return apiResponse.error(res, 'MISSING_BODY', 'Webhook body missing', 400);
  }
  const result = await paymentsService.handleWebhook(rawBody, signature);
  return res.status(200).json(result);
});

export const getOrgPayments = asyncHandler(async (req, res) => {
  const collegeId = req.user!.activeContext?.collegeId;
  if (!collegeId) {
    return apiResponse.error(res, 'NO_COLLEGE', 'No college context found', 400);
  }
  const result = await paymentsService.getOrgPayments(collegeId);
  return apiResponse.success(res, result);
});

export const getPlatformPayments = asyncHandler(async (req, res) => {
  const result = await paymentsService.getPlatformPayments();
  return apiResponse.success(res, result);
});
