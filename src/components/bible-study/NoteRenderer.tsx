import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeRaw from 'rehype-raw'
import { preprocessSemantic, type Note } from '@/lib/bible-notes'
import '@/styles/bible-study.css'

interface NoteRendererProps {
  note: Note
}

export default function NoteRenderer({ note }: NoteRendererProps) {
  const processed = preprocessSemantic(note.body)
  const fm = note.frontmatter

  return (
    <article className="bible-note-body">
      <header className="mb-6 border-b border-slate-200 pb-4">
        {fm.tieu_de && (
          <h1 className="!mt-0 text-2xl font-bold text-slate-900">{fm.tieu_de}</h1>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          {fm.sach && fm.doan && (
            <span>
              📖 {fm.sach} {fm.doan}
              {fm.cau ? `:${fm.cau}` : ''}
            </span>
          )}
          {fm.ban_dich && <span>Bản dịch: {fm.ban_dich}</span>}
          {fm.trang_thai && (
            <span className={statusColor(fm.trang_thai)}>Trạng thái: {fm.trang_thai}</span>
          )}
          {fm.ngay_soan && <span>Soạn: {fm.ngay_soan}</span>}
        </div>
        {fm.song_song && fm.song_song.length > 0 && (
          <div className="mt-2 text-sm text-slate-600">
            <span className="font-medium">Song song:</span> {fm.song_song.join(' · ')}
          </div>
        )}
        {fm.chu_de && fm.chu_de.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {fm.chu_de.map(t => (
              <span key={t} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                #{t}
              </span>
            ))}
          </div>
        )}
      </header>

      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkFrontmatter]}
        rehypePlugins={[rehypeRaw]}
      >
        {processed}
      </ReactMarkdown>
    </article>
  )
}

function statusColor(status: string): string {
  switch (status) {
    case 'nhap':
      return 'text-slate-500'
    case 'dang-soan':
      return 'text-amber-600'
    case 'hoan-tat':
      return 'text-green-700'
    case 'da-day':
      return 'text-blue-700'
    default:
      return 'text-slate-500'
  }
}
