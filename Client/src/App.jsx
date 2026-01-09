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
import AdminLoginPage from './pages/AdminPage/AdminLoginPage'
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminDashboard, RestaurantRequests } from './components/AdminPageComponents'
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';
import NotFound from './pages/NotFound';

const LandingGate = ({ children }) => {
  const { role, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === 'RESTAURANT') {
    return <Navigate to="/restaurant/dashboard" replace />;
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
            background: '#2d2d2d',
            color: '#fff',
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
            {/* <Route path="status" element={<RestaurantStatus />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="support" element={<SupportTickets />} /> */}
          </Route>

          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </>

  );
};

export default App;
