'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
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
import { IconPlus, IconTrash, IconEdit, IconPlayerPlay, IconCheck, IconHistory, IconDownload, IconUpload, IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';
import {
  downloadJSON, downloadCSV, readJSONFile, readCSVFile,
  TRANSACTION_COLUMNS, stripServerFields, validateTransactions,
} from '@/app/lib/exportImport';
import FriendSelector from '@/app/components/apps/friends/FriendSelector';

const PERIOD_TABS = ['Ngày', 'Tuần', 'Tháng', 'Năm'];
const DEFAULT_INCOME_CATS = ['Lương', 'Thưởng', 'Đầu tư', 'Quà tặng', 'Khác'];
const EXPENSE_CATS = ['Ăn uống', 'Di chuyển', 'Mua sắm', 'Hóa đơn', 'Y tế', 'Giải trí', 'Tiền nhà', 'Điện nước', 'Internet', 'Học phí', 'Bảo hiểm', 'Khác'];

function useIncomeCats() {
  const [custom, setCustom] = useState(() => {
    try { return JSON.parse(localStorage.getItem('finance_income_cats') || '[]'); } catch { return []; }
  });
  const all = [...DEFAULT_INCOME_CATS, ...custom.filter(c => !DEFAULT_INCOME_CATS.includes(c))];
  function addCat(name) {
    const trimmed = name.trim();
    if (!trimmed || all.includes(trimmed)) return;
    const next = [...custom, trimmed];
    setCustom(next);
    localStorage.setItem('finance_income_cats', JSON.stringify(next));
  }
  return { incomeCats: all, addIncomeCat: addCat };
}

function formatVND(n) {
  return (n || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function toLocalDateStr(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getPeriodRange(periodIdx, selectedMonth) {
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
    // Use selectedMonth for monthly view
    const [y, m] = selectedMonth.split('-').map(Number);
    from = `${monthKey(y, m)}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    to = `${monthKey(y, m)}-${String(lastDay).padStart(2, '0')}`;
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
  const { incomeCats, addIncomeCat } = useIncomeCats();
  const [newCatInput, setNewCatInput] = useState('');

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
              <Select
                value={form.category}
                label="Danh mục *"
                onChange={e => {
                  if (e.target.value === '__add__') return;
                  setForm(f => ({ ...f, category: e.target.value }));
                }}
              >
                {(form.type === 'income' ? incomeCats : EXPENSE_CATS).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                {form.type === 'income' && (
                  <MenuItem value="__add__" disableRipple sx={{ flexDirection: 'column', alignItems: 'stretch', p: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }} onClick={e => e.stopPropagation()}>
                      <TextField
                        size="small"
                        placeholder="Tên danh mục mới..."
                        value={newCatInput}
                        onChange={e => setNewCatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { addIncomeCat(newCatInput); setForm(f => ({ ...f, category: newCatInput.trim() })); setNewCatInput(''); } }}
                        sx={{ flex: 1 }}
                      />
                      <Button size="small" variant="contained" onClick={() => { addIncomeCat(newCatInput); setForm(f => ({ ...f, category: newCatInput.trim() })); setNewCatInput(''); }}>
                        Thêm
                      </Button>
                    </Box>
                  </MenuItem>
                )}
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

// ── Cash Flow Timeline Tab ────────────────────────────────────────────────────
function CashFlowTab() {
  const now = new Date();
  const theme = useTheme();
  const [year, setYear] = useState(now.getFullYear());
  const [monthData, setMonthData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const txs = await apiClient.get('/api/transactions', {
        from: `${year}-01-01`,
        to: `${year}-12-31`,
      });
      const byMonth = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expense: 0 }));
      (txs || []).forEach(t => {
        const m = new Date(t.date).getMonth();
        if (t.type === 'income') byMonth[m].income += t.amount || 0;
        else byMonth[m].expense += t.amount || 0;
      });
      let running = 0;
      setMonthData(byMonth.map(r => {
        const balance = r.income - r.expense;
        running += balance;
        return { ...r, balance, running };
      }));
    } catch { setMonthData([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, [year]);

  const totalIncome = monthData.reduce((s, d) => s + d.income, 0);
  const totalExpense = monthData.reduce((s, d) => s + d.expense, 0);
  const totalBalance = totalIncome - totalExpense;
  const currentMonth = now.getMonth() + 1;

  const chartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: "'Plus Jakarta Sans', sans-serif", foreColor: '#adb0bb' },
    colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.primary.main],
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
    dataLabels: { enabled: false },
    stroke: { width: [0, 0, 2.5], curve: 'smooth' },
    xaxis: { categories: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'] },
    yaxis: {
      labels: {
        formatter: v => {
          if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}tr`;
          if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
          return String(v);
        },
      },
    },
    tooltip: { y: { formatter: v => formatVND(v) }, theme: 'dark' },
    legend: { position: 'top' },
    grid: { borderColor: 'rgba(0,0,0,0.07)' },
  };

  const chartSeries = [
    { name: 'Thu nhập', type: 'bar', data: monthData.map(d => d.income) },
    { name: 'Chi tiêu', type: 'bar', data: monthData.map(d => d.expense) },
    { name: 'Số dư lũy kế', type: 'line', data: monthData.map(d => d.running) },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Dòng tiền theo tháng</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => setYear(y => y - 1)}><IconChevronLeft size={20} /></IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 50, textAlign: 'center' }}>{year}</Typography>
          <IconButton size="small" onClick={() => setYear(y => y + 1)} disabled={year >= now.getFullYear()}><IconChevronRight size={20} /></IconButton>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
            <CardContent sx={{ pb: '12px !important' }}>
              <Typography variant="subtitle2" color="textSecondary">Tổng thu {year}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{formatVND(totalIncome)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
            <CardContent sx={{ pb: '12px !important' }}>
              <Typography variant="subtitle2" color="textSecondary">Tổng chi {year}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>{formatVND(totalExpense)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: totalBalance >= 0 ? 'primary.main' : 'warning.main' }}>
            <CardContent sx={{ pb: '12px !important' }}>
              <Typography variant="subtitle2" color="textSecondary">Số dư năm {year}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: totalBalance >= 0 ? 'primary.main' : 'warning.main' }}>{formatVND(totalBalance)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          {loading ? <LinearProgress /> : (
            <Chart options={chartOptions} series={chartSeries} type="bar" height={300} width="100%" />
          )}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tháng</TableCell>
                <TableCell align="right">Thu nhập</TableCell>
                <TableCell align="right">Chi tiêu</TableCell>
                <TableCell align="right">Số dư tháng</TableCell>
                <TableCell align="right">Lũy kế</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthData.map(d => {
                const isEmpty = d.income === 0 && d.expense === 0;
                const isCurrent = d.month === currentMonth && year === now.getFullYear();
                return (
                  <TableRow key={d.month} hover sx={{ opacity: isEmpty ? 0.35 : 1, bgcolor: isCurrent ? 'action.selected' : 'inherit' }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 400 }}>
                        Tháng {d.month}{isCurrent ? ' ▸' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: d.income > 0 ? 'success.main' : 'text.disabled' }}>
                        {d.income > 0 ? formatVND(d.income) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: d.expense > 0 ? 'error.main' : 'text.disabled' }}>
                        {d.expense > 0 ? formatVND(d.expense) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: isEmpty ? 'text.disabled' : d.balance >= 0 ? 'success.main' : 'error.main' }}>
                        {isEmpty ? '—' : (d.balance >= 0 ? '+' : '') + formatVND(d.balance)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: isEmpty ? 'text.disabled' : d.running >= 0 ? 'primary.main' : 'warning.main' }}>
                        {isEmpty ? '—' : formatVND(d.running)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}

