'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import { api } from '@/app/lib/api';

const PAYMENT_STATUS = {
  0: { label: 'Pending', color: 'warning' },
  1: { label: 'Paid', color: 'success' },
  2: { label: 'Partial', color: 'info' },
  3: { label: 'Refunded', color: 'default' },
  4: { label: 'Completed', color: 'success' },
};

export default function BookingsPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = (p = page, q = search) => {
    setLoading(true);
    api.get(`/booking?page=${p}&pageSize=20&search=${encodeURIComponent(q)}`)
      .then((res) => setData(res || { items: [], total: 0, totalPages: 1 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(1, search);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this booking?')) return;
    await api.delete(`/booking/${id}`);
    fetchData();
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
  const fmtMoney = (n) => n ? `$${Number(n).toLocaleString()}` : '—';

  return (
    <PageContainer title="Bookings" description="Booking Management">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Bookings</Typography>
        <Typography variant="body2" color="textSecondary">
          Total: {data.total.toLocaleString()}
        </Typography>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={handleSearch}>
          <TextField
            placeholder="Search by name or customer..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Name / Hotel</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Nights</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No bookings found</Typography>
                  </TableCell>
                </TableRow>
              ) : data.items.map((b) => {
                const ps = PAYMENT_STATUS[b.paymentStatus] ?? { label: 'Unknown', color: 'default' };
                return (
                  <TableRow key={b.id} hover>
                    <TableCell>{b.id}</TableCell>
                    <TableCell>{b.customerName || '—'}</TableCell>
                    <TableCell>{b.name || '—'}</TableCell>
                    <TableCell>{fmtDate(b.checkIn)}</TableCell>
                    <TableCell>{fmtDate(b.checkOut)}</TableCell>
                    <TableCell>{b.night ?? '—'}</TableCell>
                    <TableCell>{fmtMoney(b.total)}</TableCell>
                    <TableCell>
                      <Chip label={ps.label} color={ps.color} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(b.id)}>
                        <IconTrash size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {data.totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={data.totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
            />
          </Box>
        )}
      </Paper>
    </PageContainer>
  );
}
