import api from './api';

/**
 * Book & Catalog Service
 * Reference: docs/planning/06-api-contract.md (Sections 6, 7, 8, 9)
 */
export const bookService = {
  /**
   * Search & List books with pagination & filters
   */
  getBooks: async (params = {}) => {
    const response = await api.get('/books', { params });
    return response.data;
  },

  /**
   * Get single book details by ID
   */
  getBookById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  /**
   * Create new book (Librarian/Admin)
   */
  createBook: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },

  /**
   * Update existing book (Librarian/Admin)
   */
  updateBook: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },

  /**
   * Delete book (Admin only)
   */
  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },

  /**
   * Get all categories
   */
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  /**
   * Get copies for a book
   */
  getBookCopies: async (bookId) => {
    const response = await api.get(`/books/${bookId}/copies`);
    return response.data;
  },

  /**
   * Add a new physical copy for a book
   */
  createBookCopy: async (bookId, copyData) => {
    const response = await api.post(`/books/${bookId}/copies`, copyData);
    return response.data;
  },

  /**
   * Update a book copy (status)
   */
  updateBookCopy: async (copyId, copyData) => {
    const response = await api.patch(`/copies/${copyId}/status`, copyData);
    return response.data;
  },

  /**
   * Delete a book copy
   */
  deleteBookCopy: async (copyId) => {
    const response = await api.delete(`/copies/${copyId}`);
    return response.data;
  },
};

export default bookService;
