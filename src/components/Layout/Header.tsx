import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
              Opportune
            </Link>
          </div>

          <nav className="hidden md:flex space-x-2">
            <Link
              to="/jobs"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            >
              Jobs
            </Link>
            {user?.role === 'USER' && (
              <>
                <Link
                  to="/applications"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  Applications
                </Link>
                <Link
                  to="/files"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  My Files
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  Profile
                </Link>
              </>
            )}
            {user?.role === 'HR' && (
              <>
                <Link
                  to="/hr-dashboard"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  HR Dashboard
                </Link>
                <Link
                  to="/applications"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  Applications
                </Link>
                <Link
                  to="/files"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  My Files
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  Profile
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-xl">
                  Welcome, {user.firstName}!
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
