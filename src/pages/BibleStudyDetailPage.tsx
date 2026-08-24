import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { findNote } from '@/lib/bible-notes'
import NoteRenderer from '@/components/bible-study/NoteRenderer'

export default function BibleStudyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const note = slug ? findNote(slug) : undefined

  if (!note) {
    return (
      <div className="p-6">
        <Link to="/bible-study" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Về danh sách
        </Link>
        <div className="mt-6 text-slate-600">Không tìm thấy bài <code>{slug}</code></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Link
        to="/bible-study"
        className="mb-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Về danh sách
      </Link>
      <NoteRenderer note={note} />
    </div>
  )
}
