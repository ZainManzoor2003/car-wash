import React, { useRef } from 'react';
import { Navigate } from 'react-router-dom';

import ProtectedHome from './components/ProtectedHome';
import OurServicesPage from './components/OurServicesPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import DashboardPage from './components/DashboardPage';
import PastServicesPage from './components/PastServicesPage';
import UpcomingAppointmentsPage from './components/UpcomingAppointmentsPage';
import MessagesPage from './components/MessagesPage';
import BookingMessages from './components/BookingMessages';
import AdminMessages from './components/AdminMessages';
import EmailReplyTest from './components/EmailReplyTest';
import AdminRoute from './components/AdminRoute';
import AddImagesPage from './components/AddImagesPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import UserDashboard from './components/UserDashboard';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import PaymentCancelledPage from './components/PaymentCancelledPage';
import FinancePage from './components/FinancePage';
import AdminQuoteRequests from './components/AdminQuoteRequests';
import MembershipPlans from './components/MembershipPlans';
import MembershipPaymentSuccess from './components/MembershipPaymentSuccess';
import FluidTopUpAdmin from './components/FluidTopUpAdmin';
import ReferralPage from './components/ReferralPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeasonalCheckAdmin from './components/SeasonalCheckAdmin';
import SeasonalCheckBooking from './components/SeasonalCheckBooking';
import SeasonalCheckSettings from './components/SeasonalCheckSettings';
import UserMembershipLookup from './components/UserMembershipLookup';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedHome />} />
        <Route path="/our-services" element={<OurServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="/dashboard/add-images" element={<AdminRoute><AddImagesPage /></AdminRoute>} />
        <Route path="/dashboard/finance" element={<AdminRoute><FinancePage /></AdminRoute>} />
        <Route path="/dashboard/quote-requests" element={<AdminRoute><AdminQuoteRequests /></AdminRoute>} />
        <Route path="/dashboard/past-services" element={<PastServicesPage />} />
        <Route path="/dashboard/upcoming" element={<UpcomingAppointmentsPage />} />
        <Route path="/dashboard/messages" element={<MessagesPage />} />
        <Route path="/dashboard/admin-messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
        <Route path="/dashboard/fluid-topups" element={<AdminRoute><FluidTopUpAdmin /></AdminRoute>} />
        <Route path="/dashboard/seasonal-checks" element={<AdminRoute><AddImagesPage /></AdminRoute>} />
        <Route path="/dashboard/seasonal-settings" element={<AdminRoute><SeasonalCheckSettings /></AdminRoute>} />
        <Route path="/membership-lookup" element={<AdminRoute><UserMembershipLookup /></AdminRoute>} />
        
        <Route path="/email-reply-test" element={<EmailReplyTest />} />
        <Route path="/booking-messages/:bookingId" element={<BookingMessages />} />
        <Route path="/user-dashboard" element={<UserDashboard />} /> {/* Service Page - Browse Services & Parts */}
        <Route path="/membership" element={<MembershipPlans />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/seasonal-check" element={<SeasonalCheckBooking />} />
        <Route path="/membership-payment-success" element={<MembershipPaymentSuccess />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      </Routes>
    </Router>
  );
};

export default App;
