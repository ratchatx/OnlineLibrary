import api from './api';

/**
 * Dashboard & Reports API Service
 * Reference: docs/planning/06-api-contract.md (Sections 20, 21)
 *            docs/planning/08-dashboard-report-notification.md
 */
export const dashboardService = {
  /**
   * Staff Operational Dashboard Summary
   * GET /dashboard/staff-summary
   * Returns: { total_books, total_copies, available_copies,
   *            active_borrows, overdue_count, pending_reservations,
   *            total_members, total_unpaid_fines }
   */
  getStaffSummary: async () => {
    const response = await api.get('/dashboard/staff-summary');
    return response.data;
  },

  /**
   * Member Personal Dashboard Summary
   * GET /dashboard/member-summary
   * Returns: { current_borrows_count, nearest_due_date,
   *            active_reservations_count, ready_to_claim_count,
   *            total_unpaid_fines }
   */
  getMemberSummary: async () => {
    const response = await api.get('/dashboard/member-summary');
    return response.data;
  },

  /**
   * Borrow-Return Transaction Report (RPT-01)
   * GET /reports/borrow-return?date_from&date_to&category_id
   */
  getBorrowReturnReport: async (params = {}) => {
    const response = await api.get('/reports/borrow-return', { params });
    return response.data;
  },

  /**
   * Overdue & Fines Summary Report (RPT-02)
   * GET /reports/overdue-fines?date_from&date_to&status
   */
  getOverdueFinesReport: async (params = {}) => {
    const response = await api.get('/reports/overdue-fines', { params });
    return response.data;
  },

  /**
   * Popular Books Report (RPT-03)
   * GET /reports/popular-books?limit&period&category_id
   */
  getPopularBooksReport: async (params = {}) => {
    const response = await api.get('/reports/popular-books', { params });
    return response.data;
  },
};

export default dashboardService;
