import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { applicationsAPI, fileUploadAPI, resumeAnalyticsAPI } from '../services/api';
import { Application } from '../types';

const ApplicationDetail: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [loadingParsedResume, setLoadingParsedResume] = useState(false);
  const [aiStatus, setAiStatus] = useState<any>(null);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetail();
    }
  }, [applicationId]);

  useEffect(() => {
    if (user?.role === 'HR' && applicationId) {
      fetchAIStatus();
      fetchParsedResume();
    }
  }, [user, applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsAPI.getApplicationById(parseInt(applicationId!));
      setApplication(response.data);
    } catch (err: any) {
      console.error('Error fetching application details:', err);
      if (err.response?.status === 404) {
        setError('Application not found');
      } else if (err.response?.status === 403) {
        setError('Access denied. You can only view your own applications.');
      } else {
        setError('Failed to load application details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAIStatus = async () => {
    try {
      const response = await resumeAnalyticsAPI.getAIStatus();
      setAiStatus(response.data);
    } catch (err) {
      console.error('Error fetching AI status:', err);
    }
  };

  const fetchParsedResume = async () => {
    try {
      setLoadingParsedResume(true);
      const response = await resumeAnalyticsAPI.getParsedResume(parseInt(applicationId!));
      setParsedResume(response.data);
    } catch (err: any) {
      console.error('Error fetching parsed resume:', err);
      if (err.response?.status !== 404) {
        console.warn('Parsed resume data not available for this application');
      }
    } finally {
      setLoadingParsedResume(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application) return;

    try {
      setUpdatingStatus(true);
      await applicationsAPI.updateStatus(application.id, newStatus);
      setApplication({ ...application, status: newStatus as any });
      alert('Application status updated successfully!');
    } catch (err: any) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleWithdraw = async () => {
    if (!application) return;

    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      setWithdrawing(true);
      await applicationsAPI.withdraw(application.id);
      alert('Application withdrawn successfully');
      navigate('/applications');
    } catch (err: any) {
      console.error('Error withdrawing application:', err);
      alert('Failed to withdraw application. Please try again.');
    } finally {
      setWithdrawing(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800';
      case 'INTERVIEW': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800';
      case 'HIRED': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800';
      case 'REJECTED': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
    }
  };

  const getStatusIconColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'INTERVIEW': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'HIRED': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'REJECTED': return 'bg-gradient-to-r from-red-500 to-rose-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'INTERVIEW':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'HIRED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'REJECTED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-gradient-to-r from-red-100 to-rose-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-4">Application Not Found</h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">{error || 'The application you are looking for does not exist.'}</p>
            <Link
              to="/applications"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Application Details
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Job application for {application.jobTitle}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8"></div>
          <Link
            to={user?.role === 'HR' ? "/hr-dashboard" : "/applications"}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {user?.role === 'HR' ? 'Back to Dashboard' : 'Back to Applications'}
          </Link>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Status */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Application Status</h2>
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 ${getStatusIconColor(application.status)} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                {getStatusIcon(application.status)}
              </div>
              <div>
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${getStatusColor(application.status)} shadow-sm border`}>
                  {application.status}
                </span>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Last updated: {formatDate(application.updatedAt)}
                </p>
              </div>
            </div>

            {/* Status Update (HR Only) */}
            {user?.role === 'HR' && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updatingStatus}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 transition-all duration-200 bg-white font-medium"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="HIRED">Hired</option>
                  </select>
                  {updatingStatus && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Job Details</h2>
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{application.jobTitle}</h3>
                  <p className="text-gray-600 font-medium">{application.company}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Applied Date</p>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(application.appliedAt)}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <p className="text-sm font-semibold text-purple-800 mb-1">Application ID</p>
                  <p className="text-sm text-gray-900 font-medium">#{application.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Application Timeline</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900">Application Submitted</p>
                  <p className="text-sm text-gray-600 font-medium">{formatDate(application.appliedAt)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 ${getStatusIconColor(application.status)} rounded-xl flex items-center justify-center shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900">Status Updated</p>
                  <p className="text-sm text-gray-600 font-medium">{formatDate(application.updatedAt)}</p>
                  <p className="text-sm text-gray-500">Status changed to <span className="font-semibold text-gray-700">{application.status}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Resume Analysis (HR Only) */}
          {user?.role === 'HR' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Resume Analysis</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">
                    {aiStatus?.service || 'AI Service'}
                  </span>
                </div>
              </div>

              {loadingParsedResume ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Analyzing resume...</span>
                </div>
              ) : parsedResume ? (
                <div className="space-y-6">
                  {/* Resume Quality Score */}
                  {parsedResume.resumeQuality && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">Resume Quality Assessment</h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">Overall Score</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {parsedResume.resumeQuality.score}/{parsedResume.resumeQuality.maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${parsedResume.resumeQuality.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700 font-medium">{parsedResume.resumeQuality.percentage}%</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          parsedResume.resumeQuality.rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                          parsedResume.resumeQuality.rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                          parsedResume.resumeQuality.rating === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {parsedResume.resumeQuality.rating}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Candidate Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parsedResume.candidateName && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm font-semibold text-blue-800 mb-1">Candidate Name</p>
                        <p className="text-sm text-gray-900 font-medium">{parsedResume.candidateName}</p>
                      </div>
                    )}
                    {parsedResume.email && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                        <p className="text-sm font-semibold text-green-800 mb-1">Email</p>
                        <p className="text-sm text-gray-900 font-medium">{parsedResume.email}</p>
                      </div>
                    )}
                    {parsedResume.phone && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                        <p className="text-sm font-semibold text-yellow-800 mb-1">Phone</p>
                        <p className="text-sm text-gray-900 font-medium">{parsedResume.phone}</p>
                      </div>
                    )}
                    {parsedResume.yearsOfExperience !== null && parsedResume.yearsOfExperience !== undefined && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                        <p className="text-sm font-semibold text-purple-800 mb-1">Years of Experience</p>
                        <p className="text-sm text-gray-900 font-medium">{parsedResume.yearsOfExperience} years</p>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {parsedResume.skills && parsedResume.skills.length > 0 && (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                      <h3 className="text-lg font-semibold text-indigo-800 mb-3">Skills Identified</h3>
                      <div className="flex flex-wrap gap-2">
                        {parsedResume.skills.map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-shadow"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Summary */}
                  {parsedResume.experienceSummary && (
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Experience Summary</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{parsedResume.experienceSummary}</p>
                    </div>
                  )}

                  {/* Education Summary */}
                  {parsedResume.educationSummary && (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-100">
                      <h3 className="text-lg font-semibold text-teal-800 mb-3">Education Summary</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{parsedResume.educationSummary}</p>
                    </div>
                  )}

                  {/* AI Confidence & Parse Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parsedResume.confidenceScore && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                        <p className="text-sm font-semibold text-orange-800 mb-1">AI Confidence Score</p>
                        <p className="text-sm text-gray-900 font-medium">{Math.round(parsedResume.confidenceScore * 100)}%</p>
                      </div>
                    )}
                    {parsedResume.parsedAt && (
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Parsed On</p>
                        <p className="text-sm text-gray-900 font-medium">{formatDate(parsedResume.parsedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No AI analysis available for this resume</p>
                  <p className="text-sm text-gray-500 mt-2">The resume may not have been processed yet or AI parsing is not enabled</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Actions</h2>
            <div className="space-y-4">
              {user?.role === 'USER' && application.status === 'APPLIED' && (
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  {withdrawing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Withdraw Application
                    </>
                  )}
                </button>
              )}
              
              <Link
                to={`/jobs/${application.jobPostId}`}
                className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Job Details
              </Link>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Quick Info</h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm font-semibold text-blue-800 mb-1">Application ID</p>
                <p className="text-sm text-gray-900 font-bold">#{application.id}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                <p className="text-sm font-semibold text-purple-800 mb-1">Job ID</p>
                <p className="text-sm text-gray-900 font-bold">#{application.jobPostId}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <p className="text-sm font-semibold text-green-800 mb-1">Applicant</p>
                <p className="text-sm text-gray-900 font-bold">
                  {application.userFirstName && application.userLastName 
                    ? `${application.userFirstName} ${application.userLastName}`
                    : application.userName || `User #${application.userId}`
                  }
                </p>
                {application.userEmail && (
                  <p className="text-xs text-green-600 mt-1 font-medium">{application.userEmail}</p>
                )}
              </div>
              {application.resumeFileName && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-100">
                  <p className="text-sm font-semibold text-orange-800 mb-2">Resume</p>
                  <div className="flex items-center text-sm text-gray-900 mb-2">
                    <svg className="w-4 h-4 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{application.resumeFileName}</span>
                  </div>
                  {application.resumeFileId && (
                    <button
                      onClick={() => handleViewResume(application.resumeFileId!)}
                      className="px-3 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-all duration-200 font-semibold text-xs shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      View Resume
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
