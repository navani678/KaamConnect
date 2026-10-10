import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import ErrorBoundary from './components/ErrorBoundary.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import PostJobPage from './pages/PostJobPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import MatchesPage from './pages/MatchesPage.jsx';
import WorkerProfilePage from './pages/WorkerProfilePage.jsx';
import BookingRequestPage from './pages/BookingRequestPage.jsx';
import BookingDetailPage from './pages/BookingDetailPage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import WorkerDashboard from './pages/WorkerDashboard.jsx';
import WorkerProfileEditor from './pages/WorkerProfileEditor.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-stone-50 selection:bg-amber-500 selection:text-stone-950 font-sans">
            <Navbar />
            <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/workers/:id" element={<WorkerProfilePage />} />

              {/* Customer Protected Routes */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/jobs/new"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <PostJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/jobs/:id"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <JobDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/jobs/:id/matches"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <MatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/jobs/:id/book/:workerId"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <BookingRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/bookings/:id/review"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <ReviewPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Booking Detail */}
              <Route
                path="/bookings/:id"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}>
                    <BookingDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Worker Protected Routes */}
              <Route
                path="/worker/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['worker', 'admin']}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/profile"
                element={
                  <ProtectedRoute allowedRoles={['worker', 'admin']}>
                    <WorkerProfileEditor />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}
