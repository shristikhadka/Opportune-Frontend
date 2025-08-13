import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { applicationsAPI } from '../services/api';
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

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetail();
    }
  }, [applicationId]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-100 text-blue-800';
      case 'INTERVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'HIRED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The application you are looking for does not exist.'}</p>
          <Link
            to="/applications"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600 mt-2">Job application for {application.jobTitle}</p>
          </div>
          <Link
            to="/applications"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Applications
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Status</h2>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${getStatusColor(application.status)}`}>
                {getStatusIcon(application.status)}
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  Last updated: {formatDate(application.updatedAt)}
                </p>
              </div>
            </div>

            {/* Status Update (HR Only) */}
            {user?.role === 'HR' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Update Status</h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updatingStatus}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="HIRED">Hired</option>
                  </select>
                  {updatingStatus && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{application.jobTitle}</h3>
                <p className="text-gray-600">{application.company}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Applied Date</p>
                  <p className="text-sm text-gray-900">{formatDate(application.appliedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Application ID</p>
                  <p className="text-sm text-gray-900">#{application.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                  <p className="text-sm text-gray-600">{formatDate(application.appliedAt)}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Status Updated</p>
                  <p className="text-sm text-gray-600">{formatDate(application.updatedAt)}</p>
                  <p className="text-sm text-gray-500">Status changed to {application.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {user?.role === 'USER' && application.status === 'APPLIED' && (
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                </button>
              )}
              
              <Link
                to={`/jobs/${application.jobPostId}`}
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
              >
                View Job Details
              </Link>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Application ID</p>
                <p className="text-sm text-gray-900">#{application.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Job ID</p>
                <p className="text-sm text-gray-900">#{application.jobPostId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="text-sm text-gray-900">#{application.userId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
