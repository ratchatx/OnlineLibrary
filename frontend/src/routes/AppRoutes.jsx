import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import MemberLayout from '../layouts/MemberLayout';
import StaffLayout from '../layouts/StaffLayout';

// Guard
import ProtectedRoute from './ProtectedRoute';

// Pages
import HomePage from '../pages/public/HomePage';
import BookCatalogPage from '../pages/public/BookCatalogPage';
import BookDetailPage from '../pages/public/BookDetailPage';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import UnauthorizedPage from '../pages/errors/UnauthorizedPage';

// Member Pages
import MemberDashboardPage from '../pages/member/MemberDashboardPage';
import MemberBorrowsPage from '../pages/member/MemberBorrowsPage';
import MemberReservationsPage from '../pages/member/MemberReservationsPage';
import MemberFinesPage from '../pages/member/MemberFinesPage';
import MemberNotificationsPage from '../pages/member/MemberNotificationsPage';
import MemberProfilePage from '../pages/member/MemberProfilePage';

// Staff Pages
import StaffDashboardPage from '../pages/staff/StaffDashboardPage';
import StaffBorrowingsPage from '../pages/staff/StaffBorrowingsPage';
import StaffReservationsPage from '../pages/staff/StaffReservationsPage';
import StaffFinesPage from '../pages/staff/StaffFinesPage';
import StaffBooksPage from '../pages/staff/StaffBooksPage';
import StaffMembersPage from '../pages/staff/StaffMembersPage';
import StaffMemberDetailPage from '../pages/staff/StaffMemberDetailPage';
import StaffReportsPage from '../pages/staff/StaffReportsPage';
import AdminAuditLogsPage from '../pages/staff/AdminAuditLogsPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Standalone Auth Routes (Full-Screen Immersive Layout) */}
      <Route path="/login" element={<LoginPage />} />

      {/* 1. Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BookCatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      {/* 2. Member Portal Protected Routes */}
      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRoles={['member', 'librarian', 'admin']}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/member/dashboard" replace />} />
        <Route path="dashboard" element={<MemberDashboardPage />} />
        <Route path="my-borrows" element={<MemberBorrowsPage />} />
        <Route path="my-reservations" element={<MemberReservationsPage />} />
        <Route path="my-fines" element={<MemberFinesPage />} />
        <Route path="notifications" element={<MemberNotificationsPage />} />
        <Route path="profile" element={<MemberProfilePage />} />
      </Route>

      {/* 3. Staff & Admin Portal Protected Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['librarian', 'admin']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboardPage />} />
        <Route path="borrowings" element={<StaffBorrowingsPage />} />
        <Route path="reservations" element={<StaffReservationsPage />} />
        <Route path="fines" element={<StaffFinesPage />} />
        <Route path="books" element={<StaffBooksPage />} />
        <Route path="members" element={<StaffMembersPage />} />
        <Route path="members/:id" element={<StaffMemberDetailPage />} />
        <Route path="reports" element={<StaffReportsPage />} />
      </Route>

      {/* 4. Admin Only Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* 5. Catch-All Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
