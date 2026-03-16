import { useMemo } from 'react'
import type { EbookHighlight, EbookComment } from '@/types/ebook.types'

interface EbookPageContentProps {
  pageNumber: number
  text: string
  highlights: EbookHighlight[]
  comments: EbookComment[]
  onTextSelection: (pageNumber: number) => void
}

const COLOR_MAP: Record<string, string> = {
  yellow: 'bg-yellow-200 border-yellow-400',
  green:  'bg-green-200 border-green-400',
  blue:   'bg-blue-200 border-blue-400',
  pink:   'bg-pink-200 border-pink-400',
  orange: 'bg-orange-200 border-orange-400',
}

interface Segment {
  text: string
  highlight?: EbookHighlight
  comment?: EbookComment
  start: number
  end: number
}

function buildSegments(text: string, highlights: EbookHighlight[], comments: EbookComment[]): Segment[] {
  type Boundary = { offset: number; type: 'start' | 'end'; annotation: EbookHighlight | EbookComment }
  const boundaries: Boundary[] = []

  for (const h of highlights) {
    if (h.startOffset < text.length && h.endOffset <= text.length) {
      boundaries.push({ offset: h.startOffset, type: 'start', annotation: h })
      boundaries.push({ offset: h.endOffset, type: 'end', annotation: h })
    }
  }
  for (const c of comments) {
    if (c.startOffset < text.length && c.endOffset <= text.length) {
      boundaries.push({ offset: c.startOffset, type: 'start', annotation: c })
      boundaries.push({ offset: c.endOffset, type: 'end', annotation: c })
    }
  }

  const offsets = [...new Set([0, text.length, ...boundaries.map(b => b.offset)])].sort((a, b) => a - b)

  const segments: Segment[] = []
  for (let i = 0; i < offsets.length - 1; i++) {
    const start = offsets[i]
    const end = offsets[i + 1]
    if (start === end) continue

    const activeHighlight = highlights.find(h => h.startOffset <= start && h.endOffset >= end)
    const activeComment = comments.find(c => c.startOffset <= start && c.endOffset >= end)

    segments.push({ text: text.slice(start, end), highlight: activeHighlight, comment: activeComment, start, end })
  }

  return segments
}

export default function EbookPageContent({
  pageNumber, text, highlights, comments, onTextSelection,
}: EbookPageContentProps) {
  const paragraphs = text.split('\n\n').filter(p => p.trim())
  const segments = useMemo(() => buildSegments(text, highlights, comments), [text, highlights, comments])

  const renderParagraph = (para: string, paraStart: number) => {
    const paraEnd = paraStart + para.length
    const paraSegments = segments.filter(s => s.start >= paraStart && s.end <= paraEnd + 1)

    if (paraSegments.length === 0) return <span>{para}</span>

    return (
      <>
        {paraSegments.map((seg, i) => {
          const base = 'rounded-sm border-b-2'
          if (seg.comment) {
            const colorClass = COLOR_MAP[seg.highlight?.color || 'yellow'] || 'bg-yellow-200 border-yellow-400'
            return (
              <span key={i} className={`${base} ${colorClass} cursor-pointer`} title={seg.comment.content}>
                {seg.text}
                <span className="inline-flex items-center ml-0.5 text-xs align-super">💬</span>
              </span>
            )
          }
          if (seg.highlight) {
            const colorClass = COLOR_MAP[seg.highlight.color] || 'bg-yellow-200 border-yellow-400'
            return <span key={i} className={`${base} ${colorClass}`}>{seg.text}</span>
          }
          return <span key={i}>{seg.text}</span>
        })}
      </>
    )
  }

  let offset = 0
  const paraItems: { text: string; start: number }[] = []
  for (const para of paragraphs) {
    const idx = text.indexOf(para, offset)
    paraItems.push({ text: para, start: idx })
    offset = idx + para.length + 2
  }

  return (
    <div
      id={`page-content-${pageNumber}`}
      className="font-serif text-[17px] leading-[1.9] text-gray-800 select-text"
      onMouseUp={() => onTextSelection(pageNumber)}
      onTouchEnd={() => onTextSelection(pageNumber)}
    >
      {paraItems.map((item, i) => (
        <p key={i} className="mb-5">
          {renderParagraph(item.text, item.start)}
        </p>
      ))}
    </div>
  )
}
