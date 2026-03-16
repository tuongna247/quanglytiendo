import { nanoid } from 'nanoid'
import { db } from './database'
import type { EbookBook, EbookHighlight, EbookComment, EbookBookmark, EbookProgress, HighlightColor } from '@/types/ebook.types'

export const ebookRepository = {
  // Books
  getBooks: (userId: string) =>
    db.ebookBooks.where('userId').equals(userId).sortBy('uploadedAt'),

  getBook: (id: string) =>
    db.ebookBooks.get(id),

  saveBook: (userId: string, title: string, pages: string[]) => {
    const book: EbookBook = {
      id: `book_${nanoid()}`,
      userId,
      title,
      pages,
      totalPages: pages.length,
      uploadedAt: new Date().toISOString(),
    }
    return db.ebookBooks.add(book).then(() => book)
  },

  deleteBook: async (id: string) => {
    await Promise.all([
      db.ebookBooks.delete(id),
      db.ebookHighlights.where('bookId').equals(id).delete(),
      db.ebookComments.where('bookId').equals(id).delete(),
      db.ebookBookmarks.where('bookId').equals(id).delete(),
      db.ebookProgress.where('bookId').equals(id).delete(),
    ])
  },

  // Highlights
  getHighlights: (userId: string, bookId: string) =>
    db.ebookHighlights
      .where('bookId').equals(bookId)
      .filter(h => h.userId === userId)
      .toArray(),

  addHighlight: (
    userId: string,
    bookId: string,
    pageNumber: number,
    startOffset: number,
    endOffset: number,
    text: string,
    color: HighlightColor,
  ) => {
    const h: EbookHighlight = {
      id: nanoid(),
      userId,
      bookId,
      pageNumber,
      startOffset,
      endOffset,
      text,
      color,
      createdAt: new Date().toISOString(),
    }
    return db.ebookHighlights.add(h).then(() => h)
  },

  deleteHighlight: (id: string) =>
    db.ebookHighlights.delete(id),

  // Comments
  getComments: (userId: string, bookId: string) =>
    db.ebookComments
      .where('bookId').equals(bookId)
      .filter(c => c.userId === userId)
      .toArray(),

  addComment: (
    userId: string,
    bookId: string,
    pageNumber: number,
    startOffset: number,
    endOffset: number,
    selectedText: string,
    content: string,
    highlightId?: string,
  ) => {
    const c: EbookComment = {
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
    }
    return db.ebookComments.add(c).then(() => c)
  },

  updateComment: async (id: string, content: string) => {
    await db.ebookComments.update(id, { content, updatedAt: new Date().toISOString() })
    return db.ebookComments.get(id) as Promise<EbookComment>
  },

  deleteComment: (id: string) =>
    db.ebookComments.delete(id),

  // Bookmarks
  getBookmarks: (userId: string, bookId: string) =>
    db.ebookBookmarks
      .where('bookId').equals(bookId)
      .filter(b => b.userId === userId)
      .toArray(),

  addBookmark: (userId: string, bookId: string, pageNumber: number, label: string) => {
    const b: EbookBookmark = {
      id: nanoid(),
      userId,
      bookId,
      pageNumber,
      label,
      createdAt: new Date().toISOString(),
    }
    return db.ebookBookmarks.add(b).then(() => b)
  },

  deleteBookmark: (id: string) =>
    db.ebookBookmarks.delete(id),

  // Progress
  getProgress: (userId: string, bookId: string) =>
    db.ebookProgress
      .where('bookId').equals(bookId)
      .filter(p => p.userId === userId)
      .first(),

  saveProgress: async (userId: string, bookId: string, currentPage: number, totalPages: number) => {
    const existing = await db.ebookProgress
      .where('bookId').equals(bookId)
      .filter(p => p.userId === userId)
      .first()
    const data = { currentPage, totalPages, lastReadAt: new Date().toISOString() }
    if (existing) {
      await db.ebookProgress.update(existing.id, data)
    } else {
      await db.ebookProgress.add({ id: nanoid(), userId, bookId, ...data })
    }
  },
}
