'use client';
import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { IconChevronLeft, IconChevronRight, IconTrash, IconPlus } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';

const VI_MONTHS = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];
const VI_WEEKDAYS_FULL = ['Chúa nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
const VI_WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const COLOR_OPTIONS = [
  { label: 'Xanh dương', value: '#1976d2' },
  { label: 'Xanh lá', value: '#2e7d32' },
  { label: 'Đỏ', value: '#d32f2f' },
  { label: 'Cam', value: '#ed6c02' },
  { label: 'Tím', value: '#7b1fa2' },
  { label: 'Hồng', value: '#c2185b' },
];

const RECURRENCE_OPTIONS = [
  { label: 'Không lặp', value: 'none' },
  { label: 'Hàng ngày', value: 'daily' },
  { label: 'Hàng tuần', value: 'weekly' },
  { label: 'Hàng tháng', value: 'monthly' },
  { label: 'Hàng năm', value: 'yearly' },
];

const emptyForm = {
  title: '',
  description: '',
  startAt: '',
  endAt: '',
  allDay: false,
  color: '#1976d2',
  category: '',
  recurrence: 'none',
};

function toDatetimeLocal(dt) {
  if (!dt) return '';
  return new Date(dt).toISOString().slice(0, 16);
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Expand recurring events within [fromStr, toStr] date range
function expandRecurring(events, fromStr, toStr) {
  const rangeFrom = new Date(fromStr);
  const rangeTo = new Date(toStr);
  const result = [];

  for (const ev of events) {
    if (!ev.recurrence || ev.recurrence === 'none') {
      result.push(ev);
      continue;
    }

    const origin = new Date(ev.startAt);
    const duration = new Date(ev.endAt) - origin; // ms
    let cursor = new Date(origin);

    // Fast-forward cursor to within range
    let safetyLimit = 0;
    while (cursor < rangeFrom && safetyLimit++ < 5000) {
      cursor = nextOccurrence(cursor, ev.recurrence);
    }

    // Emit occurrences within range
    while (cursor <= rangeTo && safetyLimit++ < 5000) {
      const occStart = new Date(cursor);
      const occEnd = new Date(cursor.getTime() + duration);
      result.push({
        ...ev,
        id: ev.id + '_' + toDateStr(occStart),
        startAt: occStart.toISOString(),
        endAt: occEnd.toISOString(),
        _originalId: ev.id,
      });
      cursor = nextOccurrence(cursor, ev.recurrence);
    }
  }
  return result;
}

function nextOccurrence(date, recurrence) {
  const d = new Date(date);
  if (recurrence === 'daily') d.setDate(d.getDate() + 1);
  else if (recurrence === 'weekly') d.setDate(d.getDate() + 7);
  else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (recurrence === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setFullYear(d.getFullYear() + 100); // stop
  return d;
}

function formatTime(dtStr) {
  if (!dtStr) return '';
  const d = new Date(dtStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function EventChip({ ev, onClick }) {
  return (
    <Chip
      label={ev.allDay ? ev.title : `${formatTime(ev.startAt)} ${ev.title}`}
      size="small"
      sx={{
        bgcolor: ev.color || '#1976d2',
        color: 'white',
        fontSize: '0.65rem',
        height: 18,
        mb: 0.25,
        width: '100%',
        cursor: 'pointer',
        '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      }}
      onClick={onClick}
    />
  );
}

// ─── Month View ────────────────────────────────────────────────────────────────
function MonthView({ year, month, events, todayStr, onDayClick, onEventClick }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];
  for (let i = firstDay - 1; i >= 0; i--) days.push({ day: daysInPrevMonth - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, current: true });
  while (days.length < 42) days.push({ day: days.length - daysInMonth - firstDay + 1, current: false });

  function eventsForDay(day) {
    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(ev => (ev.startAt || '').split('T')[0] === ds);
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 1 }}>
        <Grid container>
          {VI_WEEKDAYS.map(d => (
            <Grid key={d} sx={{ width: `${100/7}%`, textAlign: 'center', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: d === 'CN' ? 'error.main' : 'text.secondary' }}>{d}</Typography>
            </Grid>
          ))}
        </Grid>
        {Array.from({ length: 6 }, (_, rowIdx) => (
          <Grid container key={rowIdx}>
            {days.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
              const dayStr = cell.current ? `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}` : null;
              const isToday = dayStr === todayStr;
              const dayEvents = cell.current ? eventsForDay(cell.day) : [];
              return (
                <Box
                  key={colIdx}
                  sx={{
                    width: `${100/7}%`, minHeight: 90,
                    border: '1px solid', borderColor: 'divider', p: 0.5,
                    cursor: cell.current ? 'pointer' : 'default',
                    bgcolor: cell.current ? 'background.paper' : 'action.hover',
                    '&:hover': cell.current ? { bgcolor: 'action.selected' } : {},
                  }}
                  onClick={() => cell.current && onDayClick(cell.day)}
                >
                  <Box sx={{
                    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: isToday ? 'primary.main' : 'transparent',
                    color: isToday ? 'white' : cell.current ? 'text.primary' : 'text.disabled',
                    fontWeight: isToday ? 700 : 400, fontSize: '0.8rem', mb: 0.5,
                  }}>
                    {cell.day}
                  </Box>
                  {dayEvents.slice(0, 3).map(ev => (
                    <EventChip key={ev.id} ev={ev} onClick={e => { e.stopPropagation(); onEventClick(ev, e); }} />
                  ))}
                  {dayEvents.length > 3 && <Typography variant="caption" color="textSecondary">+{dayEvents.length - 3}</Typography>}
                </Box>
              );
            })}
          </Grid>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Week View — 24h timeline ──────────────────────────────────────────────────
function WeekView({ weekStart, events, todayStr, onSlotClick, onEventClick }) {
  const scrollRef = useRef(null);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const todayColIdx = days.findIndex(d => toDateStr(d) === todayStr);

  useEffect(() => {
    if (!scrollRef.current) return;
    const scrollTo = todayColIdx >= 0
      ? Math.max(0, (currentMin - 60) * (HOUR_H / 60))
      : 7 * HOUR_H;
    scrollRef.current.scrollTop = scrollTo;
  }, [weekStart]);

  // All-day events per day
  function allDayFor(d) {
    const ds = toDateStr(d);
    return events.filter(ev => ev.allDay && (ev.startAt || '').split('T')[0] === ds);
  }

  // Timed events per day with position info
  function timedFor(d) {
    const ds = toDateStr(d);
    return events
      .filter(ev => !ev.allDay && (ev.startAt || '').split('T')[0] === ds)
      .map(ev => {
        const s = new Date(ev.startAt);
        const e = new Date(ev.endAt);
        const startMin = s.getHours() * 60 + s.getMinutes();
        const endMin = e.getHours() * 60 + e.getMinutes();
        return { ...ev, startMin, heightMin: Math.max(endMin - startMin, 30) };
      });
  }

  const TIME_COL = 44; // px width of time label column

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 0 }}>
        {/* Day header row */}
        <Box sx={{ display: 'flex', borderBottom: '2px solid', borderColor: 'divider' }}>
          <Box sx={{ width: TIME_COL, flexShrink: 0 }} />
          {days.map((d, idx) => {
            const ds = toDateStr(d);
            const isToday = ds === todayStr;
            const allDay = allDayFor(d);
            return (
              <Box key={idx} sx={{ flex: 1, borderLeft: '1px solid', borderColor: 'divider', textAlign: 'center', py: 0.75, px: 0.25 }}>
                <Typography variant="caption" sx={{ color: isToday ? 'primary.main' : 'text.secondary', fontWeight: 600, display: 'block' }}>
                  {VI_WEEKDAYS[idx]}
                </Typography>
                <Box sx={{
                  width: 28, height: 28, mx: 'auto', mb: allDay.length ? 0.5 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  bgcolor: isToday ? 'primary.main' : 'transparent',
                  color: isToday ? 'white' : 'text.primary',
                  fontWeight: isToday ? 700 : 500, fontSize: '0.8rem',
                }}>
                  {d.getDate()}
                </Box>
                {allDay.map(ev => (
                  <Chip key={ev.id} label={ev.title} size="small"
                    sx={{ bgcolor: ev.color || '#1976d2', color: 'white', fontSize: '0.6rem', height: 16, mb: 0.25, width: '95%', cursor: 'pointer' }}
                    onClick={e => { e.stopPropagation(); onEventClick(ev, e); }} />
                ))}
              </Box>
            );
          })}
        </Box>

        {/* Scrollable timeline */}
        <Box ref={scrollRef} sx={{ overflowY: 'auto', maxHeight: 560, position: 'relative' }}>
          {/* Hour rows */}
          {Array.from({ length: 24 }, (_, h) => (
            <Box key={h} sx={{ display: 'flex', height: HOUR_H, borderBottom: '1px solid', borderColor: 'divider' }}>
              {/* Time label */}
              <Box sx={{ width: TIME_COL, flexShrink: 0, pr: 1, pt: 0.5, textAlign: 'right' }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.68rem' }}>
                  {String(h).padStart(2, '0')}:00
                </Typography>
              </Box>
              {/* Day columns */}
              {days.map((d, idx) => (
                <Box
                  key={idx}
                  onClick={() => onSlotClick(d, h)}
                  sx={{
                    flex: 1, borderLeft: '1px solid', borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                />
              ))}
            </Box>
          ))}

          {/* Current time line — only on today's column */}
          {todayColIdx >= 0 && (
            <Box sx={{
              position: 'absolute',
              left: `calc(${TIME_COL}px + ${todayColIdx} * (100% - ${TIME_COL}px) / 7)`,
              width: `calc((100% - ${TIME_COL}px) / 7)`,
              top: currentMin * (HOUR_H / 60),
              height: 2, bgcolor: 'error.main', zIndex: 4, pointerEvents: 'none',
              '&::before': {
                content: '""', position: 'absolute',
                left: -4, top: -4, width: 8, height: 8,
                borderRadius: '50%', bgcolor: 'error.main',
              },
            }} />
          )}

          {/* Timed events — positioned absolutely per column */}
          {days.map((d, colIdx) => (
            timedFor(d).map(ev => {
              const colWidth = `calc((100% - ${TIME_COL}px) / 7)`;
              const colLeft = `calc(${TIME_COL}px + ${colIdx} * (100% - ${TIME_COL}px) / 7)`;
              return (
                <Box
                  key={ev.id}
                  onClick={e => { e.stopPropagation(); onEventClick(ev, e); }}
                  sx={{
                    position: 'absolute',
                    left: colLeft,
                    width: `calc(${colWidth} - 4px)`,
                    top: ev.startMin * (HOUR_H / 60),
                    height: Math.max(ev.heightMin * (HOUR_H / 60), 20),
                    bgcolor: ev.color || '#1976d2',
                    color: 'white',
                    borderRadius: 0.75,
                    px: 0.5, py: 0.25,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    zIndex: 3,
                    boxShadow: 1,
                    ml: '2px',
                    '&:hover': { filter: 'brightness(0.88)', zIndex: 5 },
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.3, fontSize: '0.68rem' }}>
                    {ev.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.6rem' }}>
                    {formatTime(ev.startAt)}
                  </Typography>
                </Box>
              );
            })
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Day View — Google Calendar style 24h timeline ────────────────────────────
const HOUR_H = 64; // px per hour

// Check if a Date object is the same local calendar day as another
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function DayView({ date, events, onHourClick, onAddClick, onEventClick }) {
  const scrollRef = useRef(null);
  const now = new Date();
  const isToday = isSameDay(now, date);
  const currentMinute = isToday ? now.getHours() * 60 + now.getMinutes() : null;

  // Auto-scroll to current time (or 7am) on mount / date change
  useEffect(() => {
    if (!scrollRef.current) return;
    const scrollTo = currentMinute !== null
      ? Math.max(0, (currentMinute - 60) * (HOUR_H / 60)) // 1h before now
      : 7 * HOUR_H; // default: 7am
    scrollRef.current.scrollTop = scrollTo;
  }, [date]);

  // Use local-time comparison to avoid UTC string issues
  function sameDay(ev) {
    if (!ev.startAt) return false;
    return isSameDay(new Date(ev.startAt), date);
  }

  const allDayEvents = events.filter(ev => ev.allDay && sameDay(ev));

  const timedEvents = events
    .filter(ev => !ev.allDay && sameDay(ev))
    .map(ev => {
      const s = new Date(ev.startAt);
      const e = new Date(ev.endAt);
      const startMin = s.getHours() * 60 + s.getMinutes();
      const endMin = e.getHours() * 60 + e.getMinutes();
      return { ...ev, startMin, heightMin: Math.max(endMin - startMin, 30) };
    })
    .sort((a, b) => a.startMin - b.startMin);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {VI_WEEKDAYS_FULL[date.getDay()]}, {date.getDate()} {VI_MONTHS[date.getMonth()]}
          </Typography>
          <Button size="small" variant="outlined" startIcon={<IconPlus size={14} />} onClick={onAddClick}>
            Thêm sự kiện
          </Button>
        </Box>

        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <Box sx={{ px: 2, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="textSecondary" sx={{ mr: 1, lineHeight: 2 }}>Cả ngày</Typography>
            {allDayEvents.map(ev => (
              <Chip key={ev.id} label={ev.title} size="small"
                sx={{ bgcolor: ev.color || '#1976d2', color: 'white', cursor: 'pointer' }}
                onClick={e => onEventClick(ev, e)} />
            ))}
          </Box>
        )}

        {/* Timeline */}
        <Box ref={scrollRef} sx={{ overflowY: 'auto', maxHeight: 560, position: 'relative' }}>
          {/* Hour rows */}
          {Array.from({ length: 24 }, (_, h) => (
            <Box
              key={h}
              onClick={() => onHourClick(h)}
              sx={{
                display: 'flex', height: HOUR_H, cursor: 'pointer',
                borderBottom: '1px solid', borderColor: 'divider',
                '&:hover .hour-bg': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ width: 52, flexShrink: 0, pt: 0.5, pr: 1, textAlign: 'right' }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                  {String(h).padStart(2, '0')}:00
                </Typography>
              </Box>
              <Box className="hour-bg" sx={{ flex: 1, borderLeft: '1px solid', borderColor: 'divider', transition: 'background 0.1s' }} />
            </Box>
          ))}

          {/* Current time line */}
          {currentMinute !== null && (
            <Box sx={{
              position: 'absolute', left: 52, right: 0,
              top: currentMinute * (HOUR_H / 60),
              height: 2, bgcolor: 'error.main', zIndex: 4, pointerEvents: 'none',
              '&::before': {
                content: '""', position: 'absolute',
                left: -5, top: -4, width: 10, height: 10,
                borderRadius: '50%', bgcolor: 'error.main',
              },
            }} />
          )}

          {/* Timed events */}
          {timedEvents.map((ev, idx) => (
            <Box
              key={ev.id}
              onClick={e => { e.stopPropagation(); onEventClick(ev, e); }}
              sx={{
                position: 'absolute',
                left: 60, right: 8,
                top: ev.startMin * (HOUR_H / 60),
                height: Math.max(ev.heightMin * (HOUR_H / 60), 22),
                bgcolor: ev.color || '#1976d2',
                color: 'white',
                borderRadius: 1,
                px: 1, py: 0.25,
                overflow: 'hidden',
                cursor: 'pointer',
                zIndex: 3,
                boxShadow: 1,
                '&:hover': { filter: 'brightness(0.88)', zIndex: 5 },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.4, fontSize: '0.75rem' }}>
                {ev.title}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.65rem' }}>
                {formatTime(ev.startAt)} – {formatTime(ev.endAt)}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const now = new Date();
  const todayStr = toDateStr(now);

  const [view, setView] = useState('month'); // 'day' | 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Compute fetch range based on view
  function getFetchRange() {
    // Append T23:59:59 to 'to' so API includes events on the last day (StartAt <= to)
    if (view === 'day') {
      return { from: `${toDateStr(currentDate)}T00:00:00`, to: `${toDateStr(currentDate)}T23:59:59` };
    } else if (view === 'week') {
      const sunday = new Date(currentDate);
      sunday.setDate(currentDate.getDate() - currentDate.getDay());
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      return { from: `${toDateStr(sunday)}T00:00:00`, to: `${toDateStr(saturday)}T23:59:59` };
    } else {
      const from = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01T00:00:00`;
      const to = `${toDateStr(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0))}T23:59:59`;
      return { from, to };
    }
  }

  async function fetchEvents() {
    const { from, to } = getFetchRange();
    try {
      const data = await apiClient.get('/api/calendar-events', { from, to });
      const raw = Array.isArray(data) ? data : [];
      setEvents(expandRecurring(raw, from, to));
    } catch { setEvents([]); }
  }

  useEffect(() => { fetchEvents(); }, [currentDate, view]);

  // Navigation
  function goPrev() {
    const d = new Date(currentDate);
    if (view === 'day') d.setDate(d.getDate() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  }
  function goNext() {
    const d = new Date(currentDate);
    if (view === 'day') d.setDate(d.getDate() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  }
  function goToday() { setCurrentDate(new Date(now.getFullYear(), now.getMonth(), now.getDate())); }

  // Header title
  function getTitle() {
    if (view === 'day') {
      return `${VI_WEEKDAYS_FULL[currentDate.getDay()]}, ${currentDate.getDate()} ${VI_MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === 'week') {
      const sunday = new Date(currentDate);
      sunday.setDate(currentDate.getDate() - currentDate.getDay());
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      return `${sunday.getDate()} – ${saturday.getDate()} ${VI_MONTHS[saturday.getMonth()]} ${saturday.getFullYear()}`;
    } else {
      return `${VI_MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  }

  // Week start for week view
  function getWeekStart() {
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() - currentDate.getDay());
    return sunday;
  }

  // Dialog helpers
  function openAddForDate(date, hour = 8) {
    const ds = toDateStr(date);
    const h = String(Math.max(0, Math.min(hour, 23))).padStart(2, '0');
    const h1 = String(Math.max(0, Math.min(hour + 1, 23))).padStart(2, '0');
    setEditEvent(null);
    setForm({ ...emptyForm, startAt: `${ds}T${h}:00`, endAt: `${ds}T${h1}:00` });
    setDialogOpen(true);
  }

  function openEditDialog(ev, e) {
    if (e) e.stopPropagation();
    setEditEvent(ev);
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      startAt: toDatetimeLocal(ev.startAt || ev.startDateTime),
      endAt: toDatetimeLocal(ev.endAt || ev.endDateTime),
      allDay: ev.allDay || false,
      color: ev.color || '#1976d2',
      category: ev.category || '',
      recurrence: ev.recurrence || 'none',
    });
    setDialogOpen(true);
  }

  function closeDialog() { setDialogOpen(false); setEditEvent(null); setForm(emptyForm); }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const dateOnly = (form.startAt || '').split('T')[0];
      const payload = {
        title: form.title,
        description: form.description,
        startAt: form.allDay ? `${dateOnly}T00:00:00` : form.startAt,
        endAt: form.allDay ? `${dateOnly}T23:59:59` : form.endAt,
        allDay: form.allDay,
        color: form.color,
        category: form.category,
        recurrence: form.recurrence,
      };
      const realId = editEvent?._originalId || editEvent?.id;
      if (editEvent) await apiClient.put(`/api/calendar-events/${realId}`, payload);
      else await apiClient.post('/api/calendar-events', payload);
      await fetchEvents();
      closeDialog();
    } catch (err) { setError(err.message || 'Lỗi khi lưu sự kiện'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!editEvent) return;
    setSaving(true);
    try {
      const realId = editEvent._originalId || editEvent.id;
      await apiClient.delete(`/api/calendar-events/${realId}`);
      await fetchEvents();
      closeDialog();
    } catch (err) { setError(err.message || 'Lỗi khi xóa'); }
    finally { setSaving(false); }
  }

  // Month view callbacks
  function handleMonthDayClick(day) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    openAddForDate(d);
  }

  return (
    <PageContainer title="Lịch" description="Quản lý lịch sự kiện">
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 220 }}>{getTitle()}</Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
            <ToggleButton value="day">Ngày</ToggleButton>
            <ToggleButton value="week">Tuần</ToggleButton>
            <ToggleButton value="month">Tháng</ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem />

          <IconButton size="small" onClick={goPrev}><IconChevronLeft size={18} /></IconButton>
          <Button variant="outlined" size="small" onClick={goToday}>Hôm nay</Button>
          <IconButton size="small" onClick={goNext}><IconChevronRight size={18} /></IconButton>

          <Divider orientation="vertical" flexItem />

          <Button variant="contained" size="small" startIcon={<IconPlus size={16} />} onClick={() => openAddForDate(currentDate)}>
            Thêm sự kiện
          </Button>
        </Box>
      </Box>

      {/* Views */}
      {view === 'month' && (
        <MonthView
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          events={events}
          todayStr={todayStr}
          onDayClick={handleMonthDayClick}
          onEventClick={openEditDialog}
        />
      )}
      {view === 'week' && (
        <WeekView
          weekStart={getWeekStart()}
          events={events}
          todayStr={todayStr}
          onSlotClick={(d, h) => openAddForDate(d, h)}
          onEventClick={openEditDialog}
        />
      )}
      {view === 'day' && (
        <DayView
          date={currentDate}
          events={events}
          onHourClick={h => openAddForDate(currentDate, h)}
          onAddClick={() => openAddForDate(currentDate)}
          onEventClick={openEditDialog}
        />
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
          {editEvent && (
            <IconButton color="error" onClick={handleDelete} disabled={saving} size="small">
              <IconTrash size={18} />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Tiêu đề *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth autoFocus />
            <TextField label="Mô tả" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
            <FormControlLabel
              control={<Checkbox checked={form.allDay} onChange={e => setForm(f => ({ ...f, allDay: e.target.checked }))} />}
              label="Cả ngày"
            />
            {!form.allDay && (
              <>
                <TextField label="Bắt đầu" type="datetime-local" value={form.startAt} onChange={e => setForm(f => ({ ...f, startAt: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Kết thúc" type="datetime-local" value={form.endAt} onChange={e => setForm(f => ({ ...f, endAt: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
              </>
            )}
            <TextField label="Danh mục" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Màu sắc</InputLabel>
              <Select value={form.color} label="Màu sắc" onChange={e => setForm(f => ({ ...f, color: e.target.value }))}>
                {COLOR_OPTIONS.map(c => (
                  <MenuItem key={c.value} value={c.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: c.value }} />
                      {c.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Lặp lại</InputLabel>
              <Select value={form.recurrence} label="Lặp lại" onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}>
                {RECURRENCE_OPTIONS.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.title.trim()}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </PageContainer>
  );
}
