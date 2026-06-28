import apiClient from './client';

export const bookmarksApi = {
  getMyBookmarks: () =>
    apiClient.get('/bookmarks'),

  bookmark: (eventId: string) =>
    apiClient.post('/bookmarks', { eventId }),

  removeBookmark: (eventId: string) =>
    apiClient.delete(`/bookmarks/${eventId}`),

  checkBookmark: (eventId: string) =>
    apiClient.get(`/bookmarks/check/${eventId}`),
};
