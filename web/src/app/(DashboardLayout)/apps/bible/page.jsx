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
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import Portal from '@mui/material/Portal';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { IconChevronLeft, IconChevronRight, IconBook, IconArrowsMaximize, IconArrowsMinimize, IconList, IconAlignLeft, IconCircleCheck, IconCircle, IconSettings } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';
import { BOOK_ID_TO_NAME, BOOK_NAME_TO_ID, parsePassage } from '@/app/lib/bibleUtils';
import { BIBLE_READING_PLAN, getReadingForDate, DAY_LABELS, DAYS } from '@/app/lib/bibleReadingPlan';
import { useAuth } from '@/app/context/AuthContext';

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

// ── Plan generation ───────────────────────────────────────────────────────────
const BOOK_ORDER_GEN = [
  'gn','ex','lv','nm','dt','js','jud','rt','1sm','2sm','1kgs','2kgs',
  '1ch','2ch','ezr','ne','et','job','ps','prv','ec','so',
  'is','jr','lm','ez','dn','ho','jl','am','ob','jn','mi','na','hk','zp','hg','zc','ml',
  'mt','mk','lk','jo','act','rm','1co','2co','gl','eph','ph','cl',
  '1ts','2ts','1tm','2tm','tt','phm','hb','jm','1pe','2pe','1jo','2jo','3jo','jd','re',
];
const CHAPTER_COUNTS = {
  gn:50,ex:40,lv:27,nm:36,dt:34,js:24,jud:21,rt:4,
  '1sm':31,'2sm':24,'1kgs':22,'2kgs':25,'1ch':29,'2ch':36,
  ezr:10,ne:13,et:10,job:42,ps:150,prv:31,ec:12,so:8,
  is:66,jr:52,lm:5,ez:48,dn:12,ho:14,jl:3,am:9,ob:1,
  jn:4,mi:7,na:3,hk:3,zp:3,hg:2,zc:14,ml:4,
  mt:28,mk:16,lk:24,jo:21,act:28,rm:16,'1co':16,'2co':13,
  gl:6,eph:6,ph:4,cl:4,'1ts':5,'2ts':3,'1tm':6,'2tm':4,
  tt:3,phm:1,hb:13,jm:5,'1pe':5,'2pe':3,'1jo':5,'2jo':1,'3jo':1,jd:1,re:22,
};
const DURATION_OPTIONS = [
  { value: '3m',  label: '3 tháng',  days: 90  },
  { value: '6m',  label: '6 tháng',  days: 182 },
  { value: '9m',  label: '9 tháng',  days: 273 },
  { value: '1y',  label: '1 năm',    days: 365 },
  { value: '2y',  label: '2 năm',    days: 730 },
];

function formatChaptersAsPassage(chapters) {
  if (!chapters.length) return '';
  const groups = []; let g = [chapters[0]];
  for (let i = 1; i < chapters.length; i++) {
    const p = chapters[i - 1], c = chapters[i];
    if (c.bookId === p.bookId && c.ch === p.ch + 1) { g.push(c); }
    else { groups.push(g); g = [c]; }
  }
  groups.push(g);
  return groups.map(gr => {
    const name = BOOK_ID_TO_NAME[gr[0].bookId] || gr[0].bookId;
    return gr.length === 1 ? `${name} ${gr[0].ch}` : `${name} ${gr[0].ch}-${gr[gr.length-1].ch}`;
  }).join(' + ');
}

