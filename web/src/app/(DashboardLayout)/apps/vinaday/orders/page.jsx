'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  IconSearch, IconEye, IconPlus,
} from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import { api } from '@/app/lib/api';

const STATUS_MAP = {
  1: { label: 'Holding',       color: 'default' },
  2: { label: 'Confirmed',     color: 'success' },
  3: { label: 'Deposit',       color: 'info' },
  4: { label: 'Cancelled',     color: 'error' },
  5: { label: 'Refunded',      color: 'warning' },
  6: { label: 'Amended',       color: 'secondary' },
  40:{ label: 'Cancel w/ Fee', color: 'error' },
};

const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
const fmtMoney  = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—';

export default function OrdersPage() {
  const router = useRouter();
  const [tab,     setTab]     = useState(0);   // 0 = Tour, 1 = Other
  const [data,    setData]    = useState({ items: [], total: 0 });
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [loading, setLoading] = useState(true);

  const endpoint = tab === 0 ? '/admin/booking/tour-orders' : '/admin/booking/other-orders';

  const fetchData = (p = page, q = search, s = status) => {
    setLoading(true);
    const qs = new URLSearchParams({ page: p, pageSize: 20 });
    if (q) qs.set('search', q);
    if (s) qs.set('status', s);
    api.get(`${endpoint}?${qs}`)
      .then((res) => setData(res || { items: [], total: 0 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); fetchData(1, search, status); }, [tab]);
  useEffect(() => { fetchData(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(1, search, status);
  };

  const totalPages = Math.max(1, Math.ceil(data.total / 20));

  return (
    <PageContainer title="Orders" description="Tour & Other Service Order Management">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Orders</Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={() => router.push('/apps/vinaday/orders/new')}
        >
          New Order
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Tour Orders" />
        <Tab label="Other Services" />
      </Tabs>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" gap={2} component="form" onSubmit={handleSearch} alignItems="center">
          <TextField
            placeholder="Search PNR, product, guest name..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><IconSearch size={18} /></InputAdornment>
              ),
            }}
          />
          <Select
            size="small"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); fetchData(1, search, e.target.value); }}
            displayEmpty
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {Object.entries(STATUS_MAP).map(([v, s]) => (
              <MenuItem key={v} value={v}>{s.label}</MenuItem>
            ))}
          </Select>
          <Button type="submit" variant="outlined" size="small">Search</Button>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>PNR</TableCell>
                <TableCell>Product / Tour</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : data.items.map((o) => {
                const st = STATUS_MAP[o.status] ?? { label: `#${o.status}`, color: 'default' };
                return (
                  <TableRow key={o.id} hover>
                    <TableCell>{o.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{o.pnr || '—'}</TableCell>
                    <TableCell>{o.productName || '—'}</TableCell>
                    <TableCell>{[o.guestFirstName, o.guestLastName].filter(Boolean).join(' ') || '—'}</TableCell>
                    <TableCell>{o.customerEmail || '—'}</TableCell>
                    <TableCell>{fmtDate(o.startDate)}</TableCell>
                    <TableCell>{fmtMoney(o.amount)}</TableCell>
                    <TableCell>
                      <Chip label={st.label} color={st.color} size="small" />
                    </TableCell>
                    <TableCell>{fmtDate(o.createdDate)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => router.push(`/apps/vinaday/orders/${o.id}`)}
                      >
                        <IconEye size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Total: {data.total.toLocaleString()} orders
          </Typography>
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
              size="small"
            />
          )}
        </Box>
      </Paper>
    </PageContainer>
  );
}
