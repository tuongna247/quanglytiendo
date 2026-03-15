'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import { IconPlus, IconTrash, IconEdit, IconPlayerPlay, IconCheck, IconHistory } from '@tabler/icons-react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';

const PERIOD_TABS = ['Ngày', 'Tuần', 'Tháng', 'Năm'];
const INCOME_CATS = ['Lương', 'Thưởng', 'Đầu tư', 'Quà tặng', 'Khác'];
const EXPENSE_CATS = ['Ăn uống', 'Di chuyển', 'Mua sắm', 'Hóa đơn', 'Y tế', 'Giải trí', 'Tiền nhà', 'Điện nước', 'Internet', 'Học phí', 'Bảo hiểm', 'Khác'];

function formatVND(n) {
  return (n || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function toLocalDateStr(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getPeriodRange(periodIdx) {
  const now = new Date();
  let from, to;
  if (periodIdx === 0) {
    from = to = toLocalDateStr(now);
  } else if (periodIdx === 1) {
    const day = now.getDay();
    const monday = new Date(now); monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    from = toLocalDateStr(monday);
    to = toLocalDateStr(sunday);
  } else if (periodIdx === 2) {
    from = toLocalDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
    to = toLocalDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  } else {
    from = `${now.getFullYear()}-01-01`;
    to = `${now.getFullYear()}-12-31`;
  }
  return { from, to };
}

const emptyTxForm = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  date: toLocalDateStr(new Date()),
};

const emptyFixedForm = {
  title: '',
  type: 'expense',
  amount: '',
  category: '',
  dayOfMonth: 1,
  isActive: true,
};

// ── Fixed Expenses Tab ────────────────────────────────────────────────────────
function FixedExpensesTab({ setError, setSuccess }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(emptyFixedForm);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(null); // id being applied

  async function fetchItems() {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/fixed-expenses');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchItems(); }, []);

  function openCreate() {
    setEditItem(null);
    setForm(emptyFixedForm);
    setDialogOpen(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({ title: item.title, type: item.type, amount: String(item.amount), category: item.category, dayOfMonth: item.dayOfMonth, isActive: item.isActive });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title || !form.amount || !form.category) return;
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), dayOfMonth: Number(form.dayOfMonth) };
      if (editItem) {
        await apiClient.put(`/api/fixed-expenses/${editItem.id}`, payload);
      } else {
        await apiClient.post('/api/fixed-expenses', payload);
      }
      await fetchItems();
      setDialogOpen(false);
    } catch (err) { setError(err.message || 'Lỗi khi lưu'); }
    finally { setSaving(false); }
  }

  async function handleToggleActive(item) {
    try {
      await apiClient.put(`/api/fixed-expenses/${item.id}`, { isActive: !item.isActive });
      setItems(prev => prev.map(x => x.id === item.id ? { ...x, isActive: !x.isActive } : x));
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa khoản cố định này?')) return;
    try {
      await apiClient.delete(`/api/fixed-expenses/${id}`);
      setItems(prev => prev.filter(x => x.id !== id));
    } catch (err) { setError(err.message); }
  }

  async function handleApply(item) {
    setApplying(item.id);
    try {
      const now = new Date();
      await apiClient.post(`/api/fixed-expenses/${item.id}/apply`, { year: now.getFullYear(), month: now.getMonth() + 1 });
      setSuccess(`Đã ghi "${item.title}" vào giao dịch tháng ${now.getMonth() + 1}/${now.getFullYear()}`);
      await fetchItems();
    } catch (err) { setError(err.message); }
    finally { setApplying(null); }
  }

  const totalIncome = items.filter(x => x.isActive && x.type === 'income').reduce((s, x) => s + (x.amount || 0), 0);
  const totalExpense = items.filter(x => x.isActive && x.type === 'expense').reduce((s, x) => s + (x.amount || 0), 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <>
      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Thu cố định / tháng</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>+{formatVND(totalIncome)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Chi cố định / tháng</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>-{formatVND(totalExpense)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: totalBalance >= 0 ? 'primary.main' : 'warning.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Số dư cố định / tháng</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: totalBalance >= 0 ? 'primary.main' : 'warning.main' }}>{formatVND(totalBalance)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5, pb: 0 }}>
            <Button variant="contained" size="small" startIcon={<IconPlus size={16} />} onClick={openCreate}>
              Thêm khoản
            </Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên khoản</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell align="center">Ngày</TableCell>
                <TableCell align="right">Số tiền</TableCell>
                <TableCell align="center">Tháng này</TableCell>
                <TableCell align="center">Kích hoạt</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center"><LinearProgress /></TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="textSecondary" variant="body2" sx={{ py: 2 }}>
                      Chưa có khoản cố định nào. Thêm các khoản như tiền nhà, điện nước, học phí...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : items.map(item => (
                <TableRow key={item.id} hover sx={{ opacity: item.isActive ? 1 : 0.5 }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                  </TableCell>
                  <TableCell><Chip label={item.category} size="small" variant="outlined" /></TableCell>
                  <TableCell align="center">
                    <Chip label={`Ngày ${item.dayOfMonth}`} size="small" color="default" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: item.type === 'income' ? 'success.main' : 'error.main' }}>
                      {item.type === 'income' ? '+' : '-'}{formatVND(item.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {item.isAppliedThisMonth ? (
                      <Tooltip title={`Đã ghi tháng ${new Date().getMonth() + 1} — Bấm để ghi thêm`}>
                        <span>
                          <Button size="small" variant="contained" color="success" startIcon={<IconCheck size={14} />}
                            disabled={!item.isActive || applying === item.id} onClick={() => handleApply(item)}>
                            {applying === item.id ? '...' : 'Đã ghi'}
                          </Button>
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip title={`Ghi ${item.type === 'income' ? 'thu nhập' : 'chi phí'} vào tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`}>
                        <span>
                          <Button size="small" variant="outlined" color="primary" startIcon={<IconPlayerPlay size={14} />}
                            disabled={!item.isActive || applying === item.id} onClick={() => handleApply(item)}>
                            {applying === item.id ? '...' : 'Ghi'}
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Switch size="small" checked={item.isActive} onChange={() => handleToggleActive(item)} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(item)}><IconEdit size={16} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><IconTrash size={16} /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Sửa khoản cố định' : 'Thêm khoản cố định'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Loại *</InputLabel>
              <Select value={form.type} label="Loại *" onChange={e => setForm(f => ({ ...f, type: e.target.value, category: '' }))}>
                <MenuItem value="income">Thu nhập cố định</MenuItem>
                <MenuItem value="expense">Chi phí cố định</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Tên khoản *"
              placeholder={form.type === 'income' ? 'VD: Lương, Tiền thuê nhà thu...' : 'VD: Tiền nhà, Học phí con, Điện nước...'}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Số tiền *"
              value={form.amount ? Number(form.amount).toLocaleString('vi-VN') : ''}
              onChange={e => {
                const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                setForm(f => ({ ...f, amount: raw }));
              }}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
              helperText={form.amount ? formatVND(Number(form.amount)) : ''}
            />
            <FormControl fullWidth>
              <InputLabel>Danh mục *</InputLabel>
              <Select value={form.category} label="Danh mục *" onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {(form.type === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Ngày {form.type === 'income' ? 'nhận' : 'thanh toán'} trong tháng *</InputLabel>
              <Select
                value={form.dayOfMonth}
                label={`Ngày ${form.type === 'income' ? 'nhận' : 'thanh toán'} trong tháng *`}
                onChange={e => setForm(f => ({ ...f, dayOfMonth: e.target.value }))}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                  <MenuItem key={d} value={d}>Ngày {d} mỗi tháng</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.title || !form.amount || !form.category}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ── Main Finance Page ─────────────────────────────────────────────────────────
export default function FinancePage() {
  const [periodTab, setPeriodTab] = useState(2); // 0-3 = period, 4 = fixed
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyTxForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isFixedTab = periodTab === 4;

  async function fetchTransactions() {
    if (isFixedTab) return;
    setLoading(true);
    const { from, to } = getPeriodRange(periodTab);
    try {
      const data = await apiClient.get('/api/transactions', { from, to });
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) { setTransactions([]); setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchTransactions(); }, [periodTab]);

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const balance = income - expense;

  async function handleSave() {
    if (!form.amount || !form.category) return;
    setSaving(true);
    try {
      await apiClient.post('/api/transactions', { ...form, amount: parseFloat(form.amount) });
      await fetchTransactions();
      setDialogOpen(false);
      setForm(emptyTxForm);
    } catch (err) { setError(err.message || 'Lỗi khi lưu giao dịch'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa giao dịch này?')) return;
    try {
      await apiClient.delete(`/api/transactions/${id}`);
      await fetchTransactions();
    } catch (err) { setError(err.message || 'Lỗi khi xóa'); }
  }

  return (
    <PageContainer title="Tài chính" description="Quản lý thu chi">
      {/* Summary cards — only show on period tabs */}
      {!isFixedTab && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Thu nhập</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{formatVND(income)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Chi tiêu</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>{formatVND(expense)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: balance >= 0 ? 'primary.main' : 'warning.main' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Số dư</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: balance >= 0 ? 'primary.main' : 'warning.main' }}>{formatVND(balance)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={periodTab} onChange={(_, v) => setPeriodTab(v)} sx={{ flex: 1 }}>
          {PERIOD_TABS.map((t, i) => <Tab key={i} label={t} />)}
          <Tab label="Cố định" />
        </Tabs>
        {!isFixedTab && (
          <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={() => setDialogOpen(true)} sx={{ mr: 1 }}>
            Thêm mới
          </Button>
        )}
      </Box>

      {/* Fixed expenses tab */}
      {isFixedTab ? (
        <FixedExpensesTab setError={setError} setSuccess={setSuccess} />
      ) : (
        /* Transaction list */
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center">Đang tải...</TableCell></TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">Chưa có giao dịch nào</TableCell></TableRow>
                ) : transactions.map(t => (
                  <TableRow key={t.id} hover>
                    <TableCell><Typography variant="caption">{new Date(t.date + 'T00:00:00').toLocaleDateString('vi-VN')}</Typography></TableCell>
                    <TableCell><Chip label={t.category} size="small" variant="outlined" /></TableCell>
                    <TableCell><Typography variant="body2">{t.description || '-'}</Typography></TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: t.type === 'income' ? 'success.main' : 'error.main' }}>
                        {t.type === 'income' ? '+' : '-'}{formatVND(t.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}><IconTrash size={16} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add transaction dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm giao dịch</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Loại</InputLabel>
              <Select value={form.type} label="Loại" onChange={e => setForm(f => ({ ...f, type: e.target.value, category: '' }))}>
                <MenuItem value="income">Thu nhập</MenuItem>
                <MenuItem value="expense">Chi tiêu</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Số tiền *"
              value={form.amount ? Number(form.amount).toLocaleString('vi-VN') : ''}
              onChange={e => {
                const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                setForm(f => ({ ...f, amount: raw }));
              }}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
              helperText={form.amount ? formatVND(Number(form.amount)) : ''}
            />
            <FormControl fullWidth>
              <InputLabel>Danh mục *</InputLabel>
              <Select value={form.category} label="Danh mục *" onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {(form.type === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Mô tả" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth />
            <TextField label="Ngày" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.amount || !form.category}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </PageContainer>
  );
}
