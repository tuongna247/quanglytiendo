'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { IconChevronLeft, IconChevronRight, IconBook } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import { BOOK_ID_TO_NAME, BOOK_NAME_TO_ID } from '@/app/lib/bibleUtils';
import { getReadingForDate } from '@/app/lib/bibleReadingPlan';

// Bible book order for navigation
const BOOK_ORDER = [
  'gn','ex','lv','nm','dt','js','jud','rt','1sm','2sm','1kgs','2kgs',
  '1ch','2ch','ezr','ne','et','job','ps','prv','ec','so',
  'is','jr','lm','ez','dn','ho','jl','am','ob','jn','mi','na','hk','zp','hg','zc','ml',
  'mt','mk','lk','jo','act','rm','1co','2co','gl','eph','ph','cl',
  '1ts','2ts','1tm','2tm','tt','phm','hb','jm','1pe','2pe','1jo','2jo','3jo','jd','re',
];

// Cache bible data
let bibleCache = null;

async function loadBible() {
  if (bibleCache) return bibleCache;
  const res = await fetch('/bible.json');
  const data = await res.json();
  // Convert array to map for fast lookup
  const map = {};
  data.forEach(book => { map[book.id] = book.chapters; });
  bibleCache = map;
  return bibleCache;
}

function BibleReader() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initBook = searchParams.get('book') || 'gn';
  const initFrom = parseInt(searchParams.get('from') || '1', 10);
  const initTo = parseInt(searchParams.get('to') || '1', 10);

  const [bible, setBible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(initBook);
  const [selectedChapter, setSelectedChapter] = useState(initFrom);
  const [highlightRange, setHighlightRange] = useState({ from: initFrom, to: initTo });
  const contentRef = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayReading = getReadingForDate(todayStr);

  useEffect(() => {
    loadBible().then(data => { setBible(data); setLoading(false); });
  }, []);

  // Update URL when book/chapter changes
  useEffect(() => {
    const params = new URLSearchParams({ book: selectedBook, from: selectedChapter, to: highlightRange.to });
    router.replace(`/apps/bible?${params.toString()}`, { scroll: false });
  }, [selectedBook, selectedChapter]);

  const bookChapters = bible ? (bible[selectedBook] || []) : [];
  const totalChapters = bookChapters.length;
  const currentChapterVerses = bookChapters[selectedChapter - 1] || [];
  const bookName = BOOK_ID_TO_NAME[selectedBook] || selectedBook;
  const bookIndex = BOOK_ORDER.indexOf(selectedBook);

  function prevChapter() {
    if (selectedChapter > 1) {
      setSelectedChapter(c => c - 1);
      setHighlightRange({ from: 0, to: 0 });
    } else if (bookIndex > 0) {
      const prevBook = BOOK_ORDER[bookIndex - 1];
      setSelectedBook(prevBook);
      setSelectedChapter(1);
      setHighlightRange({ from: 0, to: 0 });
    }
  }

  function nextChapter() {
    if (selectedChapter < totalChapters) {
      setSelectedChapter(c => c + 1);
      setHighlightRange({ from: 0, to: 0 });
    } else if (bookIndex < BOOK_ORDER.length - 1) {
      setSelectedBook(BOOK_ORDER[bookIndex + 1]);
      setSelectedChapter(1);
      setHighlightRange({ from: 0, to: 0 });
    }
  }

  // Is this chapter within the highlight range?
  const isHighlighted = selectedBook === initBook &&
    selectedChapter >= highlightRange.from &&
    selectedChapter <= highlightRange.to;

  return (
    <Box>
      {/* Today's reading chip */}
      {todayReading && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<IconBook size={16} />}
            label={`Hôm nay: ${todayReading.passage}`}
            color="primary"
            variant="outlined"
            onClick={() => {
              const { parsePassage } = require('@/app/lib/bibleUtils');
              const p = parsePassage(todayReading.passage);
              if (p) {
                setSelectedBook(p.bookId);
                setSelectedChapter(p.chFrom);
                setHighlightRange({ from: p.chFrom, to: p.chTo });
              }
            }}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      )}

      {/* Controls */}
      <Card sx={{ borderRadius: 2, mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sách</InputLabel>
              <Select
                value={selectedBook}
                label="Sách"
                onChange={e => { setSelectedBook(e.target.value); setSelectedChapter(1); setHighlightRange({ from: 0, to: 0 }); }}
              >
                {BOOK_ORDER.map(id => (
                  <MenuItem key={id} value={id}>{BOOK_ID_TO_NAME[id] || id}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Chương</InputLabel>
              <Select
                value={selectedChapter}
                label="Chương"
                onChange={e => { setSelectedChapter(e.target.value); setHighlightRange({ from: 0, to: 0 }); }}
              >
                {Array.from({ length: totalChapters }, (_, i) => i + 1).map(ch => (
                  <MenuItem key={ch} value={ch}>{ch}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={prevChapter} size="small" disabled={selectedBook === BOOK_ORDER[0] && selectedChapter === 1}>
                <IconChevronLeft />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 120, textAlign: 'center', fontWeight: 600 }}>
                {bookName} {selectedChapter}
              </Typography>
              <IconButton onClick={nextChapter} size="small">
                <IconChevronRight />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Content */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent ref={contentRef}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                {bookName} — Chương {selectedChapter}
                {isHighlighted && (
                  <Chip label="Lịch đọc hôm nay" size="small" color="success" sx={{ ml: 1 }} />
                )}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {currentChapterVerses.map((verse, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    mb: 0.8,
                    py: 0.3,
                    px: 1,
                    borderRadius: 1,
                    bgcolor: isHighlighted ? 'primary.50' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      minWidth: 24,
                      fontWeight: 700,
                      color: 'primary.main',
                      mt: 0.3,
                      lineHeight: 1.8,
                    }}
                  >
                    {idx + 1}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.9, flex: 1 }}>
                    {verse}
                  </Typography>
                </Box>
              ))}

              {/* Chapter navigation at bottom */}
              <Divider sx={{ mt: 3, mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  startIcon={<IconChevronLeft size={16} />}
                  onClick={prevChapter}
                  disabled={selectedBook === BOOK_ORDER[0] && selectedChapter === 1}
                >
                  Chương trước
                </Button>
                <Button
                  endIcon={<IconChevronRight size={16} />}
                  onClick={nextChapter}
                >
                  Chương sau
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default function BiblePage() {
  return (
    <PageContainer title="Đọc Kinh Thánh" description="Kinh Thánh Tiếng Việt">
      <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}>
        <BibleReader />
      </Suspense>
    </PageContainer>
  );
}
