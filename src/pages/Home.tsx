import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to JobApp
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find your dream job or hire the perfect candidate
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link
            to="/jobs"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium"
          >
            Browse Jobs
          </Link>
          
          {!user && (
            <Link
              to="/register"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-lg font-medium"
            >
              Get Started
            </Link>
          )}
        </div>

        {user && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome back, {user.firstName}!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/jobs"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <h3 className="font-medium text-gray-900">Browse Jobs</h3>
                <p className="text-sm text-gray-600">Find opportunities that match your skills</p>
              </Link>
              
              <Link
                to="/applications"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <h3 className="font-medium text-gray-900">My Applications</h3>
                <p className="text-sm text-gray-600">Track your job applications</p>
              </Link>
              
              {user.role === 'HR' && (
                <Link
                  to="/applications"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <h3 className="font-medium text-gray-900">Review Applications</h3>
                  <p className="text-sm text-gray-600">Manage job applications</p>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
