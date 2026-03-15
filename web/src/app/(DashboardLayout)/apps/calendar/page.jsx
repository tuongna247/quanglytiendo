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
import { IconChevronLeft, IconChevronRight, IconTrash } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';

const VI_MONTHS = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];
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
  startDateTime: '',
  endDateTime: '',
  allDay: false,
  color: '#1976d2',
  category: '',
  recurrence: 'none',
};

function toDatetimeLocal(dt) {
  if (!dt) return '';
  return new Date(dt).toISOString().slice(0, 16);
}

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetchEvents() {
    const from = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const to = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
    try {
      const data = await apiClient.get('/api/calendar-events', { from, to });
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    }
  }

  useEffect(() => { fetchEvents(); }, [currentYear, currentMonth]);

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }

  function getCalendarDays() {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) days.push({ day: daysInPrevMonth - i, currentMonth: false });
    for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, currentMonth: true });
    while (days.length < 42) days.push({ day: days.length - daysInMonth - firstDay + 1, currentMonth: false });
    return days;
  }

  function getEventsForDay(day) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(ev => ev.startDateTime?.split('T')[0] === dateStr);
  }

  function openAddDialog(day) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setEditEvent(null);
    setForm({ ...emptyForm, startDateTime: `${dateStr}T08:00`, endDateTime: `${dateStr}T09:00` });
    setDialogOpen(true);
  }

  function openEditDialog(ev, e) {
    e.stopPropagation();
    setEditEvent(ev);
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      startDateTime: toDatetimeLocal(ev.startDateTime),
      endDateTime: toDatetimeLocal(ev.endDateTime),
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
      if (editEvent) await apiClient.put(`/api/calendar-events/${editEvent.id}`, form);
      else await apiClient.post('/api/calendar-events', form);
      await fetchEvents();
      closeDialog();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!editEvent) return;
    setSaving(true);
    try {
      await apiClient.delete(`/api/calendar-events/${editEvent.id}`);
      await fetchEvents();
      closeDialog();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  const calendarDays = getCalendarDays();
  const todayStr = today.toISOString().split('T')[0];

  return (
    <PageContainer title="Lịch" description="Quản lý lịch sự kiện">
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {VI_MONTHS[currentMonth]} {currentYear}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton onClick={prevMonth}><IconChevronLeft /></IconButton>
          <Button variant="outlined" size="small" onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}>
            Hôm nay
          </Button>
          <IconButton onClick={nextMonth}><IconChevronRight /></IconButton>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 1 }}>
          <Grid container>
            {VI_WEEKDAYS.map(d => (
              <Grid key={d} sx={{ width: `${100/7}%`, textAlign: 'center', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: d === 'CN' ? 'error.main' : 'text.secondary' }}>
                  {d}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {Array.from({ length: 6 }, (_, rowIdx) => (
            <Grid container key={rowIdx}>
              {calendarDays.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
                const dayStr = cell.currentMonth
                  ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
                  : null;
                const isToday = dayStr === todayStr;
                const dayEvents = cell.currentMonth ? getEventsForDay(cell.day) : [];
                return (
                  <Box
                    key={colIdx}
                    sx={{
                      width: `${100/7}%`,
                      minHeight: 90,
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 0.5,
                      cursor: cell.currentMonth ? 'pointer' : 'default',
                      bgcolor: cell.currentMonth ? 'background.paper' : 'action.hover',
                      '&:hover': cell.currentMonth ? { bgcolor: 'action.selected' } : {},
                    }}
                    onClick={() => cell.currentMonth && openAddDialog(cell.day)}
                  >
                    <Box
                      sx={{
                        width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: isToday ? 'primary.main' : 'transparent',
                        color: isToday ? 'white' : cell.currentMonth ? 'text.primary' : 'text.disabled',
                        fontWeight: isToday ? 700 : 400,
                        fontSize: '0.8rem',
                        mb: 0.5,
                      }}
                    >
                      {cell.day}
                    </Box>
                    {dayEvents.slice(0, 3).map(ev => (
                      <Chip
                        key={ev.id}
                        label={ev.title}
                        size="small"
                        sx={{
                          bgcolor: ev.color || '#1976d2',
                          color: 'white',
                          fontSize: '0.65rem',
                          height: 18,
                          mb: 0.25,
                          width: '100%',
                          '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                        }}
                        onClick={(e) => openEditDialog(ev, e)}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <Typography variant="caption" color="textSecondary">+{dayEvents.length - 3}</Typography>
                    )}
                  </Box>
                );
              })}
            </Grid>
          ))}
        </CardContent>
      </Card>

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
            <TextField label="Tiêu đề *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth />
            <TextField label="Mô tả" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
            <FormControlLabel
              control={<Checkbox checked={form.allDay} onChange={e => setForm(f => ({ ...f, allDay: e.target.checked }))} />}
              label="Cả ngày"
            />
            {!form.allDay && (
              <>
                <TextField label="Bắt đầu" type="datetime-local" value={form.startDateTime} onChange={e => setForm(f => ({ ...f, startDateTime: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Kết thúc" type="datetime-local" value={form.endDateTime} onChange={e => setForm(f => ({ ...f, endDateTime: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
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
    </PageContainer>
  );
}
