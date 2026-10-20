import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ClinicProvider } from './context/ClinicContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MouseGlow } from './components/common/MouseGlow';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { ProviderDetailPage } from './pages/ProviderDetailPage';
import { ContactPage } from './pages/ContactPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminHomepageEditor } from './pages/admin/AdminHomepageEditor';
import { AdminDoctors } from './pages/admin/AdminDoctors';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminDiagnostics } from './pages/admin/AdminDiagnostics';
import { AdminBlogs } from './pages/admin/AdminBlogs';
import { AdminMediaLibrary } from './pages/admin/AdminMediaLibrary';
import { AdminImagesManager } from './pages/admin/AdminImagesManager';
import { AdminInquiries } from './pages/admin/AdminInquiries';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminTheme } from './pages/admin/AdminTheme';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected Route Component
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs text-slate-500">
        Verifying administrative session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Public Layout Wrapper
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <MouseGlow />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/about-us"
              element={
                <PublicLayout>
                  <AboutPage />
                </PublicLayout>
              }
            />
            <Route
              path="/services"
              element={
                <PublicLayout>
                  <ServicesPage />
                </PublicLayout>
              }
            />
            <Route
              path="/services/:slug"
              element={
                <PublicLayout>
                  <ServiceDetailPage />
                </PublicLayout>
              }
            />
            <Route
              path="/providers"
              element={
                <PublicLayout>
                  <ProvidersPage />
                </PublicLayout>
              }
            />
            <Route
              path="/providers/:slug"
              element={
                <PublicLayout>
                  <ProviderDetailPage />
                </PublicLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicLayout>
                  <ContactPage />
                </PublicLayout>
              }
            />
            <Route
              path="/blog"
              element={
                <PublicLayout>
                  <BlogPage />
                </PublicLayout>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <PublicLayout>
                  <BlogDetailPage />
                </PublicLayout>
              }
            />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin CMS Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="images" element={<AdminImagesManager />} />
              <Route path="homepage" element={<AdminHomepageEditor />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="diagnostics" element={<AdminDiagnostics />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="media" element={<AdminMediaLibrary />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="theme" element={<AdminTheme />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ClinicProvider>
    </AuthProvider>
  );
}

export default App;
