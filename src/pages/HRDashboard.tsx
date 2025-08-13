import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { applicationsAPI, jobsAPI } from '../services/api';
import { Application, JobPost } from '../types';

const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'post-job' | 'my-jobs' | 'applications'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Job posting state
  const [jobForm, setJobForm] = useState({
    postProfile: '',
    postDesc: '',
    postTechStack: '',
    reqExperience: 0,
    location: '',
    salary: 0,
    company: ''
  });
  
  // Data state
  const [myJobs, setMyJobs] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    recentApplications: 0
  });

  useEffect(() => {
    if (user && user.role === 'HR') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch HR's jobs and applications
      const [jobsResponse, applicationsResponse] = await Promise.all([
        jobsAPI.getMyJobs(),
        applicationsAPI.getMyJobApplications()
      ]);
      
      setMyJobs(jobsResponse.data || []);
      setApplications(applicationsResponse.data || []);
      
      // Calculate stats
      const totalJobs = jobsResponse.data?.length || 0;
      const totalApplications = applicationsResponse.data?.length || 0;
      const pendingApplications = applicationsResponse.data?.filter((app: Application) => app.status === 'APPLIED').length || 0;
      const recentApplications = applicationsResponse.data?.filter((app: Application) => {
        const appDate = new Date(app.appliedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return appDate > weekAgo;
      }).length || 0;
      
      setStats({
        totalJobs,
        totalApplications,
        pendingApplications,
        recentApplications
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJobFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobForm(prev => ({
      ...prev,
      [name]: name === 'reqExperience' || name === 'salary' ? parseInt(value) || 0 : value
    }));
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobForm.postProfile || !jobForm.postDesc || !jobForm.location || !jobForm.salary) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      
      // Convert tech stack string to array
      const techStackArray = jobForm.postTechStack
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);
      
      const jobData = {
        ...jobForm,
        postTechStack: techStackArray,
        company: user?.companyName || 'Your Company'
      };
      
      await jobsAPI.create(jobData);
      alert('Job posted successfully!');
      
      // Reset form and refresh data
      setJobForm({
        postProfile: '',
        postDesc: '',
        postTechStack: '',
        reqExperience: 0,
        location: '',
        salary: 0,
        company: ''
      });
      
      fetchDashboardData();
      setActiveTab('my-jobs');
    } catch (err: any) {
      console.error('Error posting job:', err);
      let errorMessage = 'Failed to post job. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      alert('Application status updated successfully!');
      fetchDashboardData();
    } catch (err: any) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status. Please try again.');
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'bg-yellow-100 text-yellow-800';
      case 'INTERVIEW': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'HIRED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Debug: Log user info
  console.log('🔍 HR Dashboard - User:', user);
  console.log('🔍 HR Dashboard - User role:', user?.role);
  
  if (!user || user.role !== 'HR') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">
            {!user ? 'Please log in to access this dashboard.' : 
             `You need HR manager privileges to access this dashboard. Current role: ${user.role}`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Dashboard</h1>
        <p className="text-gray-600">Manage your company's job postings and applications</p>
        {user?.companyName && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Company:</span> {user.companyName}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'post-job', label: 'Post Job' },
            { id: 'my-jobs', label: 'My Jobs' },
            { id: 'applications', label: 'Applications' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recentApplications}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post Job Tab */}
          {activeTab === 'post-job' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Post New Job</h2>
              {user?.companyName && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Posting for company:</span> {user.companyName}
                  </p>
                </div>
              )}
              <form onSubmit={handlePostJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="postProfile" className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      id="postProfile"
                      name="postProfile"
                      value={jobForm.postProfile}
                      onChange={handleJobFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Senior React Developer"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={jobForm.location}
                      onChange={handleJobFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., New York, NY or Remote"
                    />
                  </div>

                  <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                      Salary (USD) *
                    </label>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      value={jobForm.salary}
                      onChange={handleJobFormChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 80000"
                    />
                  </div>

                  <div>
                    <label htmlFor="reqExperience" className="block text-sm font-medium text-gray-700 mb-2">
                      Required Experience (years)
                    </label>
                    <select
                      id="reqExperience"
                      name="reqExperience"
                      value={jobForm.reqExperience}
                      onChange={handleJobFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>Entry Level (0 years)</option>
                      <option value={1}>1+ years</option>
                      <option value={2}>2+ years</option>
                      <option value={3}>3+ years</option>
                      <option value={5}>5+ years</option>
                      <option value={7}>7+ years</option>
                      <option value={10}>10+ years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="postTechStack" className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="postTechStack"
                    name="postTechStack"
                    value={jobForm.postTechStack}
                    onChange={handleJobFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., React, TypeScript, Node.js"
                  />
                </div>

                <div>
                  <label htmlFor="postDesc" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    id="postDesc"
                    name="postDesc"
                    value={jobForm.postDesc}
                    onChange={handleJobFormChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the role, responsibilities, and requirements..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Posting...' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* My Jobs Tab */}
          {activeTab === 'my-jobs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Posted Jobs</h2>
                <button
                  onClick={() => setActiveTab('post-job')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Post New Job
                </button>
              </div>

              {myJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600">Start by posting your first job opening.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myJobs.map((job) => (
                    <div key={job.postId} className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.postProfile}</h3>
                      <p className="text-sm text-gray-600 mb-4">{job.company}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          {formatSalary(job.salary)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Posted {formatDate(job.postDate)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveTab('applications')}
                          className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          View Applications
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Job Applications</h2>
              {user?.companyName && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <p className="text-sm text-purple-800">
                    <span className="font-medium">Applications for company:</span> {user.companyName}
                  </p>
                </div>
              )}

              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Applications will appear here once candidates apply to your jobs.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {application.userId} {/* We'll need to fetch user details */}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{application.jobTitle}</div>
                              <div className="text-sm text-gray-500">{application.company}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(application.appliedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <select
                                value={application.status}
                                onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value)}
                                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="APPLIED">Applied</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="HIRED">Hired</option>
                              </select>
                              <Link
                                to={`/applications/${application.id}`}
                                className="text-blue-600 hover:text-blue-900 text-sm"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HRDashboard;
