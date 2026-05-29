import apiClient from './client';
import { v4 as uuidv4 } from 'uuid';

export const registrationsApi = {
  // Register for event — generates idempotency key automatically
  register: (eventId: string) =>
    apiClient.post('/registrations', { eventId }, {
      headers: { 'x-idempotency-key': `${eventId}-${uuidv4()}` }
    }),

  // Get all my registrations (tickets)
  getMyRegistrations: () =>
    apiClient.get('/registrations/my'),

  // Get single registration
  getRegistrationById: (id: string) =>
    apiClient.get(`/registrations/my/${id}`),

  // Cancel registration
  cancelRegistration: (id: string) =>
    apiClient.post(`/registrations/my/${id}/cancel`),

  // Get QR data for a ticket
  getQRData: (registrationId: string) =>
    apiClient.get(`/qr/${registrationId}`),

  // Validate QR (for scanner)
  validateQR: (qrToken: string, eventId: string) =>
    apiClient.post('/qr/validate', { qrToken, eventId }),

  // Get event attendees (organiser)
  getEventAttendees: (eventId: string) =>
    apiClient.get(`/registrations/event/${eventId}`),
};
