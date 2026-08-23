import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import PageContainer from '@/app/components/container/PageContainer'
import { listNoteMeta } from '@/app/lib/bibleNotes'

const CATEGORY_LABELS = {
  'ghi-chu': 'Ghi chú (Verse-by-verse)',
  'loi-thoai': 'Lời thoại',
  'tom-tat': 'Tóm tắt chương',
}

const STATUS_COLOR = {
  nhap: 'default',
  'dang-soan': 'warning',
  'hoan-tat': 'success',
  'da-day': 'info',
}

export const dynamic = 'force-static'

export default function BibleNotesPage() {
  const notes = listNoteMeta()

  const grouped = {}
  for (const n of notes) {
    const book = n.frontmatter?.sach || 'Không rõ'
    grouped[book] ??= []
    grouped[book].push(n)
  }

  return (
    <PageContainer
      title="Ghi chú Kinh Thánh"
      description="Ghi chú học Kinh Thánh theo semantic markup"
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Ghi chú Kinh Thánh
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {notes.length} bài đã soạn · semantic markup theo SPEC (Pandoc-style)
        </Typography>
      </Box>

      {Object.entries(grouped).map(([book, items]) => (
        <Box key={book} sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
            {book}
          </Typography>
          <Grid container spacing={2}>
            {items.map(note => (
              <Grid item xs={12} sm={6} lg={4} key={note.slug}>
                <Card
                  component={Link}
                  href={`/apps/bible-notes/${note.slug}`}
                  sx={{
                    textDecoration: 'none',
                    height: '100%',
                    transition: 'box-shadow 0.15s',
                    '&:hover': { boxShadow: 3 },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        label={CATEGORY_LABELS[note.category]}
                        size="small"
                        variant="outlined"
                      />
                      {note.frontmatter?.trang_thai && (
                        <Chip
                          label={note.frontmatter.trang_thai}
                          size="small"
                          color={STATUS_COLOR[note.frontmatter.trang_thai] || 'default'}
                        />
                      )}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {note.frontmatter?.tieu_de || note.slug}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {note.frontmatter?.sach} {note.frontmatter?.doan}
                      {note.frontmatter?.cau ? `:${note.frontmatter.cau}` : ''}
                    </Typography>
                    {note.frontmatter?.chu_de?.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {note.frontmatter.chu_de.map(t => (
                          <Chip key={t} label={`#${t}`} size="small" sx={{ height: 20 }} />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </PageContainer>
  )
}
