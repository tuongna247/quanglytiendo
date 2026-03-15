'use client';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import { IconChevronLeft, IconChevronRight, IconBook, IconArrowsMaximize, IconArrowsMinimize, IconList, IconAlignLeft, IconCircleCheck, IconCircle } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';
import { BOOK_ID_TO_NAME, BOOK_NAME_TO_ID, parsePassage } from '@/app/lib/bibleUtils';
import { BIBLE_READING_PLAN, getReadingForDate, DAY_LABELS, DAYS } from '@/app/lib/bibleReadingPlan';

// ── Constants ────────────────────────────────────────────────────────────────
const BOOK_ORDER = [
  'gn','ex','lv','nm','dt','js','jud','rt','1sm','2sm','1kgs','2kgs',
  '1ch','2ch','ezr','ne','et','job','ps','prv','ec','so',
  'is','jr','lm','ez','dn','ho','jl','am','ob','jn','mi','na','hk','zp','hg','zc','ml',
  'mt','mk','lk','jo','act','rm','1co','2co','gl','eph','ph','cl',
  '1ts','2ts','1tm','2tm','tt','phm','hb','jm','1pe','2pe','1jo','2jo','3jo','jd','re',
];

const BOOK_GROUPS = [
  { label: 'Luật Pháp (Torah)', books: ['gn','ex','lv','nm','dt'] },
  { label: 'Lịch Sử', books: ['js','jud','rt','1sm','2sm','1kgs','2kgs','1ch','2ch','ezr','ne','et'] },
  { label: 'Thơ & Khôn Ngoan', books: ['job','ps','prv','ec','so'] },
  { label: 'Tiên Tri Lớn', books: ['is','jr','lm','ez','dn'] },
  { label: 'Tiên Tri Nhỏ', books: ['ho','jl','am','ob','jn','mi','na','hk','zp','hg','zc','ml'] },
  { label: 'Phúc Âm', books: ['mt','mk','lk','jo'] },
  { label: 'Công Vụ', books: ['act'] },
  { label: 'Thư Phao-lô', books: ['rm','1co','2co','gl','eph','ph','cl','1ts','2ts','1tm','2tm','tt','phm'] },
  { label: 'Thư Chung', books: ['hb','jm','1pe','2pe','1jo','2jo','3jo','jd'] },
  { label: 'Khải Huyền', books: ['re'] },
];

const HIGHLIGHT_COLORS = [
  { label: 'Xóa', value: null, bg: '#eee' },
  { label: 'Vàng', value: '#FFF176', bg: '#FFF176' },
  { label: 'Xanh lá', value: '#A5D6A7', bg: '#A5D6A7' },
  { label: 'Xanh dương', value: '#90CAF9', bg: '#90CAF9' },
  { label: 'Hồng', value: '#F48FB1', bg: '#F48FB1' },
  { label: 'Cam', value: '#FFCC80', bg: '#FFCC80' },
  { label: 'Tím', value: '#CE93D8', bg: '#CE93D8' },
];

const FONTS = [
  { label: 'Mặc định', value: 'inherit' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Times', value: '"Times New Roman", serif' },
  { label: 'Palatino', value: '"Palatino Linotype", serif' },
];

const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];

let bibleCache = null;
async function loadBible() {
  if (bibleCache) return bibleCache;
  const res = await fetch('/bible.json');
  const data = await res.json();
  const map = {};
  data.forEach(book => { map[book.id] = book.chapters; });
  bibleCache = map;
  return bibleCache;
}

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getCurrentWeekIdx() {
  const today = toLocalDateStr(new Date());
  for (let i = BIBLE_READING_PLAN.length - 1; i >= 0; i--) {
    if (BIBLE_READING_PLAN[i].startDate <= today) return i;
  }
  return 0;
}

