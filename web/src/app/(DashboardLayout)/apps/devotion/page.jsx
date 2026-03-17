'use client';
import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import { IconChevronLeft, IconChevronRight, IconPlus, IconTrash, IconBook, IconExternalLink, IconChevronDown, IconChevronUp, IconArrowsMaximize, IconArrowsMinimize } from '@tabler/icons-react';
import Link from 'next/link';

import PageContainer from '@/app/components/container/PageContainer';
import BibleVerseSelector from '@/app/components/BibleVerseSelector';
import apiClient from '@/app/lib/apiClient';
import { getReadingForDate } from '@/app/lib/bibleReadingPlan';
import { bibleUrl, parsePassage, BOOK_ID_TO_NAME } from '@/app/lib/bibleUtils';
import { BIBLE_BOOKS } from '@/app/lib/bibleData';

const VI_WEEKDAYS = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
const VI_MONTHS = ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6','tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12'];

const FONTS = [
  { label: 'Mặc định', value: 'inherit' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Times', value: '"Times New Roman", serif' },
  { label: 'Palatino', value: '"Palatino Linotype", Palatino, serif' },
  { label: 'Mono', value: '"Courier New", monospace' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Xóa', value: null },
  { label: 'Vàng', value: '#FFF176' },
  { label: 'Xanh lá', value: '#A5D6A7' },
  { label: 'Xanh dương', value: '#90CAF9' },
  { label: 'Hồng', value: '#F48FB1' },
  { label: 'Cam', value: '#FFCC80' },
  { label: 'Tím', value: '#CE93D8' },
  { label: 'Ngọc', value: '#80DEEA' },
  { label: 'Đỏ nhạt', value: '#EF9A9A' },
  { label: 'Xám', value: '#CFD8DC' },
];

const MOODS = [
  { value: 'grateful', label: 'Biết ơn', color: 'success' },
  { value: 'challenged', label: 'Thách thức', color: 'warning' },
  { value: 'peaceful', label: 'Bình an', color: 'info' },
  { value: 'struggling', label: 'Khó khăn', color: 'error' },
  { value: 'joyful', label: 'Vui mừng', color: 'primary' },
];


// Fixed: use local date fields (not UTC toISOString) to avoid timezone offset in Vietnam (UTC+7)
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatViDate(d) { return `${VI_WEEKDAYS[d.getDay()]}, ${d.getDate()} ${VI_MONTHS[d.getMonth()]} ${d.getFullYear()}`; }

const emptyPassage = { book: '', chapter: '', verseStart: '', verseEnd: '' };
const emptyForm = {
  biblePassages: [],
  bibleRefs: '',
  whatBibleTeaches: '',
  whatILearned: '',
  howToApply: '',
  prayerPoints: '',
  memoryVerse: '',
  mood: 'peaceful',
};

// Convert biblePassages array to bibleRefs string for backward compat
function passagesToRefs(passages) {
  return passages
    .filter(p => p.book && p.chapter && p.verseStart)
    .map(p => `${p.book} ${p.chapter}:${p.verseStart}${p.verseEnd && p.verseEnd !== p.verseStart ? '-' + p.verseEnd : ''}`)
    .join('; ');
}

// Convert bibleRefs string back to biblePassages array for backward compat
function refsToPassages(refs) {
  return refs.split('; ').filter(Boolean).map(ref => {
    const m = ref.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (!m) return null;
    return { book: m[1], chapter: m[2], verseStart: m[3], verseEnd: m[4] || m[3] };
  }).filter(Boolean);
}

/** "Sáng 1-7" → { name: 'Sáng Thế Ký', chapFrom: 1, chapTo: 7 } for BibleVerseSelector suggestedBooks */
function passageToSuggestedBook(passage) {
  const parsed = parsePassage(passage);
  if (!parsed) return null;
  const bookEntry = BIBLE_BOOKS.find(b => b.id === parsed.bookId);
  if (!bookEntry) return null;
  const chapTo = parsed.chTo === 999 ? bookEntry.chapters.length : parsed.chTo;
  return { name: bookEntry.name, chapFrom: parsed.chFrom, chapTo };
}

// Bible JSON cache — 5 MB, load once per session
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

// Shared hook: persist per-day completion in DB
function useBibleCompleted() {
  const [completed, setCompleted] = useState({});
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
  async function toggle(dateStr) {
    const wasCompleted = !!completed[dateStr];
    setCompleted(prev => {
      const next = { ...prev };
      if (next[dateStr]) delete next[dateStr]; else next[dateStr] = true;
      return next;
    });
    try {
      await apiClient.post('/api/bible-reading-log', { date: dateStr, completed: !wasCompleted });
    } catch {
      setCompleted(prev => {
        const next = { ...prev };
        if (next[dateStr]) delete next[dateStr]; else next[dateStr] = true;
        return next;
      });
    }
  }
  return { completed, toggle };
}

// ── Bible text renderer (shared by inline + spotlight) ─────────────────────
function BibleTextContent({ chapters, paragraphMode, highlights, activeColor, onHighlight, fontFamily, fontSize }) {
  return (
    <Box>
      {chapters.map(({ num, verses }) => (
        <Box key={num} sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 1, fontFamily, fontSize: fontSize * 0.85 }}>
            Chương {num}
          </Typography>
          {paragraphMode ? (
            <Typography sx={{ lineHeight: 2.1, fontFamily, fontSize }}>
              {verses.map((verse, idx) => {
                const key = `${num}_${idx}`;
                const bg = highlights[key];
                return (
                  <span
                    key={idx}
                    onClick={() => onHighlight(key)}
                    style={{
                      backgroundColor: bg || 'transparent',
                      borderRadius: 3,
                      padding: bg ? '1px 3px' : 0,
                      cursor: 'pointer',
                    }}
                  >
                    <sup style={{ fontWeight: 700, color: '#1976d2', fontSize: fontSize * 0.55, marginRight: 2 }}>{idx + 1}</sup>
                    {verse}{' '}
                  </span>
                );
              })}
            </Typography>
          ) : (
            verses.map((verse, idx) => {
              const key = `${num}_${idx}`;
              const bg = highlights[key];
              return (
                <Box
                  key={idx}
                  onClick={() => onHighlight(key)}
                  sx={{
                    display: 'flex', gap: 1.5, mb: 0.3, px: 0.5, py: 0.2, borderRadius: 1,
                    bgcolor: bg || 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                    '&:hover': { bgcolor: bg || 'action.hover' },
                  }}
                >
                  <Typography sx={{ minWidth: 22, fontWeight: 700, color: 'primary.main', mt: 0.3, lineHeight: 1.9, fontFamily, fontSize: fontSize * 0.75 }}>
                    {idx + 1}
                  </Typography>
                  <Typography sx={{ lineHeight: 1.9, flex: 1, fontFamily, fontSize }}>
                    {verse}
                  </Typography>
                </Box>
              );
            })
          )}
        </Box>
      ))}
    </Box>
  );
}

