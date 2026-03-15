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
import Fab from '@mui/material/Fab';
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
import { BarChart } from '@mui/x-charts/BarChart';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';

const PERIOD_TABS = ['Ngày', 'Tuần', 'Tháng', 'Năm'];
const INCOME_CATS = ['Lương', 'Thưởng', 'Đầu tư', 'Quà tặng', 'Khác'];
const EXPENSE_CATS = ['Ăn uống', 'Di chuyển', 'Mua sắm', 'Hóa đơn', 'Y tế', 'Giải trí', 'Khác'];
const PAYMENT_METHODS = ['Tiền mặt', 'Chuyển khoản', 'Thẻ tín dụng', 'Ví điện tử'];

function formatVND(n) {
  return (n || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function getPeriodRange(periodIdx) {
  const now = new Date();
  let from, to;
  if (periodIdx === 0) {
    from = to = now.toISOString().split('T')[0];
  } else if (periodIdx === 1) {
    const day = now.getDay();
    const monday = new Date(now); monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    from = monday.toISOString().split('T')[0];
    to = sunday.toISOString().split('T')[0];
  } else if (periodIdx === 2) {
    from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  } else {
    from = `${now.getFullYear()}-01-01`;
    to = `${now.getFullYear()}-12-31`;
  }
  return { from, to };
}

const emptyForm = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'Tiền mặt',
};

export default function FinancePage() {
  const [periodTab, setPeriodTab] = useState(2);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function fetchTransactions() {
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

  // Chart data by category
  const catMap = {};
  transactions.forEach(t => {
    if (!catMap[t.category]) catMap[t.category] = { income: 0, expense: 0 };
    catMap[t.category][t.type] = (catMap[t.category][t.type] || 0) + (t.amount || 0);
  });
  const chartCategories = Object.keys(catMap);
  const chartIncome = chartCategories.map(c => catMap[c].income || 0);
  const chartExpense = chartCategories.map(c => catMap[c].expense || 0);

  async function handleSave() {
    if (!form.amount || !form.category) return;
    setSaving(true);
    try {
      await apiClient.post('/api/transactions', { ...form, amount: parseFloat(form.amount) });
      await fetchTransactions();
      setDialogOpen(false);
      setForm(emptyForm);
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
      {/* Summary cards */}
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

      {/* Period tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={periodTab} onChange={(_, v) => setPeriodTab(v)}>
          {PERIOD_TABS.map((t, i) => <Tab key={i} label={t} />)}
        </Tabs>
      </Box>

      {/* Chart */}
      {chartCategories.length > 0 && (
        <Card sx={{ borderRadius: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Thu chi theo danh mục</Typography>
            <BarChart
              xAxis={[{ scaleType: 'band', data: chartCategories }]}
              series={[
                { data: chartIncome, label: 'Thu nhập', color: '#2e7d32' },
                { data: chartExpense, label: 'Chi tiêu', color: '#d32f2f' },
              ]}
              height={240}
            />
          </CardContent>
        </Card>
      )}

      {/* Transaction list */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Phương thức</TableCell>
                <TableCell align="right">Số tiền</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center">Đang tải...</TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">Chưa có giao dịch nào</TableCell></TableRow>
              ) : transactions.map(t => (
                <TableRow key={t.id} hover>
                  <TableCell><Typography variant="caption">{new Date(t.date).toLocaleDateString('vi-VN')}</Typography></TableCell>
                  <TableCell><Chip label={t.category} size="small" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="body2">{t.description || '-'}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{t.paymentMethod || '-'}</Typography></TableCell>
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

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => setDialogOpen(true)}>
        <IconPlus />
      </Fab>

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
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              fullWidth
              inputProps={{ min: 0 }}
            />
            <FormControl fullWidth>
              <InputLabel>Danh mục *</InputLabel>
              <Select value={form.category} label="Danh mục *" onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {(form.type === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Mô tả" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth />
            <TextField label="Ngày" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth>
              <InputLabel>Phương thức thanh toán</InputLabel>
              <Select value={form.paymentMethod} label="Phương thức thanh toán" onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                {PAYMENT_METHODS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
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
    </PageContainer>
  );
}
