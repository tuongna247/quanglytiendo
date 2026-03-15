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
import { IconChevronLeft, IconChevronRight, IconPlus, IconTrash } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';

const VI_WEEKDAYS = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
const VI_MONTHS = ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6','tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12'];

const MOODS = [
  { value: 'grateful', label: 'Biết ơn', color: 'success' },
  { value: 'challenged', label: 'Thách thức', color: 'warning' },
  { value: 'peaceful', label: 'Bình an', color: 'info' },
  { value: 'struggling', label: 'Khó khăn', color: 'error' },
  { value: 'joyful', label: 'Vui mừng', color: 'primary' },
];

function toDateStr(d) { return d.toISOString().split('T')[0]; }
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

export default function DevotionPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchDevotion() {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/devotion', { date: toDateStr(selectedDate) });
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
    } catch {
      setForm(emptyForm);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchDevotion(); }, [selectedDate]);

  function prevDay() { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }
  function nextDay() { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }

  function addPassage() {
    setForm(f => ({ ...f, biblePassages: [...f.biblePassages, { ...emptyPassage }] }));
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
      await apiClient.post('/api/devotion', { ...form, date: toDateStr(selectedDate) });
      alert('Đã lưu tĩnh nguyện!');
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  const isToday = toDateStr(selectedDate) === toDateStr(new Date());

  return (
    <PageContainer title="Tĩnh nguyện" description="Tĩnh nguyện hàng ngày">
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Bible passages */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Đoạn Kinh Thánh</Typography>
                <Button startIcon={<IconPlus size={16} />} onClick={addPassage} size="small" variant="outlined">
                  Thêm đoạn
                </Button>
              </Box>
              {form.biblePassages.length === 0 ? (
                <Typography color="textSecondary" variant="body2">Chưa có đoạn Kinh Thánh nào</Typography>
              ) : form.biblePassages.map((p, idx) => (
                <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField label="Sách" value={p.book} onChange={e => updatePassage(idx, 'book', e.target.value)} fullWidth size="small" placeholder="Ví dụ: Giăng" />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <TextField label="Chương" type="number" value={p.chapter} onChange={e => updatePassage(idx, 'chapter', e.target.value)} fullWidth size="small" inputProps={{ min: 1 }} />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <TextField label="Câu đầu" type="number" value={p.verseStart} onChange={e => updatePassage(idx, 'verseStart', e.target.value)} fullWidth size="small" inputProps={{ min: 1 }} />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <TextField label="Câu cuối" type="number" value={p.verseEnd} onChange={e => updatePassage(idx, 'verseEnd', e.target.value)} fullWidth size="small" inputProps={{ min: 1 }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {p.book && <Chip label={`${p.book} ${p.chapter}:${p.verseStart}${p.verseEnd ? `-${p.verseEnd}` : ''}`} size="small" variant="outlined" />}
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
                <TextField
                  label="Kinh Thánh dạy gì?"
                  multiline
                  minRows={3}
                  fullWidth
                  value={form.whatBibleTeaches}
                  onChange={e => setForm(f => ({ ...f, whatBibleTeaches: e.target.value }))}
                />
                <TextField
                  label="Tôi học được gì?"
                  multiline
                  minRows={3}
                  fullWidth
                  value={form.whatILearned}
                  onChange={e => setForm(f => ({ ...f, whatILearned: e.target.value }))}
                />
                <TextField
                  label="Áp dụng thế nào?"
                  multiline
                  minRows={3}
                  fullWidth
                  value={form.howToApply}
                  onChange={e => setForm(f => ({ ...f, howToApply: e.target.value }))}
                />
                <TextField
                  label="Điểm cầu nguyện"
                  multiline
                  minRows={2}
                  fullWidth
                  value={form.prayerPoints}
                  onChange={e => setForm(f => ({ ...f, prayerPoints: e.target.value }))}
                />
                <TextField
                  label="Câu ghi nhớ"
                  fullWidth
                  value={form.memoryVerse}
                  onChange={e => setForm(f => ({ ...f, memoryVerse: e.target.value }))}
                />
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
    </PageContainer>
  );
}
