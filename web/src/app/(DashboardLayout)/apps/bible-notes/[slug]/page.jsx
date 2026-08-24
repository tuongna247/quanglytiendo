import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import { IconArrowLeft } from '@tabler/icons-react'
import PageContainer from '@/app/components/container/PageContainer'
import { loadNote, listAllSlugs } from '@/app/lib/bibleNotes'

const STATUS_COLOR = {
  nhap: 'default',
  'dang-soan': 'warning',
  'hoan-tat': 'success',
  'da-day': 'info',
}

function formatDate(v) {
  if (!v) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v)
}

export async function generateStaticParams() {
  return listAllSlugs().map(slug => ({ slug }))
}

export const dynamic = 'force-static'

export default async function BibleNoteDetailPage({ params }) {
  const { slug } = await params
  const note = await loadNote(slug)

  if (!note) {
    return (
      <PageContainer title="Không tìm thấy">
        <Button component={Link} href="/apps/bible-notes" startIcon={<IconArrowLeft />}>
          Về danh sách
        </Button>
        <Typography sx={{ mt: 3 }}>
          Không tìm thấy bài <code>{slug}</code>
        </Typography>
      </PageContainer>
    )
  }

  const fm = note.frontmatter

  return (
    <PageContainer title={fm.tieu_de || slug} description={`${fm.sach} ${fm.doan}:${fm.cau || ''}`}>
      <Button
        component={Link}
        href="/apps/bible-notes"
        startIcon={<IconArrowLeft />}
        size="small"
        sx={{ mb: 2 }}
      >
        Về danh sách
      </Button>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 2, mb: 3 }}>
        {fm.tieu_de && (
          <Typography variant="h4" fontWeight={700}>
            {fm.tieu_de}
          </Typography>
        )}
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: 14, color: 'text.secondary' }}>
          {fm.sach && fm.doan && (
            <span>
              📖 {fm.sach} {fm.doan}
              {fm.cau ? `:${fm.cau}` : ''}
            </span>
          )}
          {fm.ban_dich && <span>Bản dịch: {fm.ban_dich}</span>}
          {fm.ngay_soan && <span>Soạn: {formatDate(fm.ngay_soan)}</span>}
          {fm.trang_thai && (
            <Chip
              label={fm.trang_thai}
              size="small"
              color={STATUS_COLOR[fm.trang_thai] || 'default'}
              sx={{ height: 20 }}
            />
          )}
        </Box>
        {fm.song_song?.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Song song:</strong> {fm.song_song.join(' · ')}
          </Typography>
        )}
        {fm.chu_de?.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {fm.chu_de.map(t => (
              <Chip key={t} label={`#${t}`} size="small" sx={{ height: 22 }} />
            ))}
          </Box>
        )}
      </Box>

      <article
        className="bible-note-body"
        dangerouslySetInnerHTML={{ __html: note.html }}
      />
    </PageContainer>
  )
}
