import { useEffect, useRef, useState } from 'react'
import { MessageSquarePlus, X } from 'lucide-react'
import type { SelectionInfo, HighlightColor } from '@/types/ebook.types'

interface Props {
  selection: SelectionInfo | null
  onHighlight: (color: HighlightColor) => void
  onAddComment: (content: string) => void
  onClose: () => void
}

const COLORS: { value: HighlightColor; bg: string; label: string }[] = [
  { value: 'yellow', bg: 'bg-yellow-300', label: 'Vàng' },
  { value: 'green',  bg: 'bg-green-300',  label: 'Xanh lá' },
  { value: 'blue',   bg: 'bg-blue-300',   label: 'Xanh dương' },
  { value: 'pink',   bg: 'bg-pink-300',   label: 'Hồng' },
  { value: 'orange', bg: 'bg-orange-300', label: 'Cam' },
]

export default function EbookSelectionToolbar({ selection, onHighlight, onAddComment, onClose }: Props) {
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!selection?.range) return
    setShowCommentInput(false)
    setCommentText('')

    const rect = selection.range.getBoundingClientRect()
    setPosition({
      top: rect.top + window.scrollY - 60,
      left: rect.left + window.scrollX + rect.width / 2,
    })
  }, [selection])

  if (!selection) return null

  const handleComment = () => {
    if (!commentText.trim()) return
    onAddComment(commentText.trim())
    setCommentText('')
    setShowCommentInput(false)
  }

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50"
      style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
    >
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl px-3 py-2 flex flex-col gap-2 min-w-[220px]">
        <div className="text-xs text-gray-400 truncate max-w-[200px] border-b border-gray-700 pb-1.5">
          "{selection.text.slice(0, 50)}{selection.text.length > 50 ? '…' : ''}"
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => onHighlight(c.value)}
                title={`Highlight ${c.label}`}
                className={`w-5 h-5 rounded-full ${c.bg} hover:scale-125 transition-transform border-2 border-transparent hover:border-white`}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-gray-600" />

          <button
            onClick={() => setShowCommentInput(v => !v)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-gray-700 hover:bg-indigo-600 transition-colors"
          >
            <MessageSquarePlus size={13} />
            Ghi chú
          </button>

          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        </div>

        {showCommentInput && (
          <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-700">
            <textarea
              autoFocus
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Nhập ghi chú..."
              className="w-full bg-gray-800 text-white text-xs rounded-lg px-2 py-1.5 resize-none outline-none border border-gray-600 focus:border-indigo-400 min-h-[60px]"
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleComment() }}
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">Ctrl+Enter để lưu</span>
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="text-xs px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900" />
    </div>
  )
}
