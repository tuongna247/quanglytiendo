import { useState } from 'react'
import { Bookmark as BookmarkIcon, MessageSquare, Trash2, Edit3, Check, X } from 'lucide-react'
import type { EbookBookmark, EbookComment } from '@/types/ebook.types'

interface Props {
  bookmarks: EbookBookmark[]
  comments: EbookComment[]
  currentPage: number
  onGoToPage: (page: number) => void
  onDeleteBookmark: (id: string) => void
  onDeleteComment: (id: string) => void
  onUpdateComment: (id: string, content: string) => void
}

type Tab = 'bookmarks' | 'comments'

export default function EbookSidebar({
  bookmarks, comments, currentPage,
  onGoToPage, onDeleteBookmark, onDeleteComment, onUpdateComment,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('bookmarks')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const sortedBookmarks = [...bookmarks].sort((a, b) => a.pageNumber - b.pageNumber)
  const sortedComments = [...comments].sort((a, b) => a.pageNumber - b.pageNumber || a.startOffset - b.startOffset)

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors
            ${activeTab === 'bookmarks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <BookmarkIcon size={14} />
          Bookmark ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors
            ${activeTab === 'comments' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <MessageSquare size={14} />
          Ghi chú ({comments.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'bookmarks' && (
          <>
            {sortedBookmarks.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                <BookmarkIcon size={32} className="mx-auto mb-2 opacity-30" />
                <p>Chưa có bookmark</p>
                <p className="text-xs mt-1">Nhấn 🔖 để đánh dấu trang</p>
              </div>
            )}
            {sortedBookmarks.map(b => (
              <div
                key={b.id}
                onClick={() => onGoToPage(b.pageNumber)}
                className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors
                  ${b.pageNumber === currentPage ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-transparent'}`}
              >
                <div className="flex items-center gap-2">
                  <BookmarkIcon size={14} className={b.pageNumber === currentPage ? 'text-indigo-600' : 'text-gray-400'} fill="currentColor" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{b.label}</p>
                    <p className="text-xs text-gray-400">Trang {b.pageNumber}</p>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteBookmark(b.id) }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </>
        )}

        {activeTab === 'comments' && (
          <>
            {sortedComments.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p>Chưa có ghi chú</p>
                <p className="text-xs mt-1">Chọn text rồi nhấn "Ghi chú"</p>
              </div>
            )}
            {sortedComments.map(c => (
              <div
                key={c.id}
                onClick={() => onGoToPage(c.pageNumber)}
                className={`group p-3 rounded-lg border cursor-pointer transition-colors
                  ${c.pageNumber === currentPage ? 'bg-amber-50 border-amber-200' : 'hover:bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Trang {c.pageNumber}</p>
                    <p className="text-xs italic text-gray-500 truncate mb-1.5">"{c.selectedText}"</p>

                    {editingId === c.id ? (
                      <div className="space-y-1.5">
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="w-full text-sm border border-indigo-300 rounded px-2 py-1 resize-none outline-none focus:ring-1 focus:ring-indigo-400"
                          rows={3}
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); onUpdateComment(c.id, editText); setEditingId(null) }}
                            className="flex items-center gap-1 text-xs px-2 py-0.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            <Check size={11} /> Lưu
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setEditingId(null) }}
                            className="flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            <X size={11} /> Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700">{c.content}</p>
                    )}
                  </div>

                  {editingId !== c.id && (
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); setEditingId(c.id); setEditText(c.content) }}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); onDeleteComment(c.id) }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
