import api from './api';

/**
 * Member API Service
 * Reference: docs/planning/06-api-contract.md (Section 10: Members API)
 */
export const memberService = {
  /**
   * Get list of all members (Librarian, Admin)
   * GET /members?page&limit&search&status
   */
  getMembers: async (params = {}) => {
    const response = await api.get('/members', { params });
    return response.data;
  },

  /**
   * Get single member profile by ID
   * GET /members/:id
   */
  getMemberById: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  /**
   * Update member profile (contact info)
   * PUT /members/:id
   */
  updateMember: async (id, data) => {
    const response = await api.put(`/members/${id}`, data);
    return response.data;
  },

  /**
   * Get borrowing history of a specific member
   * GET /members/:id/borrowings?status&page&limit
   */
  getMemberBorrowings: async (id, params = {}) => {
    const response = await api.get(`/members/${id}/borrowings`, { params });
    return response.data;
  },

  /**
   * Get reservation history of a specific member
   * GET /members/:id/reservations?status&page&limit
   */
  getMemberReservations: async (id, params = {}) => {
    const response = await api.get(`/members/${id}/reservations`, { params });
    return response.data;
  },

  /**
   * Get fines of a specific member
   * GET /members/:id/fines?status&page&limit
   */
  getMemberFines: async (id, params = {}) => {
    const response = await api.get(`/members/${id}/fines`, { params });
    return response.data;
  },

  /**
   * Get current member's own fines (Member)
   * GET /fines/my-fines?status&page&limit
   */
  getMyFines: async (params = {}) => {
    const response = await api.get('/fines/my-fines', { params });
    return response.data;
  },
};

export default memberService;
