import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import CreateTripPage from './pages/CreateTripPage';
import DashboardPage from './pages/DashboardPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import ItineraryViewPage from './pages/ItineraryViewPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TripsPage from './pages/TripsPage';
import PublicItineraryPage from './pages/PublicItineraryPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function protectedPage(Page) {
  return (
    <ProtectedRoute>
      <Page />
    </ProtectedRoute>
  );
}

function adminPage(Page) {
  return (
    <AdminRoute>
      <Page />
    </AdminRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={protectedPage(DashboardPage)} />
        <Route path="/trips" element={protectedPage(TripsPage)} />
        <Route path="/settings" element={protectedPage(ProfileSettingsPage)} />
        <Route path="/admin" element={adminPage(AdminDashboardPage)} />
        <Route path="/trips/new" element={protectedPage(CreateTripPage)} />
        <Route path="/trips/:id/build" element={protectedPage(ItineraryBuilderPage)} />
        <Route path="/trips/:id" element={protectedPage(ItineraryViewPage)} />
        <Route path="/shared/:slug" element={<PublicItineraryPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
