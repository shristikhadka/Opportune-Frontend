import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Layout/Header';
import { AuthProvider } from './hooks/useAuth';

// Lazy load components for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Jobs = React.lazy(() => import('./pages/Jobs'));
const JobDetail = React.lazy(() => import('./pages/JobDetail'));
const Applications = React.lazy(() => import('./pages/Applications'));
const ApplicationDetail = React.lazy(() => import('./pages/ApplicationDetail'));
const Admin = React.lazy(() => import('./pages/Admin'));
const HRDashboard = React.lazy(() => import('./pages/HRDashboard'));
const FileManagement = React.lazy(() => import('./pages/FileManagement'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const InviteAcceptance = React.lazy(() => import('./pages/InviteAcceptance'));
const RequestAccess = React.lazy(() => import('./pages/RequestAccess'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <React.Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
            <Routes>
              {/* Standalone invite page without header */}
              <Route path="/invite/:token" element={<InviteAcceptance />} />
              
              {/* All other routes with header */}
              <Route path="*" element={
                <>
                  <Header />
                  <main className="min-h-screen bg-gray-50">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/jobs/:id" element={<JobDetail />} />
                      <Route path="/applications" element={<Applications />} />
                      <Route path="/applications/:applicationId" element={<ApplicationDetail />} />
                      <Route path="/files" element={<FileManagement />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/hr-dashboard" element={<HRDashboard />} />
                      <Route path="/request-access" element={<RequestAccess />} />
                    </Routes>
                  </main>
                </>
              } />
            </Routes>
          </React.Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
