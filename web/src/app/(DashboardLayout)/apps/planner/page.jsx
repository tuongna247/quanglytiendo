'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { IconChevronLeft, IconChevronRight, IconEdit, IconTrash, IconPlus, IconGripVertical, IconDownload, IconUpload } from '@tabler/icons-react';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';
import {
  downloadJSON, downloadCSV, readJSONFile, readCSVFile,
  PLANNER_COLUMNS, stripServerFields, validatePlanner,
} from '@/app/lib/exportImport';

const PRIORITIES = [
  { value: 'low', label: 'Thấp', color: 'success' },
  { value: 'medium', label: 'Trung bình', color: 'warning' },
  { value: 'high', label: 'Cao', color: 'error' },
];

const VI_WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const VI_MONTHS = ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6','tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12'];

function formatViDate(date) {
  return `${VI_WEEKDAYS[date.getDay()]}, ${date.getDate()} ${VI_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

const emptyForm = { title: '', priority: 'medium', estimatedMinutes: '' };

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);

  async function fetchItems() {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/planner', { date: toDateStr(selectedDate) });
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchItems(); }, [selectedDate]);

  function prevDay() { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }
  function nextDay() { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }

  async function handleToggle(item) {
    try {
      await apiClient.put(`/api/planner/${item.id}`, { ...item, done: !item.done });
      setItems(items.map(i => i.id === item.id ? { ...i, done: !i.done } : i));
    } catch (err) { console.error(err); }
  }

  async function handleDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
    try {
      await Promise.all(reordered.map((item, idx) =>
        apiClient.put(`/api/planner/${item.id}`, { ...item, order: idx })
      ));
    } catch (err) { console.error(err); }
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({ title: item.title, priority: item.priority || 'medium', estimatedMinutes: item.estimatedMinutes || '' });
    setDialogOpen(true);
  }

  function closeDialog() { setDialogOpen(false); setEditItem(null); setForm(emptyForm); }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editItem) {
        await apiClient.put(`/api/planner/${editItem.id}`, { ...editItem, ...form, estimatedMinutes: form.estimatedMinutes ? parseInt(form.estimatedMinutes) : null });
      } else {
        await apiClient.post('/api/planner', { ...form, date: toDateStr(selectedDate), done: false, estimatedMinutes: form.estimatedMinutes ? parseInt(form.estimatedMinutes) : null });
      }
      await fetchItems();
      closeDialog();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa mục này?')) return;
    try {
      await apiClient.delete(`/api/planner/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) { console.error(err); }
  }

  async function handleExportJSON() {
    try {
      const now = new Date();
      const from = `${now.getFullYear()}-01-01`;
      const to = `${now.getFullYear()}-12-31`;
      const data = await apiClient.get('/api/planner/range', { from, to });
      downloadJSON(stripServerFields(data, PLANNER_COLUMNS), `planner_${now.getFullYear()}.json`);
    } catch (e) { console.error(e); }
  }

  async function handleExportCSV() {
    try {
      const now = new Date();
      const from = `${now.getFullYear()}-01-01`;
      const to = `${now.getFullYear()}-12-31`;
      const data = await apiClient.get('/api/planner/range', { from, to });
      downloadCSV(stripServerFields(data, PLANNER_COLUMNS), PLANNER_COLUMNS, `planner_${now.getFullYear()}.csv`);
    } catch (e) { console.error(e); }
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = file.name.endsWith('.csv') ? await readCSVFile(file) : await readJSONFile(file);
      const errors = validatePlanner(rows);
      setImportPreview({ rows, errors });
      setImportProgress(0);
      setImportDone(false);
    } catch (err) { console.error(err); }
    e.target.value = '';
  }

  async function handleImportConfirm() {
    if (!importPreview?.rows?.length) return;
    const rows = importPreview.rows;
    setImportProgress(0);
    for (let i = 0; i < rows.length; i++) {
      try {
        await apiClient.post('/api/planner', { ...rows[i], isDone: rows[i].isDone === 'true' || rows[i].isDone === true, estimatedMinutes: rows[i].estimatedMinutes ? parseInt(rows[i].estimatedMinutes) : null });
      } catch { /* skip */ }
      setImportProgress(Math.round(((i + 1) / rows.length) * 100));
    }
    setImportDone(true);
    setImportPreview(null);
    await fetchItems();
  }

  async function handleQuickAdd() {
    if (!quickTitle.trim()) return;
    try {
      await apiClient.post('/api/planner', { title: quickTitle.trim(), priority: 'medium', date: toDateStr(selectedDate), done: false });
      setQuickTitle('');
      await fetchItems();
    } catch (err) { console.error(err); }
  }

  return (
    <PageContainer title="Kế hoạch ngày" description="Lập kế hoạch hàng ngày">
      {/* Date navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={prevDay}><IconChevronLeft /></IconButton>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {formatViDate(selectedDate)}
          </Typography>
        </Box>
        <IconButton onClick={nextDay}><IconChevronRight /></IconButton>
        <Button variant="outlined" size="small" onClick={() => setSelectedDate(new Date())}>Hôm nay</Button>
        <Tooltip title="Xuất / Nhập dữ liệu">
          <IconButton onClick={() => { setExportOpen(true); setImportPreview(null); setImportDone(false); }}>
            <IconDownload size={20} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Items list */}
      <Card sx={{ borderRadius: 2, mb: 2 }}>
        <CardContent>
          {loading ? (
            <Typography align="center" color="textSecondary">Đang tải...</Typography>
          ) : items.length === 0 ? (
            <Typography align="center" color="textSecondary">Chưa có kế hoạch nào cho ngày này</Typography>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="planner">
                {(provided) => (
                  <Box ref={provided.innerRef} {...provided.droppableProps}>
                    {items.map((item, idx) => {
                      const priority = PRIORITIES.find(p => p.value === item.priority);
                      return (
                        <Draggable key={item.id} draggableId={String(item.id)} index={idx}>
                          {(prov) => (
                            <Box
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                mb: 1,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: item.done ? 'action.hover' : 'background.paper',
                              }}
                            >
                              <Box {...prov.dragHandleProps} sx={{ color: 'text.disabled', cursor: 'grab' }}>
                                <IconGripVertical size={16} />
                              </Box>
                              <Checkbox checked={!!item.done} onChange={() => handleToggle(item)} size="small" />
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'text.disabled' : 'text.primary' }}
                                >
                                  {item.title}
                                </Typography>
                                {item.estimatedMinutes && (
                                  <Typography variant="caption" color="textSecondary">{item.estimatedMinutes} phút</Typography>
                                )}
                              </Box>
                              {priority && <Chip label={priority.label} color={priority.color} size="small" />}
                              <IconButton size="small" onClick={() => openEdit(item)}><IconEdit size={14} /></IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><IconTrash size={14} /></IconButton>
                            </Box>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Quick add */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Thêm nhanh</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Nhập kế hoạch mới..."
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
              fullWidth
            />
            <Button variant="contained" onClick={handleQuickAdd} startIcon={<IconPlus size={16} />}>
              Thêm
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Export / Import dialog */}
      <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Xuất / Nhập kế hoạch</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Xuất dữ liệu (cả năm hiện tại)</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Button variant="outlined" startIcon={<IconDownload size={16} />} onClick={handleExportJSON}>Xuất JSON</Button>
            <Button variant="outlined" startIcon={<IconDownload size={16} />} onClick={handleExportCSV}>Xuất CSV</Button>
          </Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Nhập dữ liệu</Typography>
          <Button component="label" variant="outlined" startIcon={<IconUpload size={16} />}>
            Chọn file JSON / CSV
            <input type="file" accept=".json,.csv" hidden onChange={handleImportFile} />
          </Button>
          {importPreview && (
            <Box sx={{ mt: 2 }}>
              {importPreview.errors.length > 0 ? (
                <Alert severity="error">{importPreview.errors.map((e, i) => <div key={i}>{e}</div>)}</Alert>
              ) : (
                <Alert severity="info">Tìm thấy {importPreview.rows.length} mục. Nhấn Nhập để thêm.</Alert>
              )}
            </Box>
          )}
          {importProgress > 0 && !importDone && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={importProgress} />
              <Typography variant="caption">{importProgress}%</Typography>
            </Box>
          )}
          {importDone && <Alert severity="success" sx={{ mt: 2 }}>Nhập dữ liệu thành công!</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportOpen(false)}>Đóng</Button>
          {importPreview && importPreview.errors.length === 0 && (
            <Button variant="contained" onClick={handleImportConfirm}>Nhập</Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Chỉnh sửa kế hoạch' : 'Thêm kế hoạch'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Tiêu đề *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Ưu tiên</InputLabel>
              <Select value={form.priority} label="Ưu tiên" onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Thời gian ước tính (phút)"
              type="number"
              value={form.estimatedMinutes}
              onChange={e => setForm(f => ({ ...f, estimatedMinutes: e.target.value }))}
              fullWidth
              inputProps={{ min: 0 }}
            />
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
