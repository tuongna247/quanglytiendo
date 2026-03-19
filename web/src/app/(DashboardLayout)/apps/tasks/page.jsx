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
import { IconPlus, IconEdit, IconTrash, IconX, IconDownload, IconUpload } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';
import {
  downloadJSON, downloadCSV, readJSONFile, readCSVFile,
  TASK_COLUMNS, stripServerFields, validateTasks,
} from '@/app/lib/exportImport';
import FriendSelector from '@/app/components/apps/friends/FriendSelector';

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
  const [exportOpen, setExportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState(null); // { rows, errors }
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);
  const [friendUserId, setFriendUserId] = useState(null);
  const [friendTasks, setFriendTasks] = useState([]);
  const [friendTasksShared, setFriendTasksShared] = useState(true);
  const [loadingFriendTasks, setLoadingFriendTasks] = useState(false);

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

  function handleExportJSON() {
    downloadJSON(stripServerFields(tasks, TASK_COLUMNS), `tasks_${new Date().toISOString().split('T')[0]}.json`);
  }
  function handleExportCSV() {
    downloadCSV(stripServerFields(tasks, TASK_COLUMNS), TASK_COLUMNS, `tasks_${new Date().toISOString().split('T')[0]}.csv`);
  }
  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = file.name.endsWith('.csv') ? await readCSVFile(file) : await readJSONFile(file);
      const errors = validateTasks(rows);
      setImportPreview({ rows, errors });
      setImportProgress(0);
      setImportDone(false);
    } catch (err) { setError(err.message); }
    e.target.value = '';
  }
  async function handleImportConfirm() {
    if (!importPreview?.rows?.length) return;
    const rows = importPreview.rows;
    setImportProgress(1);
    let done = 0;
    for (const row of rows) {
      try {
        await apiClient.post('/api/tasks', {
          title: row.title || '',
          description: row.description || '',
          status: row.status || 'todo',
          priority: row.priority || 'medium',
          category: row.category || '',
          dueDate: row.dueDate || null,
          steps: typeof row.steps === 'string' ? row.steps : JSON.stringify(row.steps || []),
          tags: typeof row.tags === 'string' ? row.tags : JSON.stringify(row.tags || []),
        });
      } catch { /* skip invalid rows */ }
      done++;
      setImportProgress(Math.round((done / rows.length) * 100));
    }
    setImportDone(true);
    setImportPreview(null);
    await fetchTasks();
  }

  function removeStep(idx) {
    setForm(f => ({ ...f, steps: f.steps.filter((_, i) => i !== idx) }));
  }

  async function handleKanbanDrop(result) {
    if (!result.destination) return;
    const destColStatus = result.destination.droppableId;
    const srcColStatus = result.source.droppableId;
    if (destColStatus === srcColStatus && result.destination.index === result.source.index) return;

    const taskId = result.draggableId;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === destColStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: destColStatus } : t));
    try {
      await apiClient.put(`/api/tasks/${taskId}`, { ...task, status: destColStatus, steps: JSON.stringify(task.steps || []) });
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật');
      await fetchTasks(); // revert on error
    }
  }

  async function handleFriendSelect(userId) {
    setFriendUserId(userId);
    if (!userId) { setFriendTasks([]); return; }
    setLoadingFriendTasks(true);
    try {
      const data = await apiClient.get(`/api/friends/${userId}/tasks`);
      setFriendTasksShared(data.shared);
      setFriendTasks(data.tasks || []);
    } catch { setFriendTasks([]); }
    finally { setLoadingFriendTasks(false); }
  }

  return (
    <PageContainer title="Công việc" description="Quản lý công việc">
      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); if (v !== 2) setFriendUserId(null); }} sx={{ flex: 1 }}>
          <Tab label="Danh sách" />
          <Tab label="Kanban" />
          <Tab label="Bạn bè" />
        </Tabs>
        {tab !== 2 && (
          <>
            <Tooltip title="Xuất / Nhập dữ liệu">
              <IconButton onClick={() => { setExportOpen(true); setImportPreview(null); setImportProgress(0); setImportDone(false); }} sx={{ mr: 1 }}>
                <IconDownload size={20} />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={openAdd} sx={{ mr: 1 }}>
              Thêm mới
            </Button>
          </>
        )}
      </Box>

      {/* Export/Import Dialog */}
      <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Xuất / Nhập Công việc</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Xuất dữ liệu ({tasks.length} công việc)</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button size="small" variant="outlined" startIcon={<IconDownload size={15} />} onClick={handleExportJSON}>JSON</Button>
            <Button size="small" variant="outlined" startIcon={<IconDownload size={15} />} onClick={handleExportCSV}>CSV (Excel)</Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Nhập dữ liệu</Typography>
          <Button component="label" size="small" variant="outlined" startIcon={<IconUpload size={15} />}>
            Chọn file (.json, .csv)
            <input type="file" accept=".json,.csv" hidden onChange={handleImportFile} />
          </Button>

          {importPreview && (
            <Box sx={{ mt: 2 }}>
              {importPreview.errors.length > 0 ? (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>Có {importPreview.errors.length} lỗi:</Typography>
                  {importPreview.errors.slice(0, 5).map((e, i) => <Typography key={i} variant="caption" display="block">{e}</Typography>)}
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 1 }}>Tìm thấy {importPreview.rows.length} bản ghi hợp lệ.</Alert>
              )}
              <Button
                variant="contained"
                size="small"
                disabled={importPreview.errors.length > 0 || importProgress > 0}
                onClick={handleImportConfirm}
              >
                Nhập tất cả
              </Button>
            </Box>
          )}

          {importProgress > 0 && !importDone && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption">Đang nhập... {importProgress}%</Typography>
              <LinearProgress variant="determinate" value={importProgress} sx={{ mt: 0.5 }} />
            </Box>
          )}
          {importDone && <Alert severity="success" sx={{ mt: 2 }}>Nhập xong!</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

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
        <DragDropContext onDragEnd={handleKanbanDrop}>
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
                  <Droppable droppableId={col.status}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          display: 'flex', flexDirection: 'column', gap: 1,
                          minHeight: 40,
                          bgcolor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.04)' : 'transparent',
                          borderRadius: 1, transition: 'background 0.15s',
                        }}
                      >
                        {colTasks.map((task, idx) => (
                          <Draggable key={task.id} draggableId={task.id} index={idx}>
                            {(prov, snap) => (
                              <Paper
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                sx={{ p: 1.5, borderRadius: 1, opacity: snap.isDragging ? 0.85 : 1, boxShadow: snap.isDragging ? 4 : 1 }}
                                elevation={snap.isDragging ? 4 : 1}
                              >
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
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              );
            })}
          </Box>
        </DragDropContext>
      )}

      {tab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FriendSelector value={friendUserId} onChange={handleFriendSelect} label="Chọn bạn bè" />
          </Box>
          {!friendUserId && (
            <Typography color="textSecondary" align="center" sx={{ py: 4 }}>Chọn một người bạn để xem công việc của họ</Typography>
          )}
          {friendUserId && loadingFriendTasks && (
            <Typography align="center" sx={{ py: 4 }}>Đang tải...</Typography>
          )}
          {friendUserId && !loadingFriendTasks && !friendTasksShared && (
            <Alert severity="info">Bạn bè này chưa bật chia sẻ Công việc.</Alert>
          )}
          {friendUserId && !loadingFriendTasks && friendTasksShared && (
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Ưu tiên</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Hạn</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {friendTasks.length === 0 ? (
                      <TableRow><TableCell colSpan={4} align="center">Chưa có công việc nào</TableCell></TableRow>
                    ) : friendTasks.map(task => (
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {tab !== 2 && (
        <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={openAdd}>
          <IconPlus />
        </Fab>
      )}

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