function generateSequentialPlan(startDateStr, durationKey) {
  const dur = DURATION_OPTIONS.find(d => d.value === durationKey);
  if (!dur) return [];
  const totalDays = dur.days;
  const allCh = [];
  for (const b of BOOK_ORDER_GEN) for (let c = 1; c <= CHAPTER_COUNTS[b]; c++) allCh.push({ bookId: b, ch: c });
  const daily = [];
  let acc = 0, idx = 0;
  for (let d = 0; d < totalDays; d++) {
    acc += allCh.length;
    const n = Math.floor(acc / totalDays); acc %= totalDays;
    daily.push(n > 0 ? formatChaptersAsPassage(allCh.slice(idx, idx + n)) : '');
    idx += n;
  }
  const d0 = new Date(startDateStr + 'T12:00:00');
  d0.setDate(d0.getDate() - d0.getDay());
  const weeks = [];
  for (let w = 0; w * 7 < totalDays; w++) {
    const ws = new Date(d0); ws.setDate(d0.getDate() + w * 7);
    const wo = { week: w + 1, startDate: toLocalDateStr(ws) };
    for (let d = 0; d < 7; d++) wo[DAY_KEYS[d]] = daily[w * 7 + d] || '';
    weeks.push(wo);
  }
  return weeks;
}

function getReadingFromPlan(plan, dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const dayKey = DAY_KEYS[date.getDay()];
  const week = plan.find(w => {
    const s = new Date(w.startDate + 'T00:00:00');
    const e = new Date(s); e.setDate(s.getDate() + 7);
    return date >= s && date < e;
  });
  if (!week || !week[dayKey]) return null;
  return {
    week: week.week, startDate: week.startDate, dayKey,
    dayLabel: DAY_LABELS[dayKey],
    passage: week[dayKey],
    allReadings: DAY_KEYS.map(d => ({ key: d, label: DAY_LABELS[d], passage: week[d] || '' })),
  };
}

function usePlanConfig(userId) {
  const storageKey = userId ? `qlTD_plan_config_${userId}` : null;
  const def = { type: 'option1', duration: '1y', startDate: '', startWeekOverride: null, generatedPlan: null };
  const [config, setConfig] = useState(def);
  useEffect(() => {
    if (!storageKey) return;
    try {
      const r = localStorage.getItem(storageKey);
      if (r) setConfig(c => ({ ...c, ...JSON.parse(r) }));
    } catch {}
  }, [storageKey]);
  function saveConfig(c) {
    setConfig(c);
    if (storageKey) { try { localStorage.setItem(storageKey, JSON.stringify(c)); } catch {} }
  }
  return { config, saveConfig };
}

