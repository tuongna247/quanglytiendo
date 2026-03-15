'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Fab from '@mui/material/Fab';
import { IconPlus, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';

const PRIORITIES = [
  { value: 'low', label: 'Thấp', color: 'success' },
  { value: 'medium', label: 'Trung bình', color: 'warning' },
  { value: 'high', label: 'Cao', color: 'error' },
  { value: 'urgent', label: 'Khẩn cấp', color: 'error' },
];

const STATUSES = [
  { value: 'todo', label: 'Chưa làm', color: 'default' },
  { value: 'inprogress', label: 'Đang làm', color: 'primary' },
  { value: 'done', label: 'Hoàn thành', color: 'success' },
  { value: 'cancelled', label: 'Đã hủy', color: 'error' },
];

const KANBAN_COLUMNS = [
  { status: 'todo', label: 'Chưa làm', color: '#e3f2fd' },
  { status: 'inprogress', label: 'Đang làm', color: '#fff3e0' },
  { status: 'done', label: 'Hoàn thành', color: '#e8f5e9' },
  { status: 'cancelled', label: 'Đã hủy', color: '#fce4ec' },
];

function getPriorityChip(priority) {
  const p = PRIORITIES.find(x => x.value === priority);
  return p ? <Chip label={p.label} color={p.color} size="small" /> : <Chip label={priority} size="small" />;
}

function getStatusChip(status) {
  const s = STATUSES.find(x => x.value === status);
  return s ? <Chip label={s.label} color={s.color} size="small" variant="outlined" /> : <Chip label={status} size="small" />;
}

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  dueDate: '',
  category: '',
  steps: [],
};

export default function TasksPage() {
  const [tab, setTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [stepInput, setStepInput] = useState('');
  const [error, setError] = useState('');

  async function fetchTasks() {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/tasks');
      const list = Array.isArray(data) ? data : [];
      setTasks(list.map(t => ({ ...t, steps: typeof t.steps === 'string' ? JSON.parse(t.steps || '[]') : (t.steps || []) })));
    } catch (e) { setTasks([]); setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchTasks(); }, []);

  function openAdd() {
    setEditTask(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(task) {
    setEditTask(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      category: task.category || '',
      steps: task.steps || [],
    });
    setDialogOpen(true);
  }

  function closeDialog() { setDialogOpen(false); setEditTask(null); setForm(emptyForm); setStepInput(''); }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, steps: JSON.stringify(form.steps) };
      if (editTask) await apiClient.put(`/api/tasks/${editTask.id}`, payload);
      else await apiClient.post('/api/tasks', payload);
      await fetchTasks();
      closeDialog();
    } catch (err) { setError(err.message || 'Lỗi khi lưu'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa công việc này?')) return;
    try {
      await apiClient.delete(`/api/tasks/${id}`);
      await fetchTasks();
    } catch (err) { setError(err.message || 'Lỗi khi xóa'); }
  }

  function addStep() {
    if (!stepInput.trim()) return;
    setForm(f => ({ ...f, steps: [...f.steps, { text: stepInput.trim(), done: false }] }));
    setStepInput('');
  }

  function removeStep(idx) {
    setForm(f => ({ ...f, steps: f.steps.filter((_, i) => i !== idx) }));
  }

  return (
    <PageContainer title="Công việc" description="Quản lý công việc">
      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ flex: 1 }}>
          <Tab label="Danh sách" />
          <Tab label="Kanban" />
        </Tabs>
        <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={openAdd} sx={{ mr: 1 }}>
          Thêm mới
        </Button>
      </Box>

      {tab === 0 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Ưu tiên</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hạn</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center">Đang tải...</TableCell></TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">Chưa có công việc nào</TableCell></TableRow>
                ) : tasks.map(task => (
                  <TableRow key={task.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{task.title}</Typography>
                      {task.category && <Typography variant="caption" color="textSecondary">{task.category}</Typography>}
                    </TableCell>
                    <TableCell>{getPriorityChip(task.priority)}</TableCell>
                    <TableCell>{getStatusChip(task.status)}</TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(task)}><IconEdit size={16} /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(task.id)}><IconTrash size={16} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {KANBAN_COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.status);
            return (
              <Paper
                key={col.status}
                sx={{ minWidth: 260, flex: '0 0 260px', bgcolor: col.color, borderRadius: 2, p: 1.5 }}
                elevation={2}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {col.label} <Chip label={colTasks.length} size="small" sx={{ ml: 1 }} />
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {colTasks.map(task => (
                    <Paper key={task.id} sx={{ p: 1.5, borderRadius: 1 }} elevation={1}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{task.title}</Typography>
                      {task.description && (
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                          {task.description.slice(0, 80)}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'space-between', alignItems: 'center' }}>
                        {getPriorityChip(task.priority)}
                        <Box>
                          <IconButton size="small" onClick={() => openEdit(task)}><IconEdit size={14} /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(task.id)}><IconTrash size={14} /></IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={openAdd}
      >
        <IconPlus />
      </Fab>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Tiêu đề *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth />
            <TextField label="Mô tả" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
            <FormControl fullWidth>
              <InputLabel>Ưu tiên</InputLabel>
              <Select value={form.priority} label="Ưu tiên" onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select value={form.status} label="Trạng thái" onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Hạn hoàn thành" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Danh mục" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} fullWidth />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Các bước thực hiện</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  placeholder="Thêm bước..."
                  value={stepInput}
                  onChange={e => setStepInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addStep()}
                  fullWidth
                />
                <Button variant="outlined" onClick={addStep} size="small">Thêm</Button>
              </Box>
              {form.steps.map((step, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>• {step.text || step}</Typography>
                  <IconButton size="small" onClick={() => removeStep(idx)}><IconX size={14} /></IconButton>
                </Box>
              ))}
            </Box>
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