// ── Highlight toolbar ────────────────────────────────────────────────────────
function HighlightToolbar({ activeColor, onColorChange, paragraphMode, onParagraphToggle, spotlight, onSpotlight, fontFamily, onFont, fontSize, onFontSize }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', py: 1, px: 0.5, mb: 1 }}>
      {/* Highlight colors */}
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {HIGHLIGHT_COLORS.map(c => (
          <Tooltip key={c.label} title={c.label}>
            <Box
              onClick={() => onColorChange(c.value)}
              sx={{
                width: 22, height: 22, borderRadius: '50%',
                bgcolor: c.bg,
                border: activeColor === c.value ? '2px solid #1976d2' : '1px solid #ccc',
                cursor: 'pointer', flexShrink: 0,
                '&:hover': { transform: 'scale(1.2)' },
              }}
            />
          </Tooltip>
        ))}
      </Box>
      <Divider orientation="vertical" flexItem />
      {/* Font family */}
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <Select value={fontFamily} onChange={e => onFont(e.target.value)} variant="standard" disableUnderline sx={{ fontSize: 13 }}>
          {FONTS.map(f => <MenuItem key={f.value} value={f.value} sx={{ fontFamily: f.value, fontSize: 13 }}>{f.label}</MenuItem>)}
        </Select>
      </FormControl>
      {/* Font size */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
        <IconButton size="small" onClick={() => onFontSize(s => Math.max(12, s - 1))}><Typography sx={{ fontSize: 13, lineHeight: 1 }}>A-</Typography></IconButton>
        <Typography variant="caption" sx={{ minWidth: 24, textAlign: 'center' }}>{fontSize}</Typography>
        <IconButton size="small" onClick={() => onFontSize(s => Math.min(28, s + 1))}><Typography sx={{ fontSize: 13, lineHeight: 1 }}>A+</Typography></IconButton>
      </Box>
      <Divider orientation="vertical" flexItem />
      {/* Paragraph mode */}
      <Tooltip title={paragraphMode ? 'Đang xem đoạn văn — đổi sang từng câu' : 'Đang xem từng câu — đổi sang đoạn văn'}>
        <IconButton size="small" onClick={onParagraphToggle} color={paragraphMode ? 'primary' : 'default'}>
          {paragraphMode ? <IconAlignLeft size={18} /> : <IconList size={18} />}
        </IconButton>
      </Tooltip>
      {/* Spotlight */}
      <Tooltip title={spotlight ? 'Tắt spotlight' : 'Spotlight — chỉ hiện nội dung KT'}>
        <IconButton size="small" onClick={onSpotlight} color={spotlight ? 'warning' : 'default'}>
          {spotlight ? <IconArrowsMinimize size={18} /> : <IconArrowsMaximize size={18} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// ── Bible text renderer ──────────────────────────────────────────────────────
function BibleTextContent({ chapters, chapterOffset, paragraphMode, highlights, activeColor, onHighlight, fontFamily, fontSize, highlightedRange }) {
  if (paragraphMode) {
    return (
      <Box sx={{ fontFamily, fontSize, lineHeight: 2 }}>
        {chapters.map((verses, chIdx) => {
          const chNum = chapterOffset + chIdx;
          return (
            <Box key={chIdx} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, fontFamily }}>
                Chương {chNum}
              </Typography>
              <Typography component="p" sx={{ lineHeight: 2, fontFamily, fontSize }}>
                {verses.map((verse, vIdx) => {
                  const key = `${chNum}:${vIdx + 1}`;
                  const bg = highlights[key];
                  const isInRange = highlightedRange && chNum >= highlightedRange.chFrom && chNum <= highlightedRange.chTo;
                  return (
                    <Box
                      key={vIdx}
                      component="span"
                      onClick={() => onHighlight(key)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: bg || (isInRange ? 'primary.50' : 'transparent'),
                        borderRadius: 0.5, px: 0.2,
                        '&:hover': { bgcolor: bg || '#f5f5f5' },
                      }}
                    >
                      <Box component="sup" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.7em', mr: 0.3 }}>{vIdx + 1}</Box>
                      {verse}{' '}
                    </Box>
                  );
                })}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  }

  // Verse-by-verse mode
  return (
    <Box sx={{ fontFamily, fontSize }}>
      {chapters.map((verses, chIdx) => {
        const chNum = chapterOffset + chIdx;
        const isInRange = highlightedRange && chNum >= highlightedRange.chFrom && chNum <= highlightedRange.chTo;
        return (
          <Box key={chIdx} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, fontFamily }}>
              Chương {chNum}
            </Typography>
            {verses.map((verse, vIdx) => {
              const key = `${chNum}:${vIdx + 1}`;
              const bg = highlights[key];
              return (
                <Box
                  key={vIdx}
                  onClick={() => onHighlight(key)}
                  sx={{
                    display: 'flex', gap: 1.5, mb: 0.5, py: 0.3, px: 1, borderRadius: 1,
                    bgcolor: bg || (isInRange ? 'primary.50' : 'transparent'),
                    cursor: 'pointer',
                    '&:hover': { bgcolor: bg || 'action.hover' },
                  }}
                >
                  <Typography variant="caption" sx={{ minWidth: 22, fontWeight: 700, color: 'primary.main', mt: 0.3, lineHeight: 1.9, fontFamily }}>
                    {vIdx + 1}
                  </Typography>
                  <Typography sx={{ lineHeight: 1.9, flex: 1, fontFamily, fontSize }}>{verse}</Typography>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}

// ── Tab 1: Bible Reader ───────────────────────────────────────────────────────
function ReaderTab({ initBook, initFrom, initTo, onNavigate }) {
  const [bible, setBible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(initBook);
  const [chapterFrom, setChapterFrom] = useState(initFrom);
  const [chapterTo, setChapterTo] = useState(initTo);
  const [paragraphMode, setParagraphMode] = useState(false);
  const [spotlight, setSpotlight] = useState(false);
  const [fontFamily, setFontFamily] = useState('inherit');
  const [fontSize, setFontSize] = useState(16);
  const [activeColor, setActiveColor] = useState('#FFF176');
  const [highlights, setHighlights] = useState({});
  const [completed, setCompleted] = useState({});
  const [toggling, setToggling] = useState(false);
  const hlKey = `qlTD_hl_${selectedBook}_${chapterFrom}`;

  useEffect(() => {
    loadBible().then(data => { setBible(data); setLoading(false); });
    // Load completed dates from backend
    apiClient.get('/api/bible-reading-log')
      .then(data => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(d => { map[d] = true; });
          setCompleted(map);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(hlKey);
      setHighlights(raw ? JSON.parse(raw) : {});
    } catch { setHighlights({}); }
  }, [hlKey]);

  useEffect(() => {
    onNavigate(selectedBook, chapterFrom, chapterTo);
  }, [selectedBook, chapterFrom, chapterTo]);

  async function toggleCompleted(dateStr) {
    setToggling(true);
    setCompleted(prev => {
      const next = { ...prev };
      if (next[dateStr]) delete next[dateStr]; else next[dateStr] = true;
      return next;
    });
    try {
      await apiClient.post('/api/bible-reading-log', { date: dateStr });
    } catch {
      setCompleted(prev => {
        const next = { ...prev };
        if (next[dateStr]) delete next[dateStr]; else next[dateStr] = true;
        return next;
      });
    } finally { setToggling(false); }
  }

  const bookChapters = bible ? (bible[selectedBook] || []) : [];
  const totalChapters = bookChapters.length;
  const bookName = BOOK_ID_TO_NAME[selectedBook] || selectedBook;
  const bookIndex = BOOK_ORDER.indexOf(selectedBook);

  // Chapters to display: from chapterFrom to chapterTo (inclusive)
  const displayChapters = bookChapters.slice(chapterFrom - 1, chapterTo);

  function goBook(bookId, from = 1) {
    setSelectedBook(bookId);
    setChapterFrom(from);
    setChapterTo(from);
    setHighlights({});
  }

  function prevChapter() {
    if (chapterFrom > 1) {
      setChapterFrom(c => c - 1); setChapterTo(c => c - 1);
    } else if (bookIndex > 0) {
      const prevBook = BOOK_ORDER[bookIndex - 1];
      const prevTotal = bible ? (bible[prevBook] || []).length : 1;
      goBook(prevBook, prevTotal);
    }
  }

  function nextChapter() {
    if (chapterFrom < totalChapters) {
      setChapterFrom(c => c + 1); setChapterTo(c => c + 1);
    } else if (bookIndex < BOOK_ORDER.length - 1) {
      goBook(BOOK_ORDER[bookIndex + 1], 1);
    }
  }

  function applyHighlight(key) {
    setHighlights(prev => {
      const next = { ...prev };
      if (activeColor === null || prev[key] === activeColor) delete next[key];
      else next[key] = activeColor;
      try { localStorage.setItem(hlKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const todayStr = toLocalDateStr(new Date());
  const todayReading = getReadingForDate(todayStr);

  const highlightedRange = selectedBook === initBook ? { chFrom: initFrom, chTo: initTo } : null;

  // Find which plan date corresponds to the current passage being read
  const planDateForCurrent = (() => {
    const parsed = todayReading ? parsePassage(todayReading.passage) : null;
    if (parsed && parsed.bookId === selectedBook &&
        chapterFrom >= parsed.chFrom && chapterFrom <= parsed.chTo) {
      return todayStr;
    }
    // Search nearby weeks for a matching passage
    for (const week of BIBLE_READING_PLAN) {
      for (let i = 0; i < DAY_KEYS.length; i++) {
        const p = parsePassage(week[DAY_KEYS[i]] || '');
        if (p && p.bookId === selectedBook && chapterFrom >= p.chFrom && chapterFrom <= p.chTo) {
          const d = new Date(week.startDate + 'T00:00:00');
          d.setDate(d.getDate() + i);
          return toLocalDateStr(d);
        }
      }
    }
    return null;
  })();
  const isCurrentDone = planDateForCurrent ? !!completed[planDateForCurrent] : false;

  if (spotlight) {
    return (
      <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.paper', zIndex: 1300, overflow: 'auto', p: 4 }}>
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{bookName} {chapterFrom}{chapterTo > chapterFrom ? `–${chapterTo}` : ''}</Typography>
            <IconButton onClick={() => setSpotlight(false)}><IconArrowsMinimize size={20} /></IconButton>
          </Box>
          <HighlightToolbar
            activeColor={activeColor} onColorChange={setActiveColor}
            paragraphMode={paragraphMode} onParagraphToggle={() => setParagraphMode(m => !m)}
            spotlight={spotlight} onSpotlight={() => setSpotlight(false)}
            fontFamily={fontFamily} onFont={setFontFamily}
            fontSize={fontSize} onFontSize={setFontSize}
          />
          {loading ? <CircularProgress /> : (
            <BibleTextContent chapters={displayChapters} chapterOffset={chapterFrom} paragraphMode={paragraphMode} highlights={highlights} activeColor={activeColor} onHighlight={applyHighlight} fontFamily={fontFamily} fontSize={fontSize} highlightedRange={highlightedRange} />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Today's reading */}
      {todayReading && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<IconBook size={16} />}
            label={`Hôm nay: ${todayReading.passage}`}
            color="primary"
            variant="outlined"
            onClick={() => {
              const p = parsePassage(todayReading.passage);
              if (p) { setSelectedBook(p.bookId); setChapterFrom(p.chFrom); setChapterTo(p.chTo); }
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
              <Select value={selectedBook} label="Sách" onChange={e => goBook(e.target.value)}>
                {BOOK_ORDER.map(id => <MenuItem key={id} value={id}>{BOOK_ID_TO_NAME[id] || id}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>Chương</InputLabel>
              <Select value={chapterFrom} label="Chương" onChange={e => { setChapterFrom(e.target.value); setChapterTo(e.target.value); }}>
                {Array.from({ length: totalChapters }, (_, i) => i + 1).map(ch => (
                  <MenuItem key={ch} value={ch}>{ch}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={prevChapter} size="small" disabled={selectedBook === BOOK_ORDER[0] && chapterFrom === 1}>
                <IconChevronLeft />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 130, textAlign: 'center', fontWeight: 600 }}>
                {bookName} {chapterFrom}{chapterTo > chapterFrom ? `–${chapterTo}` : ''}
              </Typography>
              <IconButton onClick={nextChapter} size="small">
                <IconChevronRight />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Reading toolbar */}
      <Card sx={{ borderRadius: 2, mb: 2 }}>
        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
          <HighlightToolbar
            activeColor={activeColor} onColorChange={setActiveColor}
            paragraphMode={paragraphMode} onParagraphToggle={() => setParagraphMode(m => !m)}
            spotlight={spotlight} onSpotlight={() => setSpotlight(true)}
            fontFamily={fontFamily} onFont={setFontFamily}
            fontSize={fontSize} onFontSize={setFontSize}
          />
        </CardContent>
      </Card>

      {/* Content */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : (
            <>
              <BibleTextContent
                chapters={displayChapters}
                chapterOffset={chapterFrom}
                paragraphMode={paragraphMode}
                highlights={highlights}
                activeColor={activeColor}
                onHighlight={applyHighlight}
                fontFamily={fontFamily}
                fontSize={fontSize}
                highlightedRange={highlightedRange}
              />
              <Divider sx={{ my: 2 }} />

              {/* Mark as done — shown when passage is in reading plan */}
              {planDateForCurrent && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Button
                    variant={isCurrentDone ? 'contained' : 'outlined'}
                    color={isCurrentDone ? 'success' : 'primary'}
                    size="large"
                    startIcon={isCurrentDone ? <IconCircleCheck size={20} /> : <IconCircle size={20} />}
                    disabled={toggling}
                    onClick={() => toggleCompleted(planDateForCurrent)}
                    sx={{ minWidth: 200, borderRadius: 3 }}
                  >
                    {toggling ? '...' : isCurrentDone ? 'Đã đọc xong ✓' : 'Đánh dấu đã đọc'}
                  </Button>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button startIcon={<IconChevronLeft size={16} />} onClick={prevChapter} disabled={selectedBook === BOOK_ORDER[0] && chapterFrom === 1}>Trước</Button>
                <Button endIcon={<IconChevronRight size={16} />} onClick={nextChapter}>Tiếp</Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// ── Tab 2: Reading Plan ───────────────────────────────────────────────────────
function ReadingPlanTab({ onReadBook }) {
  const [weekIdx, setWeekIdx] = useState(getCurrentWeekIdx);
  const [completed, setCompleted] = useState({});

  const todayStr = toLocalDateStr(new Date());

  useEffect(() => {
    apiClient.get('/api/bible-reading-log')
      .then(data => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(d => { map[d] = true; });
          setCompleted(map);
        }
      })
      .catch(() => {});
  }, []);

  function getDateForDay(weekStartDate, dayIdx) {
    const d = new Date(weekStartDate + 'T00:00:00');
    d.setDate(d.getDate() + dayIdx);
    return toLocalDateStr(d);
  }

  const week = BIBLE_READING_PLAN[weekIdx];
  if (!week) return null;

  const weekDates = DAY_KEYS.map((_, idx) => getDateForDay(week.startDate, idx));
  const weekDoneCount = weekDates.filter(d => completed[d]).length;

  return (
    <Box>
      {/* Week navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <IconButton onClick={() => setWeekIdx(i => Math.max(0, i - 1))} disabled={weekIdx === 0}><IconChevronLeft /></IconButton>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Tuần {week.week}</Typography>
          <Typography variant="caption" color="textSecondary">
            {new Date(week.startDate + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            {' – '}
            {(() => { const e = new Date(week.startDate + 'T00:00:00'); e.setDate(e.getDate() + 6); return e.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); })()}
          </Typography>
        </Box>
        <IconButton onClick={() => setWeekIdx(i => Math.min(BIBLE_READING_PLAN.length - 1, i + 1))} disabled={weekIdx === BIBLE_READING_PLAN.length - 1}><IconChevronRight /></IconButton>
      </Box>

      {/* Week progress */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button size="small" variant="outlined" onClick={() => setWeekIdx(getCurrentWeekIdx())}>Tuần hiện tại</Button>
        <Chip
          label={`${weekDoneCount}/7 ngày đã đọc`}
          size="small"
          color={weekDoneCount === 7 ? 'success' : weekDoneCount > 0 ? 'warning' : 'default'}
          icon={weekDoneCount === 7 ? <IconCircleCheck size={14} /> : undefined}
        />
      </Box>

      {/* 7 day cards */}
      <Grid container spacing={1.5}>
        {DAY_KEYS.map((key, idx) => {
          const passage = week[key];
          const dateStr = weekDates[idx];
          const isToday = dateStr === todayStr;
          const isDone = !!completed[dateStr];
          const parsed = passage ? parsePassage(passage) : null;
          const isToggling = toggling === dateStr;

          return (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 2,
                  border: isToday ? '2px solid' : '1px solid',
                  borderColor: isDone ? 'success.main' : isToday ? 'primary.main' : 'divider',
                  bgcolor: isDone ? 'success.50' : isToday ? 'primary.50' : 'background.paper',
                  opacity: isDone && !isToday ? 0.85 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <CardContent sx={{ pb: '12px !important' }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: isDone ? 'success.main' : isToday ? 'primary.main' : 'text.secondary' }}>
                      {DAY_LABELS[key]}
                      {isToday && !isDone && <Chip label="Hôm nay" size="small" color="primary" sx={{ ml: 0.5, height: 16, fontSize: 10 }} />}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(dateStr + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </Typography>
                  </Box>

                  {/* Passage */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      textDecoration: isDone ? 'line-through' : 'none',
                      color: isDone ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {passage || '-'}
                  </Typography>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {parsed && (
                      <Button
                        size="small"
                        variant={isDone ? 'text' : 'outlined'}
                        sx={{ flex: 1 }}
                        startIcon={<IconBook size={14} />}
                        onClick={() => onReadBook(parsed.bookId, parsed.chFrom, parsed.chTo)}
                      >
                        Đọc
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant={isDone ? 'contained' : 'outlined'}
                      color={isDone ? 'success' : 'inherit'}
                      disabled={isToggling}
                      startIcon={isDone ? <IconCircleCheck size={14} /> : <IconCircle size={14} />}
                      onClick={() => toggleDay(dateStr)}
                      sx={{ flex: 1, fontSize: 12 }}
                    >
                      {isToggling ? '...' : isDone ? 'Đã đọc' : 'Chưa đọc'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

// ── Tab 3: All Books ──────────────────────────────────────────────────────────
function AllBooksTab({ onSelectBook }) {
  const isOT = (id) => ['gn','ex','lv','nm','dt','js','jud','rt','1sm','2sm','1kgs','2kgs','1ch','2ch','ezr','ne','et','job','ps','prv','ec','so','is','jr','lm','ez','dn','ho','jl','am','ob','jn','mi','na','hk','zp','hg','zc','ml'].includes(id);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip label="Cựu Ước (39)" color="warning" variant="outlined" size="small" />
        <Chip label="Tân Ước (27)" color="primary" variant="outlined" size="small" />
      </Box>
      {BOOK_GROUPS.map(group => (
        <Box key={group.label} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: isOT(group.books[0]) ? 'warning.dark' : 'primary.dark' }}>
            {group.label}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {group.books.map(id => (
              <Chip
                key={id}
                label={BOOK_ID_TO_NAME[id] || id}
                variant="outlined"
                size="small"
                clickable
                color={isOT(id) ? 'warning' : 'primary'}
                onClick={() => onSelectBook(id)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ── Main BibleReader (with tabs) ─────────────────────────────────────────────
function BibleReader() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initBook = searchParams.get('book') || 'gn';
  const initFrom = parseInt(searchParams.get('from') || '1', 10);
  const initTo = parseInt(searchParams.get('to') || '1', 10);

  const [tab, setTab] = useState(0);
  const [readerBook, setReaderBook] = useState(initBook);
  const [readerFrom, setReaderFrom] = useState(initFrom);
  const [readerTo, setReaderTo] = useState(initTo);

  function handleNavigate(bookId, from, to) {
    setReaderBook(bookId); setReaderFrom(from); setReaderTo(to);
    const params = new URLSearchParams({ book: bookId, from, to });
    router.replace(`/apps/bible?${params.toString()}`, { scroll: false });
  }

  function goReadBook(bookId, chFrom, chTo) {
    setReaderBook(bookId); setReaderFrom(chFrom); setReaderTo(chTo);
    setTab(0);
    const params = new URLSearchParams({ book: bookId, from: chFrom, to: chTo });
    router.replace(`/apps/bible?${params.toString()}`, { scroll: false });
  }

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Đọc" />
        <Tab label="Lịch đọc" />
        <Tab label="Tất cả sách" />
      </Tabs>

      {tab === 0 && (
        <ReaderTab
          key={`${readerBook}-${readerFrom}-${readerTo}`}
          initBook={readerBook}
          initFrom={readerFrom}
          initTo={readerTo}
          onNavigate={handleNavigate}
        />
      )}
      {tab === 1 && <ReadingPlanTab onReadBook={goReadBook} />}
      {tab === 2 && <AllBooksTab onSelectBook={id => goReadBook(id, 1, 1)} />}
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
