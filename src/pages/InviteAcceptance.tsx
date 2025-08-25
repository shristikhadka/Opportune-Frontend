import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inviteAPI } from '../services/api';
import { Invite, AcceptInviteRequest } from '../types';

const InviteAcceptance: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AcceptInviteRequest>({
    token: token || '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (token) {
      fetchInviteDetails();
    }
  }, [token]);

  const fetchInviteDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inviteAPI.getInviteByToken(token!);
      setInvite(response.data);
    } catch (err: any) {
      console.error('Error fetching invite details:', err);
      setError(err.response?.data?.message || 'Invalid or expired invite');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...fieldErrors };
    
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'First name is required';
        } else {
          delete newErrors.firstName;
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required';
        } else {
          delete newErrors.lastName;
        }
        break;
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'Username is required';
        } else if (value.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else {
          delete newErrors.username;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(newErrors);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setFieldErrors({});
      
      await inviteAPI.acceptInvite(formData);
      
      // Success - redirect to login page with success message
      navigate('/login', { 
        state: { 
          message: 'Account created successfully! You can now log in with your credentials.' 
        } 
      });
    } catch (err: any) {
      console.error('Error accepting invite:', err);
      
      // Handle validation errors
      if (err.response?.status === 400 && err.response?.data?.data) {
        // Field-specific validation errors
        setFieldErrors(err.response.data.data);
        setError('Please fix the validation errors below.');
      } else {
        // General error
        setError(err.response?.data?.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !invite || !invite.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Invalid Invite
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {error || 'This invitation link is invalid or has expired.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Accept Your Invitation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You've been invited to join as <span className="font-medium text-blue-600">{invite.role}</span>
            {invite.companyName && <span> at <span className="font-medium">{invite.companyName}</span></span>}
          </p>
        </div>

        {/* Invite Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invitation Details</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{invite.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="text-sm text-gray-900">{invite.role}</dd>
            </div>
            {invite.companyName && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="text-sm text-gray-900">{invite.companyName}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Expires</dt>
              <dd className="text-sm text-gray-900">{formatDate(invite.expiresAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Account Creation Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Your Account</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${fieldErrors.firstName ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="First name"
                  />
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${fieldErrors.lastName ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="Last name"
                  />
                  {fieldErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${fieldErrors.username ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Choose a username (3+ characters)"
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${fieldErrors.password ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Choose a secure password (6+ characters)"
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number (Optional)
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteAcceptance;