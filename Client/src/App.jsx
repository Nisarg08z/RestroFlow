import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPageLayout from './Layouts/LandingPageLayout';
import AdminPageLayout from './Layouts/AdminPageLayout'
import LandingPage from './pages/LandingPage/LandingPage';
import PrivacyPage from './pages/LandingPage/PrivacyPage';
import TermsOfService from './pages/LandingPage/TermsOfService';
import CookiePage from './pages/LandingPage/CookiePage';
import AboutUs from './pages/LandingPage/AboutUs';
import LoginPage from './pages/LandingPage/LoginPage';
import ForgotPassword from './pages/LandingPage/ForgotPassword';
import CompleteSignup from './pages/LandingPage/CompleteSignup';
import PaymentPage from './pages/LandingPage/PaymentPage';
import AdminLoginPage from './pages/AdminPage/AdminLoginPage'
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminDashboard, RestaurantRequests, SubscriptionManagement, RestaurantStatus, AdminSupportTickets } from './components/AdminPageComponents'
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';
import NotFound from './pages/NotFound';
import ManagerWelcome from './pages/ManagerPage/ManagerWelcome';
import ProfilePage from './pages/ManagerPage/ProfilePage';
import SupportPage from './pages/ManagerPage/SupportPage';
import LocationDashboard from './pages/ManagerPage/LocationDashboard';
import AllQRCodesPage from './pages/ManagerPage/AllQRCodesPage';
import TableMenu from './pages/TableMenu';

const LandingGate = ({ children }) => {
  const { role, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === 'RESTAURANT') {
    return <Navigate to="/restaurant/welcome" replace />;
  }

  return children;
};

const App = () => {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
      <Router>

        <ScrollToTop />

        <Routes>
          <Route path="/" element={<LandingPageLayout />}>
            <Route
              path=""
              element={
                <LandingGate>
                  <LandingPage />
                </LandingGate>
              }
            />
            <Route path="privacy-policy" element={<PrivacyPage />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="cookie-policy" element={<CookiePage />} />
            <Route path="about-us" element={<AboutUs />} />
          </Route>

          <Route path="login" element={<LoginPage />} />

          <Route path="forgot-password" element={<ForgotPassword />} />

          <Route path="complete-signup" element={<CompleteSignup />} />

          <Route path="payment" element={<PaymentPage />} />

          <Route path="admin/login" element={<AdminLoginPage />} />

          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminPageLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="requests" element={<RestaurantRequests />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="status" element={<RestaurantStatus />} />
            <Route path="support" element={<AdminSupportTickets />} />
          </Route>

          <Route
            path="restaurant/welcome"
            element={
              <ProtectedRoute requiredRole="RESTAURANT">
                <ManagerWelcome />
              </ProtectedRoute>
            }
          />
          <Route
            path="restaurant/profile"
            element={
              <ProtectedRoute requiredRole="RESTAURANT">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="restaurant/support"
            element={
              <ProtectedRoute requiredRole="RESTAURANT">
                <SupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="restaurant/location/:locationId"
            element={
              <ProtectedRoute requiredRole="RESTAURANT">
                <LocationDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="restaurant/location/:locationId/qr-codes"
            element={
              <ProtectedRoute requiredRole="RESTAURANT">
                <AllQRCodesPage />
              </ProtectedRoute>
            }
          />

          <Route path="menu/:restaurantId/:locationId/:tableNumber" element={<TableMenu />} />

          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </>

  );
};

export default App;
