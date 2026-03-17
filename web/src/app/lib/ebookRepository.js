'use client';
import apiClient from './apiClient';

export const ebookRepository = {
  async getBooks() {
    return apiClient.get('/api/ebook/books');
  },

  async getBook(id) {
    return apiClient.get(`/api/ebook/books/${id}`);
  },

  async saveBook(userId, title, pages) {
    return apiClient.post('/api/ebook/books', { title, pages });
  },

  async deleteBook(id) {
    return apiClient.delete(`/api/ebook/books/${id}`);
  },

  async getHighlights(bookId) {
    return apiClient.get(`/api/ebook/books/${bookId}/highlights`);
  },

  async addHighlight(userId, bookId, pageNumber, startOffset, endOffset, text, color) {
    return apiClient.post('/api/ebook/highlights', { bookId, pageNumber, startOffset, endOffset, text, color });
  },

  async deleteHighlight(id) {
    return apiClient.delete(`/api/ebook/highlights/${id}`);
  },

  async getComments(bookId) {
    return apiClient.get(`/api/ebook/books/${bookId}/comments`);
  },

  async addComment(userId, bookId, pageNumber, startOffset, endOffset, selectedText, content, highlightId) {
    return apiClient.post('/api/ebook/comments', { bookId, pageNumber, highlightId: highlightId ?? null, startOffset, endOffset, selectedText, content });
  },

  async updateComment(id, content) {
    return apiClient.put(`/api/ebook/comments/${id}`, { content });
  },

  async deleteComment(id) {
    return apiClient.delete(`/api/ebook/comments/${id}`);
  },

  async getBookmarks(bookId) {
    return apiClient.get(`/api/ebook/books/${bookId}/bookmarks`);
  },

  async toggleBookmark(userId, bookId, pageNumber, label) {
    return apiClient.post('/api/ebook/bookmarks', { bookId, pageNumber, label });
  },

  // Keep addBookmark as alias for toggleBookmark for backward compat
  async addBookmark(userId, bookId, pageNumber, label) {
    return apiClient.post('/api/ebook/bookmarks', { bookId, pageNumber, label });
  },

  async deleteBookmark(id) {
    return apiClient.delete(`/api/ebook/bookmarks/${id}`);
  },

  async getProgress(bookId) {
    return apiClient.get(`/api/ebook/books/${bookId}/progress`);
  },

  async updateProgress(bookId, currentPage) {
    return apiClient.put(`/api/ebook/books/${bookId}/progress`, { currentPage });
  },

  // Alias used in page.jsx
  async saveProgress(userId, bookId, currentPage) {
    return apiClient.put(`/api/ebook/books/${bookId}/progress`, { currentPage });
  },
};
