import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 animate-pulse">
                Opportune
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8"></div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Where <span className="text-blue-600">Opportunity</span> Meets <span className="text-purple-600">Talent</span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover your perfect career opportunity or find exceptional talent. 
              Your next big break is just one click away.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Link
                to="/jobs"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">🔍 Explore Opportunities</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
              
              {!user && (
                <Link
                  to="/register"
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">🚀 Join Opportune</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
              )}
              
              {!user && (
                <Link
                  to="/request-access"
                  className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">🏢 Hire Talent</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Opportune?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We connect ambitious professionals with forward-thinking companies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Smart Matching</h4>
              <p className="text-gray-600 leading-relaxed">
                Our intelligent algorithm matches you with opportunities that align with your skills and career goals.
              </p>
            </div>
            
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Lightning Fast</h4>
              <p className="text-gray-600 leading-relaxed">
                Apply to jobs in seconds, track applications in real-time, and get instant notifications.
              </p>
            </div>
            
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Secure & Trusted</h4>
              <p className="text-gray-600 leading-relaxed">
                Your data is protected with enterprise-grade security. Only verified companies post jobs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Dashboard Section */}
      {user && (
        <div className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, <span className="text-blue-600">{user.firstName}</span>! 👋
              </h3>
              <p className="text-xl text-gray-600">
                Ready to take the next step in your career journey?
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link
                to="/jobs"
                className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-l-4 border-blue-500"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Browse Jobs</h4>
                </div>
                <p className="text-gray-600">
                  Discover new opportunities that match your expertise and interests
                </p>
              </Link>
              
              <Link
                to="/applications"
                className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-l-4 border-purple-500"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors duration-300">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">My Applications</h4>
                </div>
                <p className="text-gray-600">
                  Track your job applications and monitor their progress
                </p>
              </Link>
              
              {user.role === 'HR' && (
                <Link
                  to="/hr-dashboard"
                  className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-l-4 border-green-500"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors duration-300">
                      <span className="text-2xl">👥</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">HR Dashboard</h4>
                  </div>
                  <p className="text-gray-600">
                    Manage job postings and review candidate applications
                  </p>
                </Link>
              )}
              
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-l-4 border-red-500"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors duration-300">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Admin Panel</h4>
                  </div>
                  <p className="text-gray-600">
                    Manage users, analytics, and system configuration
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
