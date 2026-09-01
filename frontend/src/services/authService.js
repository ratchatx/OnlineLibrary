import api from './api';

/**
 * Authentication API Service
 * Reference: docs/planning/06-api-contract.md (Section 5)
 */
export const authService = {
  /**
   * Login with username and password
   */
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data; // { success, message, data: { user, token } }
  },

  /**
   * Fetch current authenticated user's profile
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data; // { success, message, data: user }
  },

  /**
   * Change password for current authenticated user
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Logout from system
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Non-blocking
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

export default authService;
