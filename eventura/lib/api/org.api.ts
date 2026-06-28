import apiClient from './client';

export const orgApi = {
  getMyOrg: () =>
    apiClient.get('/colleges/my-org'),

  updateMyOrg: (data: {
    website?: string;
    address?: string;
    clubName?: string;
    clubDescription?: string;
  }) => apiClient.patch('/colleges/my-org', data),
};
