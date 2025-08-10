// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'HR' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

// Job related types
export interface JobPost {
  postId: number;
  company: string;
  location: string;
  postProfile: string;
  postDesc: string;
  reqExperience: number;
  salary: number;
  postDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobSearchRequest {
  query?: string;
  location?: string;
  company?: string;
  minSalary?: number;
  maxSalary?: number;
  minExperience?: number;
  maxExperience?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface JobSearchResponse {
  jobs: JobPost[];
  metadata: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// Application related types
export interface Application {
  id: number;
  jobId: number;
  userId: number;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
  job?: JobPost;
  user?: User;
}

// Auth related types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// File upload types
export interface FileUpload {
  id: number;
  originalFilename: string;
  s3Key: string;
  fileType: string;
  fileSize: number;
  contentType: string;
  scanStatus: 'PENDING' | 'CLEAN' | 'INFECTED';
  verified: boolean;
  description?: string;
  uploadedAt: string;
}

// Search suggestion types
export interface SearchSuggestion {
  type: 'company' | 'location' | 'profile';
  value: string;
  count: number;
}
