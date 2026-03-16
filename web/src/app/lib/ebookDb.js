'use client';
import Dexie from 'dexie';

export const ebookDb = new Dexie('qlTD_ebook');
ebookDb.version(1).stores({
  ebookBooks:     '&id, userId, uploadedAt',
  ebookHighlights:'&id, bookId, userId, pageNumber',
  ebookComments:  '&id, bookId, userId, pageNumber',
  ebookBookmarks: '&id, bookId, userId, pageNumber',
  ebookProgress:  '&id, bookId, userId',
});
