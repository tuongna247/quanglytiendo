import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadAllNotes, type Note } from '@/lib/bible-notes'

const CATEGORY_LABELS: Record<Note['category'], string> = {
  'ghi-chu': 'Ghi chú (Verse-by-verse)',
  'loi-thoai': 'Lời thoại',
  'tom-tat': 'Tóm tắt chương',
}

export default function BibleStudyPage() {
  const notes = useMemo(() => loadAllNotes(), [])
  const [filter, setFilter] = useState<Note['category'] | 'all'>('all')

  const grouped = useMemo(() => {
    const filtered = filter === 'all' ? notes : notes.filter(n => n.category === filter)
    const map: Record<string, Note[]> = {}
    for (const n of filtered) {
      const book = n.frontmatter.sach || 'Không rõ'
      map[book] ??= []
      map[book].push(n)
    }
    return map
  }, [notes, filter])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bible Study — Ghi chú học Kinh Thánh</h1>
          <p className="mt-1 text-sm text-slate-600">
            {notes.length} bài đã soạn · semantic markup theo{' '}
            <a href="/bible-study/SPEC" className="text-blue-600 hover:underline">
              SPEC
            </a>
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <FilterButton value="all" current={filter} onClick={setFilter}>
          Tất cả ({notes.length})
        </FilterButton>
        {(Object.keys(CATEGORY_LABELS) as Note['category'][]).map(cat => (
          <FilterButton key={cat} value={cat} current={filter} onClick={setFilter}>
            {CATEGORY_LABELS[cat]} ({notes.filter(n => n.category === cat).length})
          </FilterButton>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([book, items]) => (
          <section key={book}>
            <h2 className="mb-2 text-lg font-semibold text-slate-800">{book}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(note => (
                <Link
                  key={note.slug}
                  to={`/bible-study/${note.slug}`}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-400 hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {CATEGORY_LABELS[note.category]}
                    </span>
                    {note.frontmatter.trang_thai && (
                      <span className="text-xs text-slate-400">
                        {note.frontmatter.trang_thai}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-medium text-slate-900">
                    {note.frontmatter.tieu_de || note.slug}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {note.frontmatter.sach} {note.frontmatter.doan}
                    {note.frontmatter.cau ? `:${note.frontmatter.cau}` : ''}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

interface FilterButtonProps {
  value: Note['category'] | 'all'
  current: Note['category'] | 'all'
  onClick: (v: Note['category'] | 'all') => void
  children: React.ReactNode
}

function FilterButton({ value, current, onClick, children }: FilterButtonProps) {
  const active = value === current
  return (
    <button
      onClick={() => onClick(value)}
      className={
        active
          ? 'rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white'
          : 'rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50'
      }
    >
      {children}
    </button>
  )
}
