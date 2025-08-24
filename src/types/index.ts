// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'HR' | 'ADMIN';
  enabled: boolean;
  companyName?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Job related types
export interface JobPost {
  postId: number;
  postProfile: string;
  postDesc: string;
  postTechStack: string[];
  reqExperience: number;
  location: string;
  salary: number;
  company: string;
  postDate: string;
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
  useFullTextSearch?: boolean;
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

export interface JobAnalytics {
  totalJobs: number;
  jobsByExperienceLevel: Record<string, number>;
  topTechnologies: Record<string, number>;
  jobsByCompany: Record<string, number>;
  jobsPostedThisWeek: number;
  jobsPostedThisMonth: number;
}

// Application related types
export interface Application {
  id: number;
  jobPostId: number;
  jobTitle: string;
  company: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  status: 'APPLIED' | 'INTERVIEW' | 'REJECTED' | 'HIRED';
  appliedAt: string;
  updatedAt: string;
  resumeFileId?: number;
  resumeFileName?: string;
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
  uploadDate: string;
  scanStatus: 'PENDING' | 'SCANNING' | 'CLEAN' | 'INFECTED' | 'ERROR';
  verified: boolean;
  expiresAt?: string;
  description?: string;
  downloadUrl?: string;
}

// Search suggestion types
export interface SearchSuggestion {
  type: 'company' | 'location' | 'profile';
  value: string;
  count: number;
}

// Invite related types
export interface Invite {
  id: number;
  email: string;
  role: 'USER' | 'HR' | 'ADMIN';
  token: string;
  companyName?: string;
  invitedByUsername: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  isActive: boolean;
  isExpired: boolean;
  isAccepted: boolean;
  isValid: boolean;
}

export interface CreateInviteRequest {
  email: string;
  role: 'USER' | 'HR' | 'ADMIN';
  companyName?: string;
  expirationDays: number;
}

export interface AcceptInviteRequest {
  token: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

// Access Request related types
export interface AccessRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  requestedRole: 'HR' | 'ADMIN';
  message?: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CreateAccessRequestRequest {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  requestedRole: 'HR' | 'ADMIN';
  message?: string;
}
