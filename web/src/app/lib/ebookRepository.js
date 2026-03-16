'use client';
import { nanoid } from 'nanoid';
import { ebookDb } from './ebookDb';

export const ebookRepository = {
  // Books
  getBooks: (userId) =>
    ebookDb.ebookBooks.where('userId').equals(userId).sortBy('uploadedAt'),

  getBook: (id) =>
    ebookDb.ebookBooks.get(id),

  saveBook: (userId, title, pages) => {
    const book = {
      id: `book_${nanoid()}`,
      userId,
      title,
      pages,
      totalPages: pages.length,
      uploadedAt: new Date().toISOString(),
    };
    return ebookDb.ebookBooks.add(book).then(() => book);
  },

  deleteBook: async (id) => {
    await Promise.all([
      ebookDb.ebookBooks.delete(id),
      ebookDb.ebookHighlights.where('bookId').equals(id).delete(),
      ebookDb.ebookComments.where('bookId').equals(id).delete(),
      ebookDb.ebookBookmarks.where('bookId').equals(id).delete(),
      ebookDb.ebookProgress.where('bookId').equals(id).delete(),
    ]);
  },

  // Highlights
  getHighlights: (userId, bookId) =>
    ebookDb.ebookHighlights
      .where('bookId').equals(bookId)
      .filter(h => h.userId === userId)
      .toArray(),

  addHighlight: (userId, bookId, pageNumber, startOffset, endOffset, text, color) => {
    const h = {
      id: nanoid(),
      userId,
      bookId,
      pageNumber,
      startOffset,
      endOffset,
      text,
      color,
      createdAt: new Date().toISOString(),
    };
    return ebookDb.ebookHighlights.add(h).then(() => h);
  },

  deleteHighlight: (id) =>
    ebookDb.ebookHighlights.delete(id),

  // Comments
  getComments: (userId, bookId) =>
    ebookDb.ebookComments
      .where('bookId').equals(bookId)
      .filter(c => c.userId === userId)
      .toArray(),

  addComment: (userId, bookId, pageNumber, startOffset, endOffset, selectedText, content, highlightId) => {
    const c = {
      id: nanoid(),
      userId,
      bookId,
      pageNumber,
      startOffset,
      endOffset,
      selectedText,
      content,
      highlightId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return ebookDb.ebookComments.add(c).then(() => c);
  },

  updateComment: async (id, content) => {
    await ebookDb.ebookComments.update(id, { content, updatedAt: new Date().toISOString() });
    return ebookDb.ebookComments.get(id);
  },

  deleteComment: (id) =>
    ebookDb.ebookComments.delete(id),

  // Bookmarks
  getBookmarks: (userId, bookId) =>
    ebookDb.ebookBookmarks
      .where('bookId').equals(bookId)
      .filter(b => b.userId === userId)
      .toArray(),

  addBookmark: (userId, bookId, pageNumber, label) => {
    const b = {
      id: nanoid(),
      userId,
      bookId,
      pageNumber,
      label,
      createdAt: new Date().toISOString(),
    };
    return ebookDb.ebookBookmarks.add(b).then(() => b);
  },

  deleteBookmark: (id) =>
    ebookDb.ebookBookmarks.delete(id),

  // Progress
  getProgress: (userId, bookId) =>
    ebookDb.ebookProgress
      .where('bookId').equals(bookId)
      .filter(p => p.userId === userId)
      .first(),

  saveProgress: async (userId, bookId, currentPage, totalPages) => {
    const existing = await ebookDb.ebookProgress
      .where('bookId').equals(bookId)
      .filter(p => p.userId === userId)
      .first();
    const data = { currentPage, totalPages, lastReadAt: new Date().toISOString() };
    if (existing) {
      await ebookDb.ebookProgress.update(existing.id, data);
    } else {
      await ebookDb.ebookProgress.add({ id: nanoid(), userId, bookId, ...data });
    }
  },
};
