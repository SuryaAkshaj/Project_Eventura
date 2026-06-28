import apiClient from './client';

export const membersApi = {
  getMyMembers: () =>
    apiClient.get('/colleges/my-members'),

  appointEventManager: (userId: string, eventId: string) =>
    apiClient.post('/colleges/appoint-manager', { userId, eventId }),
};
