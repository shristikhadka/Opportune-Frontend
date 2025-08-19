import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FileUploadComponent from '../components/FileUpload';
import { useAuth } from '../hooks/useAuth';
import { applicationsAPI, fileUploadAPI, jobsAPI } from '../services/api';
import { FileUpload, JobPost } from '../types';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<JobPost | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [userFiles, setUserFiles] = useState<FileUpload[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      fetchRelatedJobs();
    }
  }, [id]);

  useEffect(() => {
    if (user && user.role === 'USER') {
      fetchUserFiles();
    }
  }, [user]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsAPI.getById(parseInt(id!));
      setJob(response.data);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedJobs = async () => {
    try {
      // Fetch jobs with similar technology stack
      if (job?.postTechStack && job.postTechStack.length > 0) {
        const techStack = job.postTechStack[0]; // Use first technology
        const response = await jobsAPI.search({
          technology: techStack,
          page: 0,
          size: 3,
          useFullTextSearch: false
        });
        
        // Filter out the current job and get up to 3 related jobs
        const related = (response.data.jobs || response.data)
          .filter((j: JobPost) => j.postId !== parseInt(id!))
          .slice(0, 3);
        setRelatedJobs(related);
      }
    } catch (err) {
      console.error('Error fetching related jobs:', err);
      // Don't set error for related jobs, it's not critical
    }
  };

  const fetchUserFiles = async () => {
    try {
      setLoadingFiles(true);
      const response = await fileUploadAPI.getUserFiles();
      setUserFiles(response.data);
    } catch (err) {
      console.error('Error fetching user files:', err);
      // Don't set error for files, it's not critical for job application
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Prevent admins and HR managers from applying for jobs
    if (user.role === 'ADMIN' || user.role === 'HR') {
      alert('Administrators and HR managers cannot apply for jobs. Please use a regular user account.');
      return;
    }

    try {
      setApplying(true);
      await applicationsAPI.apply(parseInt(id!), selectedFile?.id);
      alert('Application submitted successfully! You can track your application status in the Applications page.');
      navigate('/applications');
    } catch (err: any) {
      console.error('Error applying for job:', err);
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }
      
      alert(errorMessage);
    } finally {
      setApplying(false);
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Loading job details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="bg-gradient-to-r from-red-100 to-rose-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
            <Link
              to="/jobs"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/jobs"
            className="inline-flex items-center px-4 py-2 bg-white rounded-xl shadow-md border border-gray-100 text-blue-600 hover:text-blue-800 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </Link>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Job Content */}
        <div className="lg:col-span-2">
          {/* Job Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">{job.postProfile}</h1>
                <p className="text-xl text-gray-600 mb-4">{job.company}</p>
                <div className="flex items-center text-gray-500 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                  {job.reqExperience === 0 ? 'Entry Level' : `${job.reqExperience}+ years`}
                </span>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-semibold text-gray-900">{formatSalary(job.salary)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-semibold text-gray-900">{job.reqExperience === 0 ? 'Entry Level' : `${job.reqExperience}+ years`}</p>
                </div>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Posted</p>
                  <p className="font-semibold text-gray-900">{formatDate(job.postDate)}</p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            {job.postTechStack && job.postTechStack.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.postTechStack.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.postDesc}</p>
            </div>
          </div>

          {/* Apply Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">Apply for this Position</h2>
            
            {user && (user.role === 'ADMIN' || user.role === 'HR') ? (
              <div className="text-center">
                <button
                  disabled
                  className="w-full md:w-auto px-8 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed font-medium"
                >
                  Not Available for Admin/HR
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Administrators and HR managers cannot apply for jobs.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Resume Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Your Resume</h3>
                  
                  {/* Existing Files */}
                  {userFiles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Choose from your uploaded files:</p>
                      <div className="space-y-2">
                        {userFiles.map((file) => (
                          <div
                            key={file.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedFile?.id === file.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedFile(file)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{file.originalFilename}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(file.uploadDate).toLocaleDateString()} • {Math.round(file.fileSize / 1024)} KB
                                  </p>
                                </div>
                              </div>
                              {selectedFile?.id === file.id && (
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload New File */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {showFileUpload ? 'Cancel Upload' : '+ Upload New Resume'}
                    </button>
                  </div>

                  {/* File Upload Component */}
                  {showFileUpload && (
                    <div className="mb-4">
                      <FileUploadComponent
                        onUploadSuccess={(file) => {
                          setUserFiles(prev => [file, ...prev]);
                          setSelectedFile(file);
                          setShowFileUpload(false);
                        }}
                        onUploadError={(error) => {
                          alert(error);
                        }}
                        showDescription={false}
                      />
                    </div>
                  )}

                  {/* No Files Message */}
                  {userFiles.length === 0 && !showFileUpload && (
                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">No resumes uploaded yet</p>
                      <button
                        type="button"
                        onClick={() => setShowFileUpload(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Upload your first resume
                      </button>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleApply}
                    disabled={applying || (!selectedFile && userFiles.length > 0)}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {applying ? 'Submitting...' : 'Apply Now'}
                  </button>
                  {userFiles.length > 0 && !selectedFile && (
                    <p className="text-sm text-red-600 mt-2">Please select a resume to continue</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Company Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">About {job.company}</h3>
            <p className="text-gray-600 mb-4">
              We are a dynamic company looking for talented individuals to join our team.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {formatSalary(job.salary)}
              </div>
            </div>
          </div>

          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Similar Jobs</h3>
              <div className="space-y-4">
                {relatedJobs.map((relatedJob) => (
                  <Link
                    key={relatedJob.postId}
                    to={`/jobs/${relatedJob.postId}`}
                    className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">{relatedJob.postProfile}</h4>
                    <p className="text-sm text-gray-600 mb-2">{relatedJob.company}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{relatedJob.location}</span>
                      <span>{formatSalary(relatedJob.salary)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default JobDetail;
