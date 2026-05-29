import apiClient from './client';

export const paymentsApi = {
  createOrder: (registrationId: string) =>
    apiClient.post('/payments/order', { registrationId }),

  verifyPayment: (data: {
    registrationId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => apiClient.post('/payments/verify', data),

  getOrgPayments: () => apiClient.get('/payments/org'),
};
