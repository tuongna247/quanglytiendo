'use client';
import { useState, useEffect } from 'react';
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

// ─── Week View ─────────────────────────────────────────────────────────────────
function WeekView({ weekStart, events, todayStr, onDayClick, onEventClick }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  function eventsForDate(d) {
    const ds = toDateStr(d);
    return events.filter(ev => (ev.startAt || '').split('T')[0] === ds);
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 1 }}>
        <Grid container>
          {days.map((d, idx) => {
            const ds = toDateStr(d);
            const isToday = ds === todayStr;
            const dayEvents = eventsForDate(d);
            return (
              <Box
                key={idx}
                sx={{
                  width: `${100/7}%`, minHeight: 200,
                  border: '1px solid', borderColor: 'divider', p: 0.75,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => onDayClick(d)}
              >
                <Box sx={{ textAlign: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {VI_WEEKDAYS[idx]}
                  </Typography>
                  <Box sx={{
                    width: 28, height: 28, mx: 'auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: isToday ? 'primary.main' : 'transparent',
                    color: isToday ? 'white' : 'text.primary',
                    fontWeight: isToday ? 700 : 500, fontSize: '0.85rem',
                  }}>
                    {d.getDate()}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {dayEvents.map(ev => (
                    <EventChip key={ev.id} ev={ev} onClick={e => { e.stopPropagation(); onEventClick(ev, e); }} />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}

// ─── Day View ──────────────────────────────────────────────────────────────────
function DayView({ date, events, onAddClick, onEventClick }) {
  const ds = toDateStr(date);
  const dayEvents = events
    .filter(ev => (ev.startAt || '').split('T')[0] === ds)
    .sort((a, b) => (a.startAt || '') < (b.startAt || '') ? -1 : 1);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {VI_WEEKDAYS_FULL[date.getDay()]}, {date.getDate()} {VI_MONTHS[date.getMonth()]}
          </Typography>
          <Button size="small" variant="outlined" startIcon={<IconPlus size={14} />} onClick={onAddClick}>
            Thêm
          </Button>
        </Box>
        {dayEvents.length === 0 ? (
          <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
            Không có sự kiện nào
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {dayEvents.map(ev => (
              <Box
                key={ev.id}
                sx={{
                  display: 'flex', gap: 2, p: 1.5, borderRadius: 1,
                  borderLeft: `4px solid ${ev.color || '#1976d2'}`,
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
                onClick={e => onEventClick(ev, e)}
              >
                <Box sx={{ minWidth: 60 }}>
                  {ev.allDay ? (
                    <Typography variant="caption" color="textSecondary">Cả ngày</Typography>
                  ) : (
                    <>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>{formatTime(ev.startAt)}</Typography>
                      <Typography variant="caption" color="textSecondary">{formatTime(ev.endAt)}</Typography>
                    </>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{ev.title}</Typography>
                  {ev.description && <Typography variant="caption" color="textSecondary">{ev.description}</Typography>}
                  {ev.category && <Chip label={ev.category} size="small" sx={{ mt: 0.5, height: 16, fontSize: '0.6rem' }} />}
                </Box>
              </Box>
            ))}
          </Box>
        )}
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
    if (view === 'day') {
      return { from: toDateStr(currentDate), to: toDateStr(currentDate) };
    } else if (view === 'week') {
      const sunday = new Date(currentDate);
      sunday.setDate(currentDate.getDate() - currentDate.getDay());
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      return { from: toDateStr(sunday), to: toDateStr(saturday) };
    } else {
      const from = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
      const to = toDateStr(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
      return { from, to };
    }
  }

  async function fetchEvents() {
    const { from, to } = getFetchRange();
    try {
      const data = await apiClient.get('/api/calendar-events', { from, to });
      setEvents(Array.isArray(data) ? data : []);
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
  function openAddForDate(date) {
    const ds = toDateStr(date);
    setEditEvent(null);
    setForm({ ...emptyForm, startAt: `${ds}T08:00`, endAt: `${ds}T09:00` });
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
      if (editEvent) await apiClient.put(`/api/calendar-events/${editEvent.id}`, payload);
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
      await apiClient.delete(`/api/calendar-events/${editEvent.id}`);
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
          onDayClick={d => { openAddForDate(d); }}
          onEventClick={openEditDialog}
        />
      )}
      {view === 'day' && (
        <DayView
          date={currentDate}
          events={events}
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
