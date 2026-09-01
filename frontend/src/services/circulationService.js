import api from './api';

/**
 * Circulation API Service
 * Reference: docs/planning/06-api-contract.md (Sections 15, 16, 17)
 */
export const circulationService = {
  /**
   * List all borrowings (Staff)
   */
  getBorrowings: async (params = {}) => {
    const response = await api.get('/borrowings', { params });
    return response.data;
  },

  /**
   * List current member's borrowings (Member)
   */
  getMyBorrowings: async (params = {}) => {
    const response = await api.get('/borrowings/my-borrows', { params });
    return response.data;
  },

  /**
   * Borrow a book (Staff or Member)
   */
  borrowBook: async (data) => {
    const response = await api.post('/borrowings', data);
    return response.data;
  },

  /**
   * Return a book (Staff)
   */
  returnBook: async (borrowingId, data = {}) => {
    const response = await api.post(`/borrowings/${borrowingId}/return`, data);
    return response.data;
  },

  /**
   * List all reservations (Staff)
   */
  getReservations: async (params = {}) => {
    const response = await api.get('/reservations', { params });
    return response.data;
  },

  /**
   * List current member's reservations (Member)
   */
  getMyReservations: async (params = {}) => {
    const response = await api.get('/reservations/my-reservations', { params });
    return response.data;
  },

  /**
   * Create a reservation
   */
  createReservation: async (data) => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  /**
   * Cancel a reservation
   */
  cancelReservation: async (reservationId) => {
    const response = await api.post(`/reservations/${reservationId}/cancel`);
    return response.data;
  },
};

export default circulationService;
