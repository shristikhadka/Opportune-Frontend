import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Layout/Header';
import './App.css';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="min-h-screen bg-gray-50">
            <React.Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                                  <Route path="/applications" element={<Applications />} />
                  <Route path="/applications/:applicationId" element={<ApplicationDetail />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/hr-dashboard" element={<HRDashboard />} />
              </Routes>
            </React.Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
