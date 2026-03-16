import { useState, useEffect, useCallback, useRef } from 'react'
import type { EbookBook, EbookHighlight, EbookComment, EbookBookmark, SelectionInfo, HighlightColor } from '@/types/ebook.types'
import { ebookRepository } from '@/db/ebookRepository'

export function useEbookReader(book: EbookBook | null, userId: string) {
  const [currentPage, setCurrentPage] = useState(1)
  const [highlights, setHighlights] = useState<EbookHighlight[]>([])
  const [comments, setComments] = useState<EbookComment[]>([])
  const [bookmarks, setBookmarks] = useState<EbookBookmark[]>([])
  const [selection, setSelection] = useState<SelectionInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveProgressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!book || !userId) return
    setLoading(true)
    setError(null)

    Promise.all([
      ebookRepository.getHighlights(userId, book.id),
      ebookRepository.getComments(userId, book.id),
      ebookRepository.getBookmarks(userId, book.id),
      ebookRepository.getProgress(userId, book.id),
    ]).then(([h, c, b, p]) => {
      setHighlights(h)
      setComments(c)
      setBookmarks(b)
      if (p) setCurrentPage(p.currentPage)
      setLoading(false)
    }).catch(() => {
      setError('Không thể tải dữ liệu sách.')
      setLoading(false)
    })
  }, [book, userId])

  // Auto-save progress (debounced)
  useEffect(() => {
    if (!book || !userId) return
    if (saveProgressTimer.current) clearTimeout(saveProgressTimer.current)
    saveProgressTimer.current = setTimeout(() => {
      ebookRepository.saveProgress(userId, book.id, currentPage, book.totalPages).catch(() => {})
    }, 1000)
  }, [currentPage, book, userId])

  const goToPage = useCallback((page: number) => {
    if (!book) return
    setCurrentPage(Math.max(1, Math.min(page, book.totalPages)))
  }, [book])

  const handleTextSelection = useCallback((pageNumber: number) => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelection(null)
      return
    }
    const text = sel.toString().trim()
    const range = sel.getRangeAt(0)
    const container = document.getElementById(`page-content-${pageNumber}`)
    if (!container) return

    const preRange = document.createRange()
    preRange.selectNodeContents(container)
    preRange.setEnd(range.startContainer, range.startOffset)
    const startOffset = preRange.toString().length
    const endOffset = startOffset + text.length

    setSelection({ text, startOffset, endOffset, pageNumber, range: range.cloneRange() })
  }, [])

  const addHighlight = useCallback(async (color: HighlightColor) => {
    if (!selection || !book) return
    try {
      const h = await ebookRepository.addHighlight(
        userId, book.id, selection.pageNumber,
        selection.startOffset, selection.endOffset, selection.text, color,
      )
      setHighlights(prev => [...prev, h])
      setSelection(null)
      window.getSelection()?.removeAllRanges()
    } catch {
      setError('Không thể lưu highlight.')
    }
  }, [selection, book, userId])

  const deleteHighlight = useCallback(async (id: string) => {
    try {
      await ebookRepository.deleteHighlight(id)
      setHighlights(prev => prev.filter(h => h.id !== id))
    } catch {
      setError('Không thể xóa highlight.')
    }
  }, [])

  const addComment = useCallback(async (content: string, highlightId?: string) => {
    if (!selection || !book) return
    try {
      const c = await ebookRepository.addComment(
        userId, book.id, selection.pageNumber,
        selection.startOffset, selection.endOffset, selection.text, content, highlightId,
      )
      setComments(prev => [...prev, c])
      setSelection(null)
      window.getSelection()?.removeAllRanges()
    } catch {
      setError('Không thể lưu ghi chú.')
    }
  }, [selection, book, userId])

  const updateComment = useCallback(async (id: string, content: string) => {
    try {
      const updated = await ebookRepository.updateComment(id, content)
      setComments(prev => prev.map(c => c.id === id ? updated : c))
    } catch {
      setError('Không thể cập nhật ghi chú.')
    }
  }, [])

  const deleteComment = useCallback(async (id: string) => {
    try {
      await ebookRepository.deleteComment(id)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch {
      setError('Không thể xóa ghi chú.')
    }
  }, [])

  const toggleBookmark = useCallback(async () => {
    if (!book) return
    const existing = bookmarks.find(b => b.pageNumber === currentPage)
    if (existing) {
      try {
        await ebookRepository.deleteBookmark(existing.id)
        setBookmarks(prev => prev.filter(b => b.id !== existing.id))
      } catch { setError('Không thể xóa bookmark.') }
    } else {
      try {
        const b = await ebookRepository.addBookmark(userId, book.id, currentPage, `Trang ${currentPage}`)
        setBookmarks(prev => [...prev, b])
      } catch { setError('Không thể lưu bookmark.') }
    }
  }, [book, currentPage, bookmarks, userId])

  const isBookmarked = bookmarks.some(b => b.pageNumber === currentPage)
  const pageHighlights = highlights.filter(h => h.pageNumber === currentPage)
  const pageComments = comments.filter(c => c.pageNumber === currentPage)

  return {
    currentPage, goToPage,
    highlights, pageHighlights, addHighlight, deleteHighlight,
    comments, pageComments, addComment, updateComment, deleteComment,
    bookmarks, toggleBookmark, isBookmarked,
    selection, setSelection, handleTextSelection,
    loading, error, setError,
  }
}
