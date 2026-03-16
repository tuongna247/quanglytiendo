import { useCallback, useState } from 'react'
import { BookOpen, Upload, Trash2 } from 'lucide-react'
import type { EbookBook } from '@/types/ebook.types'

interface Props {
  books: EbookBook[]
  onUpload: (file: File) => void
  onOpenBook: (book: EbookBook) => void
  onDeleteBook: (id: string) => void
  loading: boolean
}

export default function EbookUploadPage({ books, onUpload, onOpenBook, onDeleteBook, loading }: Props) {
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    const name = file.name.toLowerCase()
    if (name.endsWith('.docx') || name.endsWith('.pdf')) onUpload(file)
  }, [onUpload])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="flex-1 bg-[#f5f0e8] overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Đọc Sách</h1>
          <p className="text-gray-500 mt-1 text-sm">Tải file Word để bắt đầu đọc với highlight & ghi chú</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('ebook-file-input')?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer
            ${dragging
              ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
              : 'border-indigo-300/60 bg-white/60 hover:border-indigo-400 hover:bg-white/80'
            }`}
        >
          <input
            id="ebook-file-input"
            type="file"
            accept=".docx,.pdf"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />

          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 border-[3px] border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-indigo-600 font-medium">Đang xử lý file...</p>
            </div>
          ) : (
            <>
              <Upload size={36} className="mx-auto text-indigo-400 mb-3" />
              <p className="text-gray-700 font-semibold text-lg">Kéo thả file vào đây</p>
              <p className="text-gray-400 text-sm mt-1">hoặc <span className="underline text-indigo-500">click để chọn file</span></p>
              <p className="text-xs text-gray-400 mt-2">Hỗ trợ <strong>.docx</strong> và <strong>.pdf</strong></p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                {['🎨 Highlight 5 màu', '💬 Ghi chú inline', '🔖 Đánh dấu trang', '📍 Nhớ vị trí đọc'].map(f => (
                  <span key={f} className="bg-white border border-gray-200 rounded-full px-3 py-1">{f}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Saved books */}
        {books.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">Sách đã lưu</h2>
            <div className="space-y-2">
              {books.map(book => (
                <div
                  key={book.id}
                  className="group flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => onOpenBook(book)}
                >
                  <div className="w-9 h-9 flex items-center justify-center bg-indigo-50 rounded-lg shrink-0">
                    <BookOpen size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{book.title}</p>
                    <p className="text-xs text-gray-400">{book.totalPages} trang · {new Date(book.uploadedAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteBook(book.id) }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-1"
                    title="Xóa sách"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
