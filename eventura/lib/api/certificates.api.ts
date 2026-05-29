import apiClient from './client';

export const certificatesApi = {
  // Generate certificate for a registration
  generate: (registrationId: string) =>
    apiClient.post('/certificates/generate', { registrationId }),

  // Get all my certificates
  getMyCertificates: () =>
    apiClient.get('/certificates/my'),

  // Download URL (direct link, no axios needed)
  getDownloadUrl: (certificateId: string) =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/certificates/download/${certificateId}`,

  // Verify a certificate (public)
  verify: (certificateId: string) =>
    apiClient.get(`/certificates/verify/${certificateId}`),

  // Bulk generate for organiser
  bulkGenerate: (eventId: string) =>
    apiClient.post('/certificates/bulk', { eventId }),
};
