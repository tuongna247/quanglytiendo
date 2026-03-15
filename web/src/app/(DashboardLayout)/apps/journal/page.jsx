'use client';
import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { IconChevronLeft, IconChevronRight, IconTrash, IconPlus } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';

const VI_WEEKDAYS = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
const VI_MONTHS = ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6','tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12'];

function toDateStr(date) { return date.toISOString().split('T')[0]; }
function formatViDate(date) { return `${VI_WEEKDAYS[date.getDay()]}, ${date.getDate()} ${VI_MONTHS[date.getMonth()]} ${date.getFullYear()}`; }

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  async function fetchNote() {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/journal', { date: toDateStr(selectedDate) });
      if (data) {
        setNote(data);
        setContent(data.content || '');
        setTodos(Array.isArray(data.todos) ? data.todos : []);
      } else {
        setNote(null);
        setContent('');
        setTodos([]);
      }
    } catch {
      setNote(null);
      setContent('');
      setTodos([]);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchNote(); }, [selectedDate]);

  async function saveNote(newContent, newTodos) {
    setSaving(true);
    try {
      const payload = { date: toDateStr(selectedDate), content: newContent, todos: newTodos };
      await apiClient.post('/api/journal', payload);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  function handleContentBlur() {
    saveNote(content, todos);
  }

  function handleContentChange(e) {
    setContent(e.target.value);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveNote(e.target.value, todos), 2000);
  }

  function addTodo() {
    if (!newTodo.trim()) return;
    const updated = [...todos, { text: newTodo.trim(), done: false }];
    setTodos(updated);
    setNewTodo('');
    saveNote(content, updated);
  }

  function toggleTodo(idx) {
    const updated = todos.map((t, i) => i === idx ? { ...t, done: !t.done } : t);
    setTodos(updated);
    saveNote(content, updated);
  }

  function deleteTodo(idx) {
    const updated = todos.filter((_, i) => i !== idx);
    setTodos(updated);
    saveNote(content, updated);
  }

  function prevDay() { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }
  function nextDay() { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }

  const isToday = toDateStr(selectedDate) === toDateStr(new Date());

  return (
    <PageContainer title="Nhật ký" description="Nhật ký hàng ngày">
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Journal content */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Nhật ký</Typography>
                {saving && <CircularProgress size={16} />}
              </Box>
              <TextField
                multiline
                minRows={6}
                maxRows={16}
                fullWidth
                placeholder="Viết gì đó cho hôm nay..."
                value={content}
                onChange={handleContentChange}
                onBlur={handleContentBlur}
                variant="outlined"
              />
            </CardContent>
          </Card>

          {/* Todo list */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Danh sách việc cần làm</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {todos.length === 0 ? (
                  <Typography color="textSecondary" variant="body2">Chưa có việc nào</Typography>
                ) : todos.map((todo, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={todo.done}
                      onChange={() => toggleTodo(idx)}
                      size="small"
                    />
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, textDecoration: todo.done ? 'line-through' : 'none', color: todo.done ? 'text.disabled' : 'text.primary' }}
                    >
                      {todo.text}
                    </Typography>
                    <IconButton size="small" color="error" onClick={() => deleteTodo(idx)}>
                      <IconTrash size={14} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Thêm việc cần làm..."
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTodo()}
                  fullWidth
                />
                <Button variant="contained" onClick={addTodo} startIcon={<IconPlus size={16} />}>Thêm</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </PageContainer>
  );
}
