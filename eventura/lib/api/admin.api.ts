import apiClient from './client';

export const adminApi = {
  // Stats
  getStats: () => apiClient.get('/admin/stats'),

  // Colleges
  getAllColleges: (params?: any) => apiClient.get('/admin/colleges', { params }),
  getPendingColleges: () => apiClient.get('/admin/colleges/pending'),
  approveCollege: (id: string) => apiClient.post(`/admin/colleges/${id}/approve`),
  rejectCollege: (id: string, reason?: string) => apiClient.post(`/admin/colleges/${id}/reject`, { reason }),
  suspendCollege: (id: string) => apiClient.post(`/admin/colleges/${id}/suspend`),

  // Clubs
  getPendingClubs: () => apiClient.get('/admin/clubs/pending'),
  approveClub: (id: string) => apiClient.post(`/admin/clubs/${id}/approve`),
  rejectClub: (id: string, reason?: string) => apiClient.post(`/admin/clubs/${id}/reject`, { reason }),

  // Users
  getAllUsers: (params?: any) => apiClient.get('/admin/users', { params }),

  // Settings
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data: any) => apiClient.patch('/admin/settings', data),

  // Audit
  getAuditLog: (params?: any) => apiClient.get('/admin/audit', { params }),

  // Health
  getHealth: () => apiClient.get('/admin/health'),

  // Events
  getAllEvents: (params?: any) => apiClient.get('/admin/events', { params }),
};