// ── Main Finance Page ─────────────────────────────────────────────────────────
export default function FinancePage() {
  const now = new Date();
  const [periodTab, setPeriodTab] = useState(2); // 0=Ngày,1=Tuần,2=Tháng,3=Năm,4=Cố định,5=Dòng tiền,6=Bạn bè
  const [selectedMonth, setSelectedMonth] = useState(() => monthKey(now.getFullYear(), now.getMonth() + 1));
  const [transactions, setTransactions] = useState([]);
  const [fixedItems, setFixedItems] = useState([]); // for combined monthly view
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyTxForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);
  const [friendUserId, setFriendUserId] = useState(null);
  const [friendSummary, setFriendSummary] = useState(null);
  const [friendShared, setFriendShared] = useState(true);
  const [loadingFriend, setLoadingFriend] = useState(false);
  const [friendMonth, setFriendMonth] = useState(() => monthKey(now.getFullYear(), now.getMonth() + 1));
  const { incomeCats, addIncomeCat } = useIncomeCats();
  const [newCatInput, setNewCatInput] = useState('');

  const isFixedTab = periodTab === 4;
  const isMonthTab = periodTab === 2;

  // Month navigation helpers
  const [selYear, selMonth] = selectedMonth.split('-').map(Number);
  function prevMonth() {
    const d = new Date(selYear, selMonth - 2, 1);
    setSelectedMonth(monthKey(d.getFullYear(), d.getMonth() + 1));
  }
  function nextMonth() {
    const d = new Date(selYear, selMonth, 1);
    setSelectedMonth(monthKey(d.getFullYear(), d.getMonth() + 1));
  }
  const isCurrentMonth = selectedMonth === monthKey(now.getFullYear(), now.getMonth() + 1);

  async function fetchTransactions() {
    if (isFixedTab) return;
    setLoading(true);
    const { from, to } = getPeriodRange(periodTab, selectedMonth);
    try {
      const data = await apiClient.get('/api/transactions', { from, to });
      setTransactions(Array.isArray(data) ? data : []);
      // On monthly tab, also load fixed items to show unapplied ones
      if (isMonthTab) {
        const fixed = await apiClient.get('/api/fixed-expenses').catch(() => []);
        setFixedItems(Array.isArray(fixed) ? fixed.filter(f => f.isActive) : []);
      }
    } catch (e) { setTransactions([]); setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchTransactions(); }, [periodTab, selectedMonth]);

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  // Fixed items not yet applied this month — count as planned
  const unappliedFixed = isMonthTab ? fixedItems.filter(f => !f.isAppliedThisMonth || selectedMonth !== monthKey(now.getFullYear(), now.getMonth() + 1)) : [];
  const plannedIncome = isMonthTab ? fixedItems.filter(f => f.type === 'income' && !f.isAppliedThisMonth).reduce((s, f) => s + f.amount, 0) : 0;
  const plannedExpense = isMonthTab ? fixedItems.filter(f => f.type === 'expense' && !f.isAppliedThisMonth).reduce((s, f) => s + f.amount, 0) : 0;
  const totalIncome = income + (isCurrentMonth ? plannedIncome : 0);
  const totalExpense = expense + (isCurrentMonth ? plannedExpense : 0);
  const balance = totalIncome - totalExpense;

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

  async function loadFriendSummary(userId, month) {
    if (!userId) { setFriendSummary(null); return; }
    setLoadingFriend(true);
    try {
      const data = await apiClient.get(`/api/friends/${userId}/finance-summary`, { month });
      setFriendShared(data.shared);
      setFriendSummary(data.summary || null);
    } catch { setFriendShared(false); setFriendSummary(null); }
    finally { setLoadingFriend(false); }
  }

  async function handleExportJSON() {
    try {
      const now = new Date();
      const data = await apiClient.get('/api/transactions', { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` });
      downloadJSON(stripServerFields(data, TRANSACTION_COLUMNS), `transactions_${now.getFullYear()}.json`);
    } catch (e) { setError(e.message); }
  }

  async function handleExportCSV() {
    try {
      const now = new Date();
      const data = await apiClient.get('/api/transactions', { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` });
      downloadCSV(stripServerFields(data, TRANSACTION_COLUMNS), TRANSACTION_COLUMNS, `transactions_${now.getFullYear()}.csv`);
    } catch (e) { setError(e.message); }
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = file.name.endsWith('.csv') ? await readCSVFile(file) : await readJSONFile(file);
      const errors = validateTransactions(rows);
      setImportPreview({ rows, errors });
      setImportProgress(0);
      setImportDone(false);
    } catch (err) { setError(err.message); }
    e.target.value = '';
  }

  async function handleImportConfirm() {
    if (!importPreview?.rows?.length) return;
    const rows = importPreview.rows;
    setImportProgress(0);
    for (let i = 0; i < rows.length; i++) {
      try {
        await apiClient.post('/api/transactions', { ...rows[i], amount: parseFloat(rows[i].amount) });
      } catch { /* skip invalid rows */ }
      setImportProgress(Math.round(((i + 1) / rows.length) * 100));
    }
    setImportDone(true);
    setImportPreview(null);
    await fetchTransactions();
  }

  return (
    <PageContainer title="Tài chính" description="Quản lý thu chi">
      {/* Summary cards — only show on period tabs */}
      {!isFixedTab && periodTab !== 6 && periodTab !== 5 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
              <CardContent sx={{ pb: '12px !important' }}>
                <Typography variant="subtitle2" color="textSecondary">Thu nhập</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{formatVND(isMonthTab ? totalIncome : income)}</Typography>
                {isMonthTab && income > 0 && plannedIncome > 0 && isCurrentMonth && (
                  <Typography variant="caption" color="textSecondary">Thực tế: {formatVND(income)} + Dự kiến: {formatVND(plannedIncome)}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
              <CardContent sx={{ pb: '12px !important' }}>
                <Typography variant="subtitle2" color="textSecondary">Chi tiêu</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>{formatVND(isMonthTab ? totalExpense : expense)}</Typography>
                {isMonthTab && expense > 0 && plannedExpense > 0 && isCurrentMonth && (
                  <Typography variant="caption" color="textSecondary">Thực tế: {formatVND(expense)} + Cố định chưa ghi: {formatVND(plannedExpense)}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: balance >= 0 ? 'primary.main' : 'warning.main' }}>
              <CardContent sx={{ pb: '12px !important' }}>
                <Typography variant="subtitle2" color="textSecondary">Số dư</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: balance >= 0 ? 'primary.main' : 'warning.main' }}>{formatVND(balance)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs value={periodTab} onChange={(_, v) => { setPeriodTab(v); if (v !== 6) setFriendUserId(null); }} sx={{ flex: 1 }}>
          {PERIOD_TABS.map((t, i) => <Tab key={i} label={t} />)}
          <Tab label="Cố định" />
          <Tab label="Dòng tiền" />
          <Tab label="Bạn bè" />
        </Tabs>
        {!isFixedTab && periodTab !== 6 && periodTab !== 5 && (
          <>
            <Tooltip title="Xuất / Nhập dữ liệu">
              <IconButton onClick={() => { setExportOpen(true); setImportPreview(null); setImportDone(false); }} sx={{ mr: 0.5 }}>
                <IconDownload size={20} />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={() => setDialogOpen(true)} sx={{ mr: 1 }}>
              Thêm mới
            </Button>
          </>
        )}
      </Box>

      {/* Month navigator — only on Tháng tab */}
      {isMonthTab && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 1.5, mb: 2, bgcolor: 'action.hover', borderRadius: 2, mt: 1 }}>
          <IconButton size="small" onClick={prevMonth}><IconChevronLeft size={20} /></IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconCalendar size={18} />
            <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 140, textAlign: 'center' }}>
              Tháng {selMonth}/{selYear}
            </Typography>
            {isCurrentMonth && <Chip label="Tháng này" size="small" color="primary" />}
          </Box>
          <IconButton size="small" onClick={nextMonth} disabled={isCurrentMonth}><IconChevronRight size={20} /></IconButton>
        </Box>
      )}

      {/* Cash flow timeline tab */}
      {periodTab === 5 && <CashFlowTab />}

      {/* Friend finance summary tab */}
      {periodTab === 6 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <FriendSelector
              value={friendUserId}
              onChange={(uid) => { setFriendUserId(uid); loadFriendSummary(uid, friendMonth); }}
              label="Chọn bạn bè"
            />
            <input
              type="month"
              value={friendMonth}
              onChange={e => { setFriendMonth(e.target.value); loadFriendSummary(friendUserId, e.target.value); }}
              style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', fontSize: 14 }}
            />
          </Box>
          {!friendUserId && (
            <Typography color="textSecondary" align="center" sx={{ py: 4 }}>Chọn bạn bè để xem tóm tắt tài chính</Typography>
          )}
          {friendUserId && loadingFriend && (
            <Typography align="center" sx={{ py: 4 }}>Đang tải...</Typography>
          )}
          {friendUserId && !loadingFriend && !friendShared && (
            <Alert severity="info">Bạn bè này chưa bật chia sẻ Tài chính.</Alert>
          )}
          {friendUserId && !loadingFriend && friendShared && friendSummary && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Thu nhập</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{formatVND(friendSummary.totalIncome)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Chi tiêu</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>{formatVND(friendSummary.totalExpense)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: friendSummary.balance >= 0 ? 'primary.main' : 'warning.main' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Số dư</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: friendSummary.balance >= 0 ? 'primary.main' : 'warning.main' }}>{formatVND(friendSummary.balance)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>Thu nhập theo danh mục</Typography>
                      {friendSummary.incomeByCategory.map(c => (
                        <Box key={c.category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{c.category}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>{formatVND(c.amount)}</Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'error.main' }}>Chi tiêu theo danh mục</Typography>
                      {friendSummary.expenseByCategory.map(c => (
                        <Box key={c.category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{c.category}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>{formatVND(c.amount)}</Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      )}

      {/* Fixed expenses tab */}
      {periodTab === 4 ? (
        <FixedExpensesTab setError={setError} setSuccess={setSuccess} />
      ) : periodTab !== 6 && periodTab !== 5 ? (
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
                ) : transactions.length === 0 && (!isMonthTab || fixedItems.length === 0) ? (
                  <TableRow><TableCell colSpan={5} align="center">Chưa có giao dịch nào</TableCell></TableRow>
                ) : (
                  <>
                    {transactions.map(t => (
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
                    {/* Unapplied fixed items shown as planned rows on current month */}
                    {isMonthTab && isCurrentMonth && fixedItems.filter(f => !f.isAppliedThisMonth).map(f => (
                      <TableRow key={`fixed-${f.id}`} sx={{ opacity: 0.55, bgcolor: 'action.hover' }}>
                        <TableCell>
                          <Typography variant="caption" color="textSecondary">Ngày {f.dayOfMonth}/{selMonth}</Typography>
                        </TableCell>
                        <TableCell><Chip label={f.category} size="small" variant="outlined" /></TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                            {f.title} <Chip label="Cố định" size="small" sx={{ ml: 0.5, fontSize: 10 }} />
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: f.type === 'income' ? 'success.light' : 'error.light', fontStyle: 'italic' }}>
                            {f.type === 'income' ? '+' : '-'}{formatVND(f.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

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
              <Select
                value={form.category}
                label="Danh mục *"
                onChange={e => {
                  if (e.target.value === '__add__') return;
                  setForm(f => ({ ...f, category: e.target.value }));
                }}
              >
                {(form.type === 'income' ? incomeCats : EXPENSE_CATS).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                {form.type === 'income' && (
                  <MenuItem value="__add__" disableRipple sx={{ flexDirection: 'column', alignItems: 'stretch', p: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }} onClick={e => e.stopPropagation()}>
                      <TextField
                        size="small"
                        placeholder="Tên danh mục mới..."
                        value={newCatInput}
                        onChange={e => setNewCatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { addIncomeCat(newCatInput); setForm(f => ({ ...f, category: newCatInput.trim() })); setNewCatInput(''); } }}
                        sx={{ flex: 1 }}
                      />
                      <Button size="small" variant="contained" onClick={() => { addIncomeCat(newCatInput); setForm(f => ({ ...f, category: newCatInput.trim() })); setNewCatInput(''); }}>
                        Thêm
                      </Button>
                    </Box>
                  </MenuItem>
                )}
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

      {/* Export / Import dialog */}
      <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Xuất / Nhập giao dịch</DialogTitle>
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
                <Alert severity="error" sx={{ mb: 1 }}>
                  {importPreview.errors.map((e, i) => <div key={i}>{e}</div>)}
                </Alert>
              ) : (
                <Alert severity="info">Tìm thấy {importPreview.rows.length} giao dịch. Nhấn Nhập để thêm vào.</Alert>
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

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </PageContainer>
  );
}
