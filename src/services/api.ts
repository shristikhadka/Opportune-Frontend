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
};

export const applicationsAPI = {
  apply: (jobPostId: number) => 
    api.post('/applications', null, { params: { jobPostId } }),
  getUserApplications: () => api.get('/applications/user'),
  getJobApplications: (jobPostId: number) => api.get(`/applications/job/${jobPostId}`),
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

export default api;