// ── Plan Setup Dialog ─────────────────────────────────────────────────────────
function PlanSetupDialog({ open, onClose, config, onSave }) {
  const [type, setType] = useState(config.type || 'option1');
  const [duration, setDuration] = useState(config.duration || '1y');
  const [startDate, setStartDate] = useState(config.startDate || toLocalDateStr(new Date()));
  const [startWeek, setStartWeek] = useState(config.startWeekOverride ?? '');

  const totalWeeks = type === 'option2'
    ? Math.ceil((DURATION_OPTIONS.find(d => d.value === duration)?.days || 365) / 7)
    : BIBLE_READING_PLAN.length;

  function handleSave() {
    let newConfig = { type, duration, startDate, startWeekOverride: startWeek !== '' ? parseInt(startWeek) : null, generatedPlan: null };
    if (type === 'option2') newConfig.generatedPlan = generateSequentialPlan(startDate, duration);
    onSave(newConfig);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>⚙️ Cài đặt lịch đọc Kinh Thánh</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Chọn lịch đọc</Typography>
        <RadioGroup value={type} onChange={e => setType(e.target.value)}>
          <FormControlLabel value="option1" control={<Radio />} label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Lịch cố định 1 năm (52 tuần)</Typography>
              <Typography variant="caption" color="textSecondary">Đọc theo chủ đề: Thư tín, Luật pháp, Lịch sử, Thi vịnh, Tiên tri, Phúc âm</Typography>
            </Box>
          } />
          <FormControlLabel value="option2" control={<Radio />} label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Đọc từ Sáng-thế-ký đến Khải-huyền</Typography>
              <Typography variant="caption" color="textSecondary">Đọc tuần tự 1189 chương theo thời gian tự chọn</Typography>
            </Box>
          } />
        </RadioGroup>
        {type === 'option2' && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Thời gian hoàn thành</InputLabel>
              <Select value={duration} label="Thời gian hoàn thành" onChange={e => setDuration(e.target.value)}>
                {DURATION_OPTIONS.map(d => (
                  <MenuItem key={d.value} value={d.value}>
                    {d.label} — {Math.round(1189 / d.days * 10) / 10} chương/ngày (~{Math.ceil(d.days / 7)} tuần)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Ngày bắt đầu" type="date" size="small" value={startDate}
              onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }}
              helperText="Lịch sẽ được tạo từ ngày này" />
          </Box>
        )}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Bắt đầu từ tuần</Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
            Nếu bạn đã đọc xong một số tuần, đặt ở đây để hệ thống mặc định mở đúng tuần bạn đang đọc.
          </Typography>
          <TextField size="small" type="number" label={`Tuần bắt đầu (1 – ${totalWeeks})`}
            value={startWeek} onChange={e => setStartWeek(e.target.value)}
            inputProps={{ min: 1, max: totalWeeks }} sx={{ width: 200 }}
            helperText="Để trống = tự tính theo ngày hôm nay" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSave}>Lưu & Áp dụng</Button>
      </DialogActions>
    </Dialog>
  );
}

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
function ReaderTab({ initBook, initFrom, initTo, onNavigate, completed, toggling, onToggleCompleted, activePlan }) {
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
  const hlKey = `qlTD_hl_${selectedBook}_${chapterFrom}`;

  useEffect(() => {
    loadBible().then(data => { setBible(data); setLoading(false); });
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
    for (const week of (activePlan || BIBLE_READING_PLAN)) {
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
      <Portal>
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
            <>
              <BibleTextContent chapters={displayChapters} chapterOffset={chapterFrom} paragraphMode={paragraphMode} highlights={highlights} activeColor={activeColor} onHighlight={applyHighlight} fontFamily={fontFamily} fontSize={fontSize} highlightedRange={highlightedRange} />
              {planDateForCurrent && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant={isCurrentDone ? 'contained' : 'outlined'}
                    color={isCurrentDone ? 'success' : 'primary'}
                    size="large"
                    startIcon={isCurrentDone ? <IconCircleCheck size={20} /> : <IconCircle size={20} />}
                    disabled={toggling}
                    onClick={() => onToggleCompleted(planDateForCurrent)}
                    sx={{ minWidth: 200, borderRadius: 3 }}
                  >
                    {toggling ? '...' : isCurrentDone ? 'Đã đọc xong ✓' : 'Đánh dấu đã đọc'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
      </Portal>
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
                    onClick={() => onToggleCompleted(planDateForCurrent)}
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
function ReadingPlanTab({ activePlan, planConfig, savePlanConfig, onReadBook, completed, onToggleCompleted, onCatchUp, catchingUp }) {
  const [weekIdx, setWeekIdx] = useState(getCurrentWeekIdx);
  const [setupOpen, setSetupOpen] = useState(false);

  const todayStr = toLocalDateStr(new Date());

  function getDateForDay(weekStartDate, dayIdx) {
    const d = new Date(weekStartDate + 'T00:00:00');
    d.setDate(d.getDate() + dayIdx);
    return toLocalDateStr(d);
  }

  const totalWeeks = activePlan.length;
  const week = activePlan[weekIdx] || activePlan[Math.min(weekIdx, activePlan.length - 1)];
  if (!week) return null;

  const weekDates = DAY_KEYS.map((_, idx) => getDateForDay(week.startDate, idx));
  const weekDoneCount = weekDates.filter(d => completed[d]).length;
  const totalDone = Object.keys(completed).length;
  const totalDays = planConfig?.type === 'option2'
    ? (DURATION_OPTIONS.find(d => d.value === planConfig.duration)?.days ?? 365)
    : 365;

  const catchUpCount = activePlan.reduce((count, w) => {
    return count + DAY_KEYS.filter((key, i) => {
      const d = new Date(w.startDate + 'T00:00:00');
      d.setDate(d.getDate() + i);
      const dateStr = toLocalDateStr(d);
      return dateStr < todayStr && !completed[dateStr] && w[key];
    }).length;
  }, 0);

  return (
    <Box>
      {/* Header: plan type label + settings */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>
          {planConfig?.type === 'option2'
            ? `Đọc từ đầu đến cuối — ${DURATION_OPTIONS.find(d => d.value === planConfig.duration)?.label ?? ''}`
            : 'Lịch cố định 52 tuần'}
        </Typography>
        <Tooltip title="Cài đặt lịch đọc" arrow>
          <IconButton size="small" onClick={() => setSetupOpen(true)}><IconSettings size={18} /></IconButton>
        </Tooltip>
      </Box>

      {/* Progress bar */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Tiến độ đọc KT</Typography>
          <Typography variant="body2" color="textSecondary">{totalDone}/{totalDays} ngày đã đọc</Typography>
        </Box>
        <LinearProgress variant="determinate" value={Math.min(100, totalDone / totalDays * 100)} sx={{ borderRadius: 1, height: 8 }} />
      </Box>

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
        <IconButton onClick={() => setWeekIdx(i => Math.min(totalWeeks - 1, i + 1))} disabled={weekIdx === totalWeeks - 1}><IconChevronRight /></IconButton>
      </Box>

      {/* Week progress + catch up */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" onClick={() => setWeekIdx(getCurrentWeekIdx())}>Tuần hiện tại</Button>
        <Chip
          label={`${weekDoneCount}/7 ngày đã đọc`}
          size="small"
          color={weekDoneCount === 7 ? 'success' : weekDoneCount > 0 ? 'warning' : 'default'}
          icon={weekDoneCount === 7 ? <IconCircleCheck size={14} /> : undefined}
        />
        {catchUpCount > 0 && (
          <Button size="small" variant="contained" color="warning" disabled={catchingUp} onClick={onCatchUp} startIcon={<IconCircleCheck size={14} />}>
            {catchingUp ? 'Đang cập nhật...' : `Catch up (${catchUpCount} ngày)`}
          </Button>
        )}
      </Box>

      {/* 7 day cards */}
      <Grid container spacing={1.5}>
        {DAY_KEYS.map((key, idx) => {
          const passage = week[key];
          const dateStr = weekDates[idx];
          const isToday = dateStr === todayStr;
          const isDone = !!completed[dateStr];
          const parsed = passage ? parsePassage(passage) : null;

          return (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{
                borderRadius: 2,
                border: isToday ? '2px solid' : '1px solid',
                borderColor: isDone ? 'success.main' : isToday ? 'primary.main' : 'divider',
                bgcolor: isDone ? 'success.50' : isToday ? 'primary.50' : 'background.paper',
                opacity: isDone && !isToday ? 0.85 : 1,
                transition: 'all 0.2s',
              }}>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: isDone ? 'success.main' : isToday ? 'primary.main' : 'text.secondary' }}>
                      {DAY_LABELS[key]}
                      {isToday && !isDone && <Chip label="Hôm nay" size="small" color="primary" sx={{ ml: 0.5, height: 16, fontSize: 10 }} />}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(dateStr + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </Typography>
                      <Checkbox checked={isDone} onChange={() => onToggleCompleted(dateStr)} color="success" size="small" sx={{ p: 0 }} />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'text.secondary' : 'text.primary' }}>
                    {passage || '-'}
                  </Typography>
                  {parsed && (
                    <Button size="small" variant="outlined" fullWidth startIcon={<IconBook size={14} />} onClick={() => onReadBook(parsed.bookId, parsed.chFrom, parsed.chTo)}>
                      {isDone ? 'Đọc lại' : 'Đọc ngay'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Overview chips */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Tổng quan ({totalWeeks} tuần)</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {activePlan.map((w, wIdx) => {
            const wDates = DAY_KEYS.map((_, i) => { const d = new Date(w.startDate + 'T00:00:00'); d.setDate(d.getDate() + i); return toLocalDateStr(d); });
            const wDone = wDates.filter(d => completed[d]).length;
            const isCurrent = wIdx === getCurrentWeekIdx();
            return (
              <Chip
                key={w.week}
                label={wDone === 7 ? `T${w.week} ✓` : wDone > 0 ? `T${w.week} ${wDone}/7` : `T${w.week}`}
                size="small"
                color={isCurrent ? 'primary' : wDone === 7 ? 'success' : wDone > 0 ? 'warning' : 'default'}
                variant={isCurrent || wDone > 0 ? 'filled' : 'outlined'}
                onClick={() => setWeekIdx(wIdx)}
                sx={{ cursor: 'pointer', fontSize: '0.7rem', minWidth: 36 }}
              />
            );
          })}
        </Box>
      </Box>

      <PlanSetupDialog
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        config={planConfig || { type: 'option1', duration: '1y', startDate: '', startWeekOverride: null }}
        onSave={c => { savePlanConfig(c); setWeekIdx(c.startWeekOverride ? c.startWeekOverride - 1 : getCurrentWeekIdx()); }}
      />
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
  const initTab = parseInt(searchParams.get('tab') || '0', 10);

  const { user } = useAuth();
  const { config: planConfig, saveConfig: savePlanConfig } = usePlanConfig(user?.userId);
  const activePlan = planConfig.type === 'option2' && planConfig.generatedPlan?.length
    ? planConfig.generatedPlan
    : BIBLE_READING_PLAN;

  const [tab, setTab] = useState(initTab);
  const [readerBook, setReaderBook] = useState(initBook);
  const [readerFrom, setReaderFrom] = useState(initFrom);
  const [readerTo, setReaderTo] = useState(initTo);

  // ── Shared completed state (DB via /api/bible-reading-log) ───────────────
  const [completed, setCompleted] = useState({});
  const [toggling, setToggling] = useState(false);

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

  async function toggleCompleted(dateStr) {
    const wasCompleted = !!completed[dateStr];
    setToggling(true);
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
    } finally {
      setToggling(false);
    }
  }
  // ── Catch Up: mark all past days as done ──────────────────────────────────
  const [catchingUp, setCatchingUp] = useState(false);

  async function catchUp() {
    const todayStr = toLocalDateStr(new Date());
    const missing = [];
    for (const week of activePlan) {
      for (let i = 0; i < DAY_KEYS.length; i++) {
        const d = new Date(week.startDate + 'T00:00:00');
        d.setDate(d.getDate() + i);
        const dateStr = toLocalDateStr(d);
        if (dateStr < todayStr && !completed[dateStr] && week[DAY_KEYS[i]]) {
          missing.push(dateStr);
        }
      }
    }
    if (missing.length === 0) return;
    setCatchingUp(true);
    // Optimistic bulk update
    setCompleted(prev => {
      const next = { ...prev };
      missing.forEach(d => { next[d] = true; });
      return next;
    });
    try {
      await Promise.all(missing.map(d =>
        apiClient.post('/api/bible-reading-log', { date: d, completed: true })
      ));
    } catch {
      // Revert by reloading from DB
      apiClient.get('/api/bible-reading-log').then(data => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(d => { map[d] = true; });
          setCompleted(map);
        }
      }).catch(() => {});
    } finally {
      setCatchingUp(false);
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

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
          completed={completed}
          toggling={toggling}
          onToggleCompleted={toggleCompleted}
          activePlan={activePlan}
        />
      )}
      {tab === 1 && <ReadingPlanTab activePlan={activePlan} planConfig={planConfig} savePlanConfig={savePlanConfig} onReadBook={goReadBook} completed={completed} onToggleCompleted={toggleCompleted} onCatchUp={catchUp} catchingUp={catchingUp} />}
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
