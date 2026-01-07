import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPageLayout from './LandingPageLayout';
import AdminPageLayout from './AdminPageLayout'
import LandingPage from './pages/LandingPage/LandingPage';
import PrivacyPolicy from './pages/LandingPage/PrivacyPolicy';
import TermsOfService from './pages/LandingPage/TermsOfService';
import CookiePolicy from './pages/LandingPage/CookiePolicy';
import AboutUs from './pages/LandingPage/AboutUs';
import LoginPage from './pages/LandingPage/LoginPage';
import ForgotPassword from './pages/LandingPage/ForgotPassword';
import AdminLoginPage from './pages/AdminPage/AdminLoginPage'
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminDashboard, RestaurantRequests, AddRestaurant} from './components/AdminPageComponents'
import { Toaster } from 'react-hot-toast';

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
            <Route path="" element={<LandingPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="cookie-policy" element={<CookiePolicy />} />
            <Route path="about-us" element={<AboutUs />} />
          </Route>

          <Route path="login" element={<LoginPage />} />

          <Route path="forgot-password" element={<ForgotPassword />} />
          
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
            <Route path="add-restaurant" element={<AddRestaurant />} />
          </Route>

        </Routes>
      </Router>
    </>

  );
};

export default App;
