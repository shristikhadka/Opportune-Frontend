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
  search: (searchParams: any) => api.post('/jobs/search', searchParams),
  create: (jobData: any) => api.post('/jobs', jobData),
  update: (id: number, jobData: any) => api.put(`/jobs/${id}`, jobData),
  delete: (id: number) => api.delete(`/jobs/${id}`),
  getSuggestions: (query: string) => api.get(`/jobs/suggestions?q=${query}`),
};

export const applicationsAPI = {
  apply: (jobId: number, applicationData: any) => 
    api.post(`/applications/${jobId}`, applicationData),
  getUserApplications: () => api.get('/applications/user'),
  getJobApplications: (jobId: number) => api.get(`/applications/job/${jobId}`),
  updateStatus: (applicationId: number, status: string) => 
    api.put(`/applications/${applicationId}/status`, { status }),
};

export default api;
