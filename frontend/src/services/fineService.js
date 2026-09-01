import api from './api';

/**
 * Fine Management API Service (Staff Side)
 * Reference: docs/planning/06-api-contract.md (Section 18: Fines API)
 */
export const fineService = {
  /**
   * List all fines in the system (Librarian, Admin)
   * GET /fines?page&limit&status&member_id&search
   */
  getAllFines: async (params = {}) => {
    const response = await api.get('/fines', { params });
    return response.data;
  },

  /**
   * Get single fine detail
   * GET /fines/:id
   */
  getFineById: async (id) => {
    const response = await api.get(`/fines/${id}`);
    return response.data;
  },

  /**
   * Record fine payment (Librarian, Admin)
   * POST /fines/:id/pay
   * Body: { notes? }
   */
  payFine: async (id, data = {}) => {
    const response = await api.post(`/fines/${id}/pay`, data);
    return response.data;
  },

  /**
   * Waive / reduce fine (Admin only)
   * POST /fines/:id/waive
   * Body: { reason }
   */
  waiveFine: async (id, data = {}) => {
    const response = await api.post(`/fines/${id}/waive`, data);
    return response.data;
  },
};

export default fineService;
