import axios from 'axios';

// API base URL - will be configurable for different environments
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { username: string; email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', userData),
  profile: () => api.get('/auth/profile'),
  updateProfile: (profileData: { firstName: string; lastName: string; email: string; phoneNumber?: string; companyName?: string }) =>
    api.put('/auth/profile', profileData),
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', passwordData),
  updateEmailPreferences: (preferences: { welcomeEmails: boolean; applicationConfirmations: boolean; statusChangeNotifications: boolean; jobAlerts: boolean; marketingEmails: boolean }) =>
    api.put('/auth/email-preferences', preferences),
};

export const jobsAPI = {
  getAll: (params?: any) => api.get('/jobs', { params }),
  getById: (id: number) => api.get(`/jobs/${id}`),
  search: (searchParams: any) => {
    // Map frontend field names to backend field names
    const backendParams = {
      searchTerm: searchParams.query,
      technology: searchParams.technology,
      location: searchParams.location,
      company: searchParams.company,
      salary: searchParams.minSalary,
      minExperience: searchParams.minExperience,
      maxExperience: searchParams.maxExperience,
      jobType: searchParams.jobType,
      page: searchParams.page || 0,
      size: searchParams.size || 10,
      sortBy: searchParams.sortBy || 'postDate',
      sortDir: searchParams.sortOrder || 'desc',
      useFullTextSearch: searchParams.useFullTextSearch || false
    };
    
    // Remove undefined values
    Object.keys(backendParams).forEach(key => {
      if ((backendParams as any)[key] === undefined) {
        delete (backendParams as any)[key];
      }
    });
    
    console.log('🔍 Frontend params:', searchParams);
    console.log('🔍 Backend params:', backendParams);
    
    return api.post('/jobs/search', backendParams);
  },
  create: (jobData: any) => api.post('/jobs', jobData),
  update: (id: number, jobData: any) => api.put(`/jobs/${id}`, jobData),
  delete: (id: number) => api.delete(`/jobs/${id}`),
  getSuggestions: (query: string) => api.get(`/jobs/suggestions?q=${query}`),
  getMyJobs: () => api.get('/jobs/my-jobs'),
};

export const applicationsAPI = {
  apply: (jobPostId: number, resumeFileId?: number) => 
    api.post('/applications', null, { params: { jobPostId, ...(resumeFileId && { resumeFileId }) } }),
  getUserApplications: () => api.get('/applications/user'),
  getApplicationById: (applicationId: number) => api.get(`/applications/${applicationId}`),
  getJobApplications: (jobPostId: number) => api.get(`/applications/job/${jobPostId}`),
  getMyJobApplications: () => api.get('/applications/hr-applications'),
  updateStatus: (applicationId: number, status: string) => 
    api.put(`/applications/${applicationId}/status`, null, { params: { status } }),
  withdraw: (applicationId: number) => api.delete(`/applications/${applicationId}`),
};

export const adminAPI = {
  getAllUsers: () => api.get('/auth/users'),
  getUsersByRole: (role: string) => api.get(`/auth/users/role/${role}`),
  deleteUser: (userId: number) => api.delete(`/auth/users/${userId}`),
  toggleUserStatus: (userId: number) => api.patch(`/auth/users/${userId}/toggle-status`),
  getJobAnalytics: () => api.get('/jobs/analytics'),
};

export const inviteAPI = {
  // Admin endpoints (authenticated)
  createInvite: (inviteData: { email: string; role: string; companyName?: string; expirationDays: number }) =>
    api.post('/auth/admin/invite-user', inviteData),
  getAllPendingInvites: () => api.get('/auth/admin/invites'),
  revokeInvite: (token: string) => api.delete(`/auth/admin/invites/${token}/revoke`),
  
  // Public endpoints (no authentication)
  getInviteByToken: (token: string) => 
    axios.get(`${API_BASE_URL}/auth/invite/${token}`, {
      headers: { 'Content-Type': 'application/json' }
    }),
  acceptInvite: (acceptData: { token: string; username: string; password: string; firstName: string; lastName: string; phoneNumber?: string }) =>
    axios.post(`${API_BASE_URL}/auth/accept-invite`, acceptData, {
      headers: { 'Content-Type': 'application/json' }
    }),
};

export const fileUploadAPI = {
  uploadResume: (file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    return api.post('/files/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getUserFiles: () => api.get('/files/user'),
  getFileById: (fileId: number) => api.get(`/files/${fileId}`),
  deleteFile: (fileId: number) => api.delete(`/files/${fileId}`),
  downloadFile: (fileId: number) => api.get(`/files/${fileId}/download`, { 
    responseType: 'blob' 
  }),
  // HR endpoints
  getFilesForUser: (userId: number) => api.get(`/files/hr/user/${userId}`),
  getFileByIdForHR: (fileId: number) => api.get(`/files/hr/${fileId}`),
};

// Access Request API endpoints
export const accessRequestAPI = {
  // Public endpoint for creating requests (no auth needed)
  createRequest: (requestData: any) => 
    axios.post(`${API_BASE_URL}/public/access-requests`, requestData, {
      headers: { 'Content-Type': 'application/json' }
    }),
  // Admin endpoints (authenticated)
  getAllRequests: () => api.get('/admin/access-requests'),
  approveRequest: (requestId: number) => api.post(`/admin/access-requests/${requestId}/approve`),
  denyRequest: (requestId: number) => api.post(`/admin/access-requests/${requestId}/deny`),
  deleteRequest: (requestId: number) => api.delete(`/admin/access-requests/${requestId}`),
};

export default api;
