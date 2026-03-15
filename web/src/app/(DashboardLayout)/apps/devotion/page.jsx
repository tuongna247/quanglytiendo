'use client';
import { useState, useEffect } from 'react';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import { IconChevronLeft, IconChevronRight, IconPlus, IconTrash, IconBook, IconExternalLink, IconChevronDown, IconChevronUp, IconArrowsMaximize, IconArrowsMinimize, IconSettings } from '@tabler/icons-react';
import Link from 'next/link';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';
import { BIBLE_READING_PLAN, DAY_LABELS, DAYS } from '@/app/lib/bibleReadingPlan';
import { bibleUrl, parsePassage, BOOK_ID_TO_NAME } from '@/app/lib/bibleUtils';

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

// ── Plan generation data ───────────────────────────────────────────────────
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
  // Build full chapter list (1189 total)
  const allCh = [];
  for (const b of BOOK_ORDER_GEN) for (let c = 1; c <= CHAPTER_COUNTS[b]; c++) allCh.push({ bookId: b, ch: c });
  // Distribute evenly (Bresenham)
  const daily = [];
  let acc = 0, idx = 0;
  for (let d = 0; d < totalDays; d++) {
    acc += allCh.length;
    const n = Math.floor(acc / totalDays); acc %= totalDays;
    daily.push(n > 0 ? formatChaptersAsPassage(allCh.slice(idx, idx + n)) : '');
    idx += n;
  }
  // Align startDate to Sunday
  const d0 = new Date(startDateStr + 'T12:00:00');
  d0.setDate(d0.getDate() - d0.getDay());
  const DKEYS = ['sun','mon','tue','wed','thu','fri','sat'];
  const weeks = [];
  for (let w = 0; w * 7 < totalDays; w++) {
    const ws = new Date(d0); ws.setDate(d0.getDate() + w * 7);
    const wo = { week: w + 1, startDate: toDateStr(ws) };
    for (let d = 0; d < 7; d++) wo[DKEYS[d]] = daily[w * 7 + d] || '';
    weeks.push(wo);
  }
  return weeks;
}

function getReadingFromPlan(plan, dateStr) {
  const DKEYS = ['sun','mon','tue','wed','thu','fri','sat'];
  const date = new Date(dateStr + 'T12:00:00');
  const dayKey = DKEYS[date.getDay()];
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
    allReadings: DKEYS.map(d => ({ key: d, label: DAY_LABELS[d], passage: week[d] || '' })),
  };
}

function usePlanConfig() {
  const [config, setConfig] = useState(() => {
    const def = { type: 'option1', duration: '1y', startDate: '', startWeekOverride: null, generatedPlan: null };
    try { const r = localStorage.getItem('qlTD_plan_config'); return r ? { ...def, ...JSON.parse(r) } : def; }
    catch { return def; }
  });
  function saveConfig(c) {
    setConfig(c);
    try { localStorage.setItem('qlTD_plan_config', JSON.stringify(c)); } catch {}
  }
  return { config, saveConfig };
}

// Fixed: use local date fields (not UTC toISOString) to avoid timezone offset in Vietnam (UTC+7)
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatViDate(d) { return `${VI_WEEKDAYS[d.getDay()]}, ${d.getDate()} ${VI_MONTHS[d.getMonth()]} ${d.getFullYear()}`; }

const emptyPassage = { book: '', chapter: '', verseStart: '', verseEnd: '' };
const emptyForm = {
  biblePassages: [],
  whatBibleTeaches: '',
  whatILearned: '',
  howToApply: '',
  prayerPoints: '',
  memoryVerse: '',
  mood: 'peaceful',
};

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

// Shared hook: persist per-day completion in localStorage
function useBibleCompleted() {
  const [completed, setCompleted] = useState({});
  useEffect(() => {
    const raw = localStorage.getItem('qlTD_bible_done');
    if (raw) { try { setCompleted(JSON.parse(raw)); } catch {} }
  }, []);
  function toggle(dateStr) {
    setCompleted(prev => {
      const next = { ...prev };
      if (next[dateStr]) delete next[dateStr]; else next[dateStr] = true;
      localStorage.setItem('qlTD_bible_done', JSON.stringify(next));
      return next;
    });
  }
  return { completed, toggle };
}

