import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { applicationsAPI, fileUploadAPI, jobsAPI } from '../services/api';
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
      
      // Debug: Log the applications data to see what we're getting
      console.log('🔍 HR Dashboard - Applications data:', applicationsResponse.data);
      
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

  const handleViewResume = async (resumeFileId: number) => {
    try {
      const response = await fileUploadAPI.getFileByIdForHR(resumeFileId);
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      } else {
        alert('Resume file not available for download.');
      }
    } catch (err) {
      console.error('Error viewing resume:', err);
      alert('Failed to view resume. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            HR Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Manage your company's job postings and applications with ease
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mt-6"></div>
          {user?.companyName && (
            <div className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50 rounded-2xl shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-blue-800">
                {user.companyName}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 border border-gray-100">
          <nav className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'post-job', label: 'Post Job', icon: '📝' },
              { id: 'my-jobs', label: 'My Jobs', icon: '💼' },
              { id: 'applications', label: 'Applications', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Quick Access to AI Features */}
        <div className="text-center mb-8">
          <Link
            to="/candidate-search"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            🤖 AI-Powered Candidate Search
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading dashboard data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 mx-auto max-w-2xl">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">Dashboard Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Tab Content */}
      {!loading && (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Jobs</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalJobs}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Applications</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.totalApplications}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Pending Review</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{stats.pendingApplications}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">This Week</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.recentApplications}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post Job Tab */}
          {activeTab === 'post-job' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Post New Job</h2>
                <p className="text-gray-600">Create an exciting opportunity for talented candidates</p>
              </div>
              <form onSubmit={handlePostJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="postProfile" className="block text-sm font-semibold text-gray-800 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      id="postProfile"
                      name="postProfile"
                      value={jobForm.postProfile}
                      onChange={handleJobFormChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="e.g., Senior React Developer"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-800 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={jobForm.location}
                      onChange={handleJobFormChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="e.g., New York, NY or Remote"
                    />
                  </div>

                  <div>
                    <label htmlFor="salary" className="block text-sm font-semibold text-gray-800 mb-2">
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="e.g., 80000"
                    />
                  </div>

                  <div>
                    <label htmlFor="reqExperience" className="block text-sm font-semibold text-gray-800 mb-2">
                      Required Experience (years)
                    </label>
                    <select
                      id="reqExperience"
                      name="reqExperience"
                      value={jobForm.reqExperience}
                      onChange={handleJobFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
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
                  <label htmlFor="postTechStack" className="block text-sm font-semibold text-gray-800 mb-2">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="postTechStack"
                    name="postTechStack"
                    value={jobForm.postTechStack}
                    onChange={handleJobFormChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., React, TypeScript, Node.js"
                  />
                </div>

                <div>
                  <label htmlFor="postDesc" className="block text-sm font-semibold text-gray-800 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    id="postDesc"
                    name="postDesc"
                    value={jobForm.postDesc}
                    onChange={handleJobFormChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Describe the role, responsibilities, and requirements..."
                  />
                </div>

                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Posting Job...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Post New Job
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* My Jobs Tab */}
          {activeTab === 'my-jobs' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Posted Jobs</h2>
                  <p className="text-gray-600 mt-1">Manage and track your job postings</p>
                </div>
                <button
                  onClick={() => setActiveTab('post-job')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Post New Job
                </button>
              </div>

              {myJobs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No jobs posted yet</h3>
                  <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">Start attracting top talent by posting your first job opening!</p>
                  <button
                    onClick={() => setActiveTab('post-job')}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Post Your First Job
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myJobs.map((job) => (
                    <div key={job.postId} className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                              {job.postProfile}
                            </h3>
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <p className="text-sm font-semibold text-gray-700">{job.company}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              job.reqExperience === 0 
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' 
                                : job.reqExperience <= 2
                                ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800'
                                : job.reqExperience <= 5
                                ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800'
                                : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800'
                            }`}>
                              {job.reqExperience === 0 ? 'Entry Level' : `${job.reqExperience}+ years`}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                            </div>
                            <span className="font-medium">{job.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <span className="font-bold text-gray-900">{formatSalary(job.salary)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="font-medium">Posted {formatDate(job.postDate)}</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setActiveTab('applications')}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            View Applications
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Job Applications</h2>
                <p className="text-gray-600">Review and manage candidate applications</p>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No applications yet</h3>
                  <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">Applications will appear here once talented candidates discover and apply to your job postings.</p>
                  <button
                    onClick={() => setActiveTab('post-job')}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Post a Job to Get Started
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            👤 Applicant
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            💼 Job Position
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            📅 Applied Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            📈 Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            ⚙️ Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {applications.map((application) => (
                          <tr key={application.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-4">
                                  <span className="text-white font-semibold text-sm">
                                    {application.userFirstName && application.userLastName 
                                      ? `${application.userFirstName[0]}${application.userLastName[0]}`
                                      : application.userName?.[0] || 'U'
                                    }
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">
                                    {application.userFirstName && application.userLastName 
                                      ? `${application.userFirstName} ${application.userLastName}`
                                      : application.userName || `User #${application.userId}`
                                    }
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {application.userEmail || 'No email provided'}
                                  </div>
                                  {application.resumeFileName && (
                                    <div className="text-xs text-blue-600 mt-1 flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                      </svg>
                                      {application.resumeFileName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{application.jobTitle}</div>
                                <div className="text-sm text-gray-600">{application.company}</div>
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-600 font-medium">
                              {formatDate(application.appliedAt)}
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                application.status === 'APPLIED' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' :
                                application.status === 'INTERVIEW' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800' :
                                application.status === 'REJECTED' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800' :
                                application.status === 'HIRED' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' :
                                'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                              }`}>
                                {application.status}
                              </span>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-3">
                                <select
                                  value={application.status}
                                  onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value)}
                                  className="text-sm border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
                                >
                                  <option value="APPLIED">Applied</option>
                                  <option value="INTERVIEW">Interview</option>
                                  <option value="REJECTED">Rejected</option>
                                  <option value="HIRED">Hired</option>
                                </select>
                                <Link
                                  to={`/applications/${application.id}`}
                                  className="px-3 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-xl hover:from-blue-200 hover:to-cyan-200 transition-all duration-200 font-semibold"
                                >
                                  View
                                </Link>
                                {application.resumeFileId && (
                                  <button
                                    onClick={() => handleViewResume(application.resumeFileId!)}
                                    className="px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl hover:from-green-200 hover:to-emerald-200 transition-all duration-200 font-semibold"
                                  >
                                    Resume
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default HRDashboard;
