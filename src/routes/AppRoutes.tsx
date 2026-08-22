import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import MedicineSearchPage from '../pages/public/MedicineSearchPage';

// Customer Pages
import CustomerDashboardPage from '../pages/customer/CustomerDashboardPage';
import MyReservationsPage from '../pages/customer/MyReservationsPage';
import NotificationsPage from '../pages/customer/NotificationsPage';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage';

// Pharmacy Pages
import PharmacyDashboardPage from '../pages/pharmacy/PharmacyDashboardPage';
import InventoryPage from '../pages/pharmacy/InventoryPage';
import LowStockPage from '../pages/pharmacy/LowStockPage';
import PharmacyReservationsPage from '../pages/pharmacy/PharmacyReservationsPage';
import InventoryHistoryPage from '../pages/pharmacy/InventoryHistoryPage';
import PharmacyAnalyticsPage from '../pages/pharmacy/PharmacyAnalyticsPage';
import PharmacyNotificationsPage from '../pages/pharmacy/PharmacyNotificationsPage';
import PharmacyProfilePage from '../pages/pharmacy/PharmacyProfilePage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import PharmacyManagementPage from '../pages/admin/PharmacyManagementPage';
import MedicineManagementPage from '../pages/admin/MedicineManagementPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import { useAuth } from '../context/AuthContext';

export const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const getDefaultRedirect = () => {
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'Pharmacy') return <Navigate to="/pharmacy/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<MedicineSearchPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? getDefaultRedirect() : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? getDefaultRedirect() : <RegisterPage />}
      />

      {/* Authenticated Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Customer Routes */}
        <Route element={<RoleRoute allowedRoles={['Customer']} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
          <Route path="/customer/reservations" element={<MyReservationsPage />} />
          <Route path="/customer/notifications" element={<NotificationsPage />} />
          <Route path="/customer/profile" element={<CustomerProfilePage />} />
        </Route>

        {/* Pharmacy Routes */}
        <Route element={<RoleRoute allowedRoles={['Pharmacy']} />}>
          <Route path="/pharmacy/dashboard" element={<PharmacyDashboardPage />} />
          <Route path="/pharmacy/inventory" element={<InventoryPage />} />
          <Route path="/pharmacy/low-stock" element={<LowStockPage />} />
          <Route path="/pharmacy/reservations" element={<PharmacyReservationsPage />} />
          <Route path="/pharmacy/inventory-history" element={<InventoryHistoryPage />} />
          <Route path="/pharmacy/analytics" element={<PharmacyAnalyticsPage />} />
          <Route path="/pharmacy/notifications" element={<PharmacyNotificationsPage />} />
          <Route path="/pharmacy/profile" element={<PharmacyProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['Admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/pharmacies" element={<PharmacyManagementPage />} />
          <Route path="/admin/medicines" element={<MedicineManagementPage />} />
          <Route path="/admin/categories" element={<CategoryManagementPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>
      </Route>

      {/* Fallback Catch-All Route */}
      <Route path="*" element={getDefaultRedirect()} />
    </Routes>
  );
};

export default AppRoutes;
