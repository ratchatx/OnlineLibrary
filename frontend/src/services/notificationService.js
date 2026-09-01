import api from './api';

/**
 * Notification API Service
 * Reference: docs/planning/06-api-contract.md (Section 19: Notifications API)
 *            docs/planning/08-dashboard-report-notification.md
 */
export const notificationService = {
  /**
   * Get list of notifications for current user
   * GET /notifications?is_read&page&limit
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Mark a single notification as read
   * PATCH /notifications/:id/read
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read for current user
   * PATCH /notifications/read-all
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
