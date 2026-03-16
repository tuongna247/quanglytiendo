import { useState, useCallback, useEffect } from 'react'
import {
  BookOpen, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight,
  PanelLeftOpen, PanelLeftClose, AlertCircle, X, ChevronsLeft, ChevronsRight,
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCurrentUserId } from '@/store/useAuthStore'
import { ebookRepository } from '@/db/ebookRepository'
import { parseDocxToPages } from '@/lib/docxParser'
import { parsePdfToPages } from '@/lib/pdfParser'
import { useEbookReader } from '@/hooks/useEbookReader'
import EbookPageContent from '@/components/ebook/EbookPageContent'
import EbookSelectionToolbar from '@/components/ebook/EbookSelectionToolbar'
import EbookSidebar from '@/components/ebook/EbookSidebar'
import EbookUploadPage from '@/components/ebook/EbookUploadPage'
import type { EbookBook } from '@/types/ebook.types'

export default function EbookPage() {
  const userId = useCurrentUserId()
  const [activeBook, setActiveBook] = useState<EbookBook | null>(null)
  const [uploading, setUploading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [jumpPage, setJumpPage] = useState('')

  const savedBooks = useLiveQuery(
    () => userId ? ebookRepository.getBooks(userId) : Promise.resolve([]),
    [userId],
    [],
  )

  const {
    currentPage, goToPage,
    pageHighlights, addHighlight,
    comments, pageComments, addComment, updateComment, deleteComment,
    bookmarks, toggleBookmark, isBookmarked,
    selection, setSelection, handleTextSelection,
    loading, error, setError,
  } = useEbookReader(activeBook, userId)

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true)
    try {
      let pages: string[]
      if (file.name.toLowerCase().endsWith('.pdf')) {
        pages = await parsePdfToPages(file)
      } else {
        pages = await parseDocxToPages(file)
      }
      const title = file.name.replace(/\.(docx|pdf)$/i, '')
      const book = await ebookRepository.saveBook(userId, title, pages)
      setActiveBook(book)
    } catch {
      setError('Không thể đọc file. Hãy kiểm tra lại định dạng .docx hoặc .pdf')
    } finally {
      setUploading(false)
    }
  }, [userId, setError])

  const handleDeleteBook = useCallback(async (id: string) => {
    await ebookRepository.deleteBook(id)
    if (activeBook?.id === id) setActiveBook(null)
  }, [activeBook])

  // Keyboard navigation
  useEffect(() => {
    if (!activeBook) return
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(currentPage + 1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPage(currentPage - 1)
      if (e.key === 'b') toggleBookmark()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeBook, currentPage, goToPage, toggleBookmark])

  // Close toolbar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const toolbar = document.getElementById('ebook-selection-toolbar')
      if (toolbar && !toolbar.contains(e.target as Node)) {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed) setSelection(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setSelection])

  if (!activeBook) {
    return (
      <EbookUploadPage
        books={savedBooks ?? []}
        onUpload={handleUpload}
        onOpenBook={setActiveBook}
        onDeleteBook={handleDeleteBook}
        loading={uploading}
      />
    )
  }

  const currentText = activeBook.pages[currentPage - 1] || ''
  const progress = Math.round((currentPage / activeBook.totalPages) * 100)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f0e8]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>

          <BookOpen size={18} className="text-indigo-600 shrink-0" />
          <h1 className="font-semibold text-gray-800 truncate text-sm flex-1">{activeBook.title}</h1>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span>{progress}%</span>
          </div>

          <button
            onClick={toggleBookmark}
            title={isBookmarked ? 'Bỏ bookmark' : 'Bookmark trang này (B)'}
            className={`transition-colors ${isBookmarked ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
          >
            {isBookmarked ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
          </button>

          <button
            onClick={() => setActiveBook(null)}
            className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Mở sách khác
          </button>
        </div>
        <div className="h-0.5 bg-gray-100">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 shrink-0 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
            <EbookSidebar
              bookmarks={bookmarks}
              comments={comments}
              currentPage={currentPage}
              onGoToPage={goToPage}
              onDeleteBookmark={async id => {
                const b = bookmarks.find(bk => bk.id === id)
                if (b && b.pageNumber === currentPage) {
                  await toggleBookmark()
                } else if (b) {
                  await ebookRepository.deleteBookmark(id)
                }
              }}
              onDeleteComment={deleteComment}
              onUpdateComment={updateComment}
            />
          </aside>
        )}

        {/* Main reading area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            {loading && (
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  Đang tải dữ liệu...
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl mb-6">
                <AlertCircle size={16} className="shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={() => setError(null)}><X size={14} /></button>
              </div>
            )}

            <div className="text-center mb-6">
              <span className="text-xs font-medium text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full tracking-wider uppercase">
                Trang {currentPage} / {activeBook.totalPages}
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10 min-h-[500px]">
              <EbookPageContent
                pageNumber={currentPage}
                text={currentText}
                highlights={pageHighlights}
                comments={pageComments}
                onTextSelection={handleTextSelection}
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-8 gap-4">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={18} />
              </button>

              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm text-sm font-medium"
              >
                <ChevronLeft size={16} /> Trước
              </button>

              <form
                onSubmit={e => {
                  e.preventDefault()
                  const p = parseInt(jumpPage)
                  if (!isNaN(p)) { goToPage(p); setJumpPage('') }
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="number"
                  value={jumpPage}
                  onChange={e => setJumpPage(e.target.value)}
                  placeholder={String(currentPage)}
                  min={1}
                  max={activeBook.totalPages}
                  className="w-14 text-center text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <span className="text-gray-400 text-sm">/ {activeBook.totalPages}</span>
              </form>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === activeBook.totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm text-sm font-medium"
              >
                Sau <ChevronRight size={16} />
              </button>

              <button
                onClick={() => goToPage(activeBook.totalPages)}
                disabled={currentPage === activeBook.totalPages}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={18} />
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              ← → để chuyển trang · B để bookmark
            </p>
          </div>
        </main>
      </div>

      <div id="ebook-selection-toolbar">
        <EbookSelectionToolbar
          selection={selection}
          onHighlight={addHighlight}
          onAddComment={addComment}
          onClose={() => { setSelection(null); window.getSelection()?.removeAllRanges() }}
        />
      </div>
    </div>
  )
}