// ── Plan Setup Dialog ──────────────────────────────────────────────────────
function PlanSetupDialog({ open, onClose, config, onSave }) {
  const [type, setType] = useState(config.type || 'option1');
  const [duration, setDuration] = useState(config.duration || '1y');
  const [startDate, setStartDate] = useState(config.startDate || toDateStr(new Date()));
  const [startWeek, setStartWeek] = useState(config.startWeekOverride ?? '');
  const [generating, setGenerating] = useState(false);

  const totalWeeks = type === 'option2'
    ? Math.ceil((DURATION_OPTIONS.find(d => d.value === duration)?.days || 365) / 7)
    : BIBLE_READING_PLAN.length;

  function handleSave() {
    setGenerating(true);
    let newConfig = { type, duration, startDate, startWeekOverride: startWeek !== '' ? parseInt(startWeek) : null, generatedPlan: null };
    if (type === 'option2') {
      newConfig.generatedPlan = generateSequentialPlan(startDate, duration);
    }
    onSave(newConfig);
    setGenerating(false);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>⚙️ Cài đặt lịch đọc Kinh Thánh</DialogTitle>
      <DialogContent dividers>
        {/* Plan type */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Chọn lịch đọc</Typography>
        <RadioGroup value={type} onChange={e => setType(e.target.value)}>
          <FormControlLabel
            value="option1"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Lịch cố định 1 năm (52 tuần)</Typography>
                <Typography variant="caption" color="textSecondary">Đọc theo chủ đề: Thư tín, Luật pháp, Lịch sử, Thi vịnh, Thế văn, Tiên tri, Phúc âm</Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="option2"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Đọc từ Sáng-thế-ký đến Khải-huyền</Typography>
                <Typography variant="caption" color="textSecondary">Đọc tuần tự 1189 chương theo thời gian tự chọn</Typography>
              </Box>
            }
          />
        </RadioGroup>

        {/* Option 2 settings */}
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
            <TextField
              label="Ngày bắt đầu"
              type="date"
              size="small"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Lịch sẽ được tạo từ ngày này"
            />
          </Box>
        )}

        {/* Start week override */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Bắt đầu từ tuần
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
            Nếu bạn đã đọc xong một số tuần, đặt ở đây để hệ thống mặc định mở đúng tuần bạn đang đọc.
          </Typography>
          <TextField
            size="small"
            type="number"
            label={`Tuần bắt đầu (1 – ${totalWeeks})`}
            value={startWeek}
            onChange={e => setStartWeek(e.target.value)}
            inputProps={{ min: 1, max: totalWeeks }}
            sx={{ width: 200 }}
            helperText="Để trống = tự tính theo ngày hôm nay"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSave} disabled={generating}>
          {generating ? 'Đang tạo...' : 'Lưu & Áp dụng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Bible Reading Plan Tab ─────────────────────────────────────────────────
function BibleReadingPlanTab({ activePlan, planConfig, savePlanConfig, getReading }) {
  const today = new Date();
  const todayStr = toDateStr(today);
  const todayReading = getReading(todayStr);
  const currentWeek = planConfig.startWeekOverride ?? (todayReading?.week ?? 1);
  const [viewWeek, setViewWeek] = useState(currentWeek);
  const [setupOpen, setSetupOpen] = useState(false);
  const { completed, toggle } = useBibleCompleted();

  const totalWeeks = activePlan.length;
  const weekData = activePlan.find(w => w.week === viewWeek);
  const totalDays = planConfig.type === 'option2'
    ? (DURATION_OPTIONS.find(d => d.value === planConfig.duration)?.days ?? 365)
    : 365;
  const totalDone = Object.keys(completed).length;
  const isOption2 = planConfig.type === 'option2';

  return (
    <Box>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {isOption2
              ? `Đọc từ đầu đến cuối — ${DURATION_OPTIONS.find(d => d.value === planConfig.duration)?.label ?? ''}`
              : 'Lịch cố định 52 tuần'}
          </Typography>
        </Box>
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

      {/* Today's reading highlight */}
      {todayReading && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<IconBook size={20} />}
          action={
            <Button size="small" color="inherit" onClick={() => toggle(todayStr)}>
              {completed[todayStr] ? '✓ Đã đọc' : 'Đánh dấu đã đọc'}
            </Button>
          }
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Hôm nay ({todayReading.dayLabel})
          </Typography>
          <Typography variant="h6" sx={{
            fontWeight: 800,
            textDecoration: completed[todayStr] ? 'line-through' : 'none',
            color: completed[todayStr] ? 'success.main' : 'primary.main',
          }}>
            📖 {todayReading.passage}
          </Typography>
          <Typography variant="caption">Tuần {todayReading.week}</Typography>
        </Alert>
      )}

      {/* Week navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={() => setViewWeek(w => Math.max(1, w - 1))} disabled={viewWeek === 1}>
          <IconChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>
          Tuần {viewWeek} {weekData ? `— ${new Date(weekData.startDate + 'T12:00:00').toLocaleDateString('vi-VN')}` : ''}
        </Typography>
        <IconButton onClick={() => setViewWeek(w => Math.min(totalWeeks, w + 1))} disabled={viewWeek === totalWeeks}>
          <IconChevronRight />
        </IconButton>
        {viewWeek !== currentWeek && (
          <Button size="small" variant="outlined" onClick={() => setViewWeek(currentWeek)}>
            Tuần này
          </Button>
        )}
      </Box>

      {/* Week readings table */}
      {weekData && (
        <Card sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>Ngày</TableCell>
                {!isOption2 && <TableCell sx={{ fontWeight: 700, color: 'white' }}>Loại</TableCell>}
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>Đoạn đọc</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', width: 64, textAlign: 'center' }}>Đã đọc</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DAYS.map((dayKey, idx) => {
                const weekStart = new Date(weekData.startDate + 'T12:00:00');
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + idx);
                const dateStr = toDateStr(dayDate);
                const isToday = dateStr === todayStr;
                const isDone = !!completed[dateStr];
                const [dayName, category] = DAY_LABELS[dayKey].split(' — ');
                const passage = weekData[dayKey] || '';
                return (
                  <TableRow
                    key={dayKey}
                    sx={{
                      bgcolor: isDone ? 'success.50' : isToday ? 'primary.50' : 'inherit',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: isToday ? 700 : 400 }}>
                        {dayName}
                        {isToday && <Chip label="Hôm nay" size="small" color="primary" sx={{ ml: 1 }} />}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {dayDate.toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    {!isOption2 && (
                      <TableCell><Chip label={category} size="small" variant="outlined" /></TableCell>
                    )}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{
                          fontWeight: isToday ? 700 : 500,
                          color: isDone ? 'success.main' : isToday ? 'primary.main' : 'inherit',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                          {passage ? `📖 ${passage}` : '—'}
                        </Typography>
                        {passage && bibleUrl(passage) && (
                          <Link href={bibleUrl(passage)} passHref>
                            <IconButton size="small" title="Đọc đoạn này">
                              <IconExternalLink size={14} />
                            </IconButton>
                          </Link>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Checkbox checked={isDone} onChange={() => toggle(dateStr)} color="success" size="small" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Plan overview chips */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Tổng quan ({totalWeeks} tuần)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {activePlan.map(w => {
            const isCurrent = w.week === currentWeek;
            const weekDone = DAYS.filter((_, idx) => {
              const d = new Date(w.startDate + 'T12:00:00');
              d.setDate(d.getDate() + idx);
              return completed[toDateStr(d)];
            }).length;
            const allDone = weekDone === 7;
            return (
              <Chip
                key={w.week}
                label={allDone ? `T${w.week} ✓` : weekDone > 0 ? `T${w.week} ${weekDone}/7` : `T${w.week}`}
                size="small"
                color={isCurrent ? 'primary' : allDone ? 'success' : weekDone > 0 ? 'warning' : 'default'}
                variant={isCurrent || allDone || weekDone > 0 ? 'filled' : 'outlined'}
                onClick={() => setViewWeek(w.week)}
                sx={{ cursor: 'pointer', fontSize: '0.7rem', minWidth: 36 }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Plan setup dialog */}
      <PlanSetupDialog
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        config={planConfig}
        onSave={newConfig => { savePlanConfig(newConfig); setViewWeek(newConfig.startWeekOverride ?? 1); }}
      />
    </Box>
  );
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
  const [highlights, setHighlights] = useState(() => {
    try { const raw = localStorage.getItem(hlKey); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  });
  const [activeColor, setActiveColor] = useState('#FFF176');

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

  async function fetchDevotion() {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/devotion', { date: selectedDateStr });
      if (data) {
        setForm({
          biblePassages: Array.isArray(data.biblePassages) ? data.biblePassages : [],
          whatBibleTeaches: data.whatBibleTeaches || '',
          whatILearned: data.whatILearned || '',
          howToApply: data.howToApply || '',
          prayerPoints: data.prayerPoints || '',
          memoryVerse: data.memoryVerse || '',
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
    const chapters = parts[parts.length - 1];
    const book = parts.slice(0, -1).join(' ');
    const [from, to] = chapters.split('-');
    setForm(f => ({
      ...f,
      biblePassages: [...f.biblePassages, {
        book,
        chapter: from,
        verseStart: '1',
        verseEnd: to || from,
      }],
    }));
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
      await apiClient.post('/api/devotion', { ...form, date: selectedDateStr });
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Bible passages */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Đoạn Kinh Thánh</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {todayReading && (
                    <Button size="small" variant="outlined" onClick={addFromPlan}>
                      + Thêm từ lịch
                    </Button>
                  )}
                  <Button startIcon={<IconPlus size={16} />} onClick={addPassage} size="small" variant="outlined">
                    Thêm đoạn
                  </Button>
                </Box>
              </Box>
              {form.biblePassages.length === 0 ? (
                <Typography color="textSecondary" variant="body2">Chưa có đoạn Kinh Thánh nào</Typography>
              ) : form.biblePassages.map((p, idx) => (
                <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField label="Sách" value={p.book} onChange={e => updatePassage(idx, 'book', e.target.value)} fullWidth size="small" placeholder="Ví dụ: Giăng" />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <TextField label="Chương" value={p.chapter} onChange={e => updatePassage(idx, 'chapter', e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <TextField label="Câu đầu" value={p.verseStart} onChange={e => updatePassage(idx, 'verseStart', e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <TextField label="Câu cuối" value={p.verseEnd} onChange={e => updatePassage(idx, 'verseEnd', e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {p.book && <Chip label={`${p.book} ${p.chapter}${p.verseStart ? ':' + p.verseStart : ''}${p.verseEnd ? '-' + p.verseEnd : ''}`} size="small" variant="outlined" />}
                    <IconButton size="small" color="error" onClick={() => removePassage(idx)}><IconTrash size={14} /></IconButton>
                  </Grid>
                </Grid>
              ))}
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
  const [tab, setTab] = useState(0);
  const { config: planConfig, saveConfig: savePlanConfig } = usePlanConfig();

  const activePlan = planConfig.type === 'option2' && planConfig.generatedPlan?.length
    ? planConfig.generatedPlan
    : BIBLE_READING_PLAN;

  function getReading(dateStr) {
    return getReadingFromPlan(activePlan, dateStr);
  }

  return (
    <PageContainer title="Tĩnh nguyện" description="Tĩnh nguyện & Đọc Kinh Thánh 1 năm">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="✍️ Tĩnh nguyện" />
          <Tab label="📖 Lịch đọc KT 1 năm" />
        </Tabs>
      </Box>
      {tab === 0 && <DevotionFormTab getReading={getReading} />}
      {tab === 1 && (
        <BibleReadingPlanTab
          activePlan={activePlan}
          planConfig={planConfig}
          savePlanConfig={savePlanConfig}
          getReading={getReading}
        />
      )}
    </PageContainer>
  );
}
