import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { Loader2 } from 'lucide-react';

// Code splitting / Lazy Loading views for performance optimization
const Dashboard = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Upload = lazy(() => import('../pages/Upload').then((m) => ({ default: m.Upload })));
const ViewerPage = lazy(() => import('../pages/ViewerPage').then((m) => ({ default: m.ViewerPage })));
const Login = lazy(() => import('../pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('../pages/Register').then((m) => ({ default: m.Register })));

// Loading spinner fallback during view streaming
const PageFallback = () => (
  <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-3 text-neutral-400">
    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    <span className="text-xs uppercase tracking-widest font-semibold">Streaming Modules...</span>
  </div>
);

// Route guard: Restricts access to authenticated users only
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageFallback />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

// Route guard: Redirects signed-in users away from authentication panels
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageFallback />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Guest Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Dashboard/Viewer Routes inside MainLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="viewer/:id" element={<ViewerPage />} />
        </Route>

        {/* Global Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
