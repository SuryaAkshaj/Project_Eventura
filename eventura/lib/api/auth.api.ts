import apiClient from './client';

export interface SignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  requestedRole: 'ATTENDEE' | 'COLLEGE_ADMIN' | 'CLUB_PRESIDENT';
  collegeName?: string;
  collegeDomain?: string;
  clubName?: string;
  collegeId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export const authApi = {
  signup: (dto: SignupDto) => apiClient.post('/auth/signup', dto),
  verifyEmail: (userId: string, otp: string) =>
    apiClient.post('/auth/verify-email', { userId, otp }),
  login: (dto: LoginDto) => apiClient.post('/auth/login', dto),
  logout: () => apiClient.post('/auth/logout'),
  refresh: () => apiClient.post('/auth/refresh'),
  getStatus: (userId?: string) =>
    apiClient.get('/auth/status', { params: userId ? { userId } : undefined }),
  getMe: () => apiClient.get('/auth/me'),
  contextSwitch: (dto: { roleId: string; collegeId?: string | null; clubId?: string | null }) =>
    apiClient.post('/auth/context-switch', dto),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (dto: { userId: string; otp: string; newPassword: string }) =>
    apiClient.post('/auth/reset-password', dto),
  getApprovedColleges: () => apiClient.get('/colleges/approved'),
};

export const collegesApi = {
  getApproved: () => apiClient.get('/colleges/approved'),
};