// ── Reading toolbar (view mode + font + font-size + highlight palette + spotlight) ──────
function BibleToolbar({ paragraphMode, onToggleMode, fontFamily, onFontChange, fontSize, onFontSizeChange, activeColor, onColorChange, onToggleSpotlight, spotlightOpen }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1.5 }}>
      {/* View mode */}
      <Chip
        label={paragraphMode ? 'Đoạn văn' : 'Từng câu'}
        size="small"
        variant="outlined"
        color="primary"
        onClick={onToggleMode}
        sx={{ cursor: 'pointer', fontSize: '0.7rem' }}
      />

      <Divider orientation="vertical" flexItem />

      {/* Font selector */}
      {FONTS.map(f => (
        <Chip
          key={f.value}
          label={f.label}
          size="small"
          variant={fontFamily === f.value ? 'filled' : 'outlined'}
          color={fontFamily === f.value ? 'primary' : 'default'}
          onClick={() => onFontChange(f.value)}
          sx={{ cursor: 'pointer', fontSize: '0.7rem', fontFamily: f.value !== 'inherit' ? f.value : undefined }}
        />
      ))}

      <Divider orientation="vertical" flexItem />

      {/* Font size */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Giảm cỡ chữ" arrow>
          <IconButton size="small" onClick={() => onFontSizeChange(fontSize - 1)} disabled={fontSize <= 12}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>A−</Typography>
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{fontSize}px</Typography>
        <Tooltip title="Tăng cỡ chữ" arrow>
          <IconButton size="small" onClick={() => onFontSizeChange(fontSize + 1)} disabled={fontSize >= 28}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>A+</Typography>
          </IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Highlight palette */}
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {HIGHLIGHT_COLORS.map((c, i) => (
          <Tooltip key={i} title={c.label} arrow>
            <Box
              onClick={() => onColorChange(c.value)}
              sx={{
                width: 20, height: 20, borderRadius: '50%',
                bgcolor: c.value || 'transparent',
                border: c.value === activeColor
                  ? '2.5px solid #333'
                  : c.value === null ? '1.5px dashed #aaa' : '1.5px solid #bbb',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#666',
                flexShrink: 0,
              }}
            >
              {c.value === null && '×'}
            </Box>
          </Tooltip>
        ))}
      </Box>

      {/* Spotlight toggle */}
      <Tooltip title={spotlightOpen ? 'Thoát spotlight' : 'Spotlight — chỉ đọc'} arrow>
        <IconButton size="small" onClick={onToggleSpotlight} sx={{ ml: 'auto' }}>
          {spotlightOpen ? <IconArrowsMinimize size={16} /> : <IconArrowsMaximize size={16} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// ── Inline Bible Text Card ─────────────────────────────────────────────────
function InlineBibleText({ passage, dateStr, completed, toggle }) {
  const [expanded, setExpanded] = useState(false);
  const [spotlight, setSpotlight] = useState(false);
  const [bibleData, setBibleData] = useState(null);
  const [loadingBible, setLoadingBible] = useState(false);
  const [paragraphMode, setParagraphMode] = useState(false);
  const [fontFamily, setFontFamily] = useState('inherit');
  const [fontSize, setFontSize] = useState(16);
  const hlKey = `qlTD_hl_${passage}`;
  const [highlights, setHighlights] = useState({});
  const [activeColor, setActiveColor] = useState('#FFF176');

  // Đọc highlights từ localStorage sau khi mount (tránh SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(hlKey);
      setHighlights(raw ? JSON.parse(raw) : {});
    } catch { setHighlights({}); }
  }, [hlKey]);

  const parsed = parsePassage(passage);

  function ensureLoaded() {
    if (!bibleData) {
      setLoadingBible(true);
      loadBible().then(data => { setBibleData(data); setLoadingBible(false); });
    }
  }

  function handleExpand() {
    if (!expanded) ensureLoaded();
    setExpanded(e => !e);
  }

  function handleSpotlight() {
    ensureLoaded();
    setSpotlight(true);
  }

  function applyHighlight(key) {
    setHighlights(prev => {
      const next = { ...prev };
      if (activeColor === null || prev[key] === activeColor) {
        delete next[key];
      } else {
        next[key] = activeColor;
      }
      try { localStorage.setItem(hlKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  if (!parsed) return null;

  const isDone = !!completed[dateStr];

  const chapters = [];
  if (bibleData && bibleData[parsed.bookId]) {
    const totalCh = bibleData[parsed.bookId].length;
    const chTo = Math.min(parsed.chTo, totalCh);
    for (let ch = parsed.chFrom; ch <= chTo; ch++) {
      chapters.push({ num: ch, verses: bibleData[parsed.bookId][ch - 1] || [] });
    }
  }

  const toolbarProps = {
    paragraphMode, onToggleMode: () => setParagraphMode(m => !m),
    fontFamily, onFontChange: setFontFamily,
    fontSize, onFontSizeChange: v => setFontSize(Math.min(28, Math.max(12, v))),
    activeColor, onColorChange: setActiveColor,
  };

  const textContent = loadingBible
    ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
    : <BibleTextContent chapters={chapters} paragraphMode={paragraphMode} highlights={highlights} activeColor={activeColor} onHighlight={applyHighlight} fontFamily={fontFamily} fontSize={fontSize} />;

  return (
    <>
      {/* ── Spotlight full-screen dialog ── */}
      <Dialog fullScreen open={spotlight} onClose={() => setSpotlight(false)}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, sm: 5 }, overflowY: 'auto' }}>
          <Box sx={{ maxWidth: 740, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconBook size={20} />
              <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, fontFamily }}>{passage}</Typography>
              <Chip
                label={isDone ? '✓ Đã đọc' : 'Chưa đọc'}
                size="small"
                color={isDone ? 'success' : 'default'}
                onClick={() => toggle(dateStr)}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            <BibleToolbar {...toolbarProps} spotlightOpen onToggleSpotlight={() => setSpotlight(false)} />
            <Divider sx={{ mb: 2 }} />
            {textContent}
          </Box>
        </Box>
      </Dialog>

      {/* ── Inline card ── */}
      <Card sx={{ borderRadius: 2, mb: 2, border: isDone ? '1px solid' : 'none', borderColor: 'success.light' }}>
        <CardContent sx={{ pb: '12px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <IconBook size={18} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>{passage}</Typography>
            <Chip
              label={isDone ? '✓ Đã đọc' : 'Chưa đọc'}
              size="small"
              color={isDone ? 'success' : 'default'}
              onClick={() => toggle(dateStr)}
              sx={{ cursor: 'pointer' }}
            />
            <Tooltip title="Spotlight — chỉ đọc" arrow>
              <IconButton size="small" onClick={handleSpotlight}><IconArrowsMaximize size={16} /></IconButton>
            </Tooltip>
            <Button
              size="small"
              variant="outlined"
              endIcon={expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              onClick={handleExpand}
            >
              {expanded ? 'Thu gọn' : 'Đọc ngay'}
            </Button>
          </Box>
          <Collapse in={expanded}>
            <Divider sx={{ mt: 1.5, mb: 1 }} />
            <BibleToolbar {...toolbarProps} spotlightOpen={false} onToggleSpotlight={handleSpotlight} />
            <Box sx={{ maxHeight: 480, overflowY: 'auto', pr: 1 }}>
              {textContent}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </>
  );
}

// ── Bible Inline Reader ────────────────────────────────────────────────────
function BibleInlineReader({ refs }) {
  const [bible, setBible] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expanded || bible) return;
    setLoading(true);
    loadBible().then(b => { setBible(b); setLoading(false); }).catch(() => setLoading(false));
  }, [expanded, bible]);

  const passages = (refs || '').split('; ').map(r => {
    const m = r.trim().match(/^(.+?)\s+(\d+)(?:-(\d+))?$/);
    if (!m) return null;
    const bookEntry = BIBLE_BOOKS.find(b => b.name === m[1]);
    if (!bookEntry) return null;
    return { bookId: bookEntry.id, bookName: bookEntry.name, chFrom: parseInt(m[2]), chTo: m[3] ? parseInt(m[3]) : parseInt(m[2]) };
  }).filter(Boolean);

  if (passages.length === 0) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        variant="text"
        startIcon={<span>{expanded ? '▲' : '▼'}</span>}
        onClick={() => setExpanded(v => !v)}
        sx={{ color: 'primary.main', fontWeight: 600, fontSize: 13 }}
      >
        {expanded ? 'Ẩn nội dung' : `📖 Đọc nội dung (${passages.map(p => p.chTo - p.chFrom + 1).reduce((a, b) => a + b, 0)} đoạn)`}
      </Button>

      {expanded && (
        <Box sx={{ mt: 1, maxHeight: 420, overflowY: 'auto', borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 2, bgcolor: '#fafafa', fontSize: 14, lineHeight: 1.8 }}>
          {loading && <Typography color="text.secondary">Đang tải...</Typography>}
          {bible && passages.map((p, pi) => (
            <Box key={pi} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                {p.bookName}
              </Typography>
              {Array.from({ length: p.chTo - p.chFrom + 1 }, (_, i) => p.chFrom + i).map(ch => {
                const verses = bible[p.bookId]?.[ch - 1] ?? [];
                return (
                  <Box key={ch} sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      Chương {ch}
                    </Typography>
                    {verses.map((v, vi) => (
                      <Typography key={vi} variant="body2" sx={{ mb: 0.25 }}>
                        <Box component="span" sx={{ fontWeight: 700, color: 'primary.main', mr: 0.5, fontSize: 11 }}>{vi + 1}</Box>
                        {v}
                      </Typography>
                    ))}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ── Devotion Form Tab ──────────────────────────────────────────────────────
function DevotionFormTab({ getReading }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const { completed, toggle } = useBibleCompleted();

  const selectedDateStr = toDateStr(selectedDate);
  const todayReading = getReading(selectedDateStr);

  const weekSuggestedBooks = useMemo(() => {
    if (!todayReading) return [];
    return todayReading.allReadings
      .map(r => passageToSuggestedBook(r.passage))
      .filter(Boolean);
  }, [todayReading]);

  async function fetchDevotion() {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/devotion', { date: selectedDateStr });
      if (data) {
        const loadedPassages = Array.isArray(data.biblePassages) ? data.biblePassages : [];
        const loadedRefs = data.bibleRefs || data.passages || passagesToRefs(loadedPassages);
        setForm({
          biblePassages: loadedPassages,
          bibleRefs: loadedRefs,
          whatBibleTeaches: data.whatBibleTeaches || data.bibleTeaches || '',
          whatILearned: data.whatILearned || data.lessonLearned || '',
          howToApply: data.howToApply || data.application || '',
          prayerPoints: data.prayerPoints || '',
          memoryVerse: data.memoryVerse || data.memorizeVerse || '',
          mood: data.mood || 'peaceful',
        });
      } else {
        setForm(emptyForm);
      }
    } catch { setForm(emptyForm); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchDevotion(); }, [selectedDate]);

  function prevDay() { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }
  function nextDay() { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }

  function addPassage() {
    setForm(f => ({ ...f, biblePassages: [...f.biblePassages, { ...emptyPassage }] }));
  }

  function addFromPlan() {
    if (!todayReading) return;
    const parts = todayReading.passage.split(' ');
    const chapterPart = parts[parts.length - 1];
    const bookName = parts.slice(0, -1).join(' ');
    const [from, to] = chapterPart.split('-');
    // Build a ref string like "Giăng 3:1" (chapter-level, start at verse 1)
    const newRef = to
      ? `${bookName} ${from}:1`
      : `${bookName} ${from}:1`;
    setForm(f => {
      const existing = f.bibleRefs ? f.bibleRefs.split('; ').filter(Boolean) : [];
      if (existing.includes(newRef)) return f;
      const updated = [...existing, newRef].join('; ');
      return { ...f, bibleRefs: updated };
    });
  }

  function removePassage(idx) {
    setForm(f => ({ ...f, biblePassages: f.biblePassages.filter((_, i) => i !== idx) }));
  }

  function updatePassage(idx, field, value) {
    setForm(f => ({
      ...f,
      biblePassages: f.biblePassages.map((p, i) => i === idx ? { ...p, [field]: value } : p),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Convert bibleRefs back to biblePassages for backward compat with API/DB
      const derivedPassages = refsToPassages(form.bibleRefs || '');
      await apiClient.post('/api/devotion', {
        date: selectedDateStr,
        bibleTeaches: form.whatBibleTeaches,
        lessonLearned: form.whatILearned,
        application: form.howToApply,
        prayerPoints: form.prayerPoints,
        memorizeVerse: form.memoryVerse,
        mood: form.mood,
        biblePassages: derivedPassages,
      });
      setSnack('Đã lưu tĩnh nguyện!');
    } catch (err) { setSnack('Lỗi: ' + (err.message || 'Không thể lưu')); }
    finally { setSaving(false); }
  }

  const isToday = selectedDateStr === toDateStr(new Date());

  return (
    <Box>
      {/* Date navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={prevDay}><IconChevronLeft /></IconButton>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatViDate(selectedDate)}</Typography>
          {isToday && <Chip label="Hôm nay" size="small" color="primary" sx={{ mt: 0.5 }} />}
        </Box>
        <IconButton onClick={nextDay}><IconChevronRight /></IconButton>
        {!isToday && <Button variant="outlined" size="small" onClick={() => setSelectedDate(new Date())}>Hôm nay</Button>}
      </Box>

      {/* Inline Bible text with completion toggle */}
      {todayReading && (
        <InlineBibleText
          passage={todayReading.passage}
          dateStr={selectedDateStr}
          completed={completed}
          toggle={toggle}
        />
      )}

      {/* Link to reading plan */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Link href="/apps/bible?tab=1" passHref>
          <Button size="small" variant="text" startIcon={<IconBook size={14} />} sx={{ color: 'text.secondary' }}>
            Lịch đọc KT 1 năm →
          </Button>
        </Link>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Bible passages */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Đoạn Kinh Thánh</Typography>
                {todayReading && (
                  <Button size="small" variant="outlined" onClick={addFromPlan}>
                    + Thêm từ lịch
                  </Button>
                )}
              </Box>
              <BibleVerseSelector
                value={form.bibleRefs || ''}
                onChange={val => setForm(f => ({ ...f, bibleRefs: val }))}
                label="Đoạn Kinh Thánh"
                fullWidth
                suggestedBooks={weekSuggestedBooks.length > 0 ? weekSuggestedBooks : undefined}
              />
              <BibleInlineReader refs={form.bibleRefs} />
            </CardContent>
          </Card>

          {/* Reflection fields */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Suy ngẫm</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Kinh Thánh dạy gì?" multiline minRows={3} fullWidth value={form.whatBibleTeaches} onChange={e => setForm(f => ({ ...f, whatBibleTeaches: e.target.value }))} />
                <TextField label="Tôi học được gì?" multiline minRows={3} fullWidth value={form.whatILearned} onChange={e => setForm(f => ({ ...f, whatILearned: e.target.value }))} />
                <TextField label="Áp dụng thế nào?" multiline minRows={3} fullWidth value={form.howToApply} onChange={e => setForm(f => ({ ...f, howToApply: e.target.value }))} />
                <TextField label="Điểm cầu nguyện" multiline minRows={2} fullWidth value={form.prayerPoints} onChange={e => setForm(f => ({ ...f, prayerPoints: e.target.value }))} />
                <TextField label="Câu ghi nhớ" fullWidth value={form.memoryVerse} onChange={e => setForm(f => ({ ...f, memoryVerse: e.target.value }))} />
                <FormControl fullWidth>
                  <InputLabel>Tâm trạng</InputLabel>
                  <Select value={form.mood} label="Tâm trạng" onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}>
                    {MOODS.map(m => (
                      <MenuItem key={m.value} value={m.value}>
                        <Chip label={m.label} color={m.color} size="small" sx={{ mr: 1 }} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" size="large" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu tĩnh nguyện'}
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.startsWith('Lỗi') ? 'error' : 'success'} onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DevotionPage() {
  return (
    <PageContainer title="Tĩnh nguyện" description="Tĩnh nguyện hằng ngày">
      <DevotionFormTab getReading={getReadingForDate} />
    </PageContainer>
  );
}
