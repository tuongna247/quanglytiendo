'use client';
import { useEffect, useState } from 'react';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableSortLabel from '@mui/material/TableSortLabel';
import { IconSearch, IconTrash, IconEdit, IconPlus, IconX } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import { api } from '@/app/lib/api';

const TOUR_TYPE_LABELS = { 0: 'Default', 1: 'Tour', 2: 'Daytrip' };
const STATUS_COLORS = { 1: 'success', 0: 'default', 2: 'warning' };
const STATUS_LABELS = { 1: 'Active', 0: 'Inactive', 2: 'Draft' };

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB');
}

function buildQuery({ page, pageSize, search, type, status, sortBy, sortDir }) {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.set('search', search);
  if (type !== '') params.set('type', type);
  if (status !== '') params.set('status', status);
  if (sortBy) params.set('sortBy', sortBy);
  if (sortDir) params.set('sortDir', sortDir);
  return `/tour?${params.toString()}`;
}

export default function ToursPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('modifiedDate');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);

  const fetchData = (overrides = {}) => {
    const params = { page, search, type, status, sortBy, sortDir, pageSize: 20, ...overrides };
    setLoading(true);
    api.get(buildQuery(params))
      .then((res) => setData(res || { items: [], total: 0, totalPages: 1 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData({ page: 1 });
  };

  const handleTypeChange = (val) => {
    setType(val);
    setPage(1);
    fetchData({ type: val, page: 1 });
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
    fetchData({ status: val, page: 1 });
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setStatus('');
    setPage(1);
    fetchData({ search: '', type: '', status: '', page: 1 });
  };

  const handleSort = (col) => {
    const newDir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(col);
    setSortDir(newDir);
    setPage(1);
    fetchData({ sortBy: col, sortDir: newDir, page: 1 });
  };

  const hasFilters = search || type !== '' || status !== '';

  const handleDelete = async (id) => {
    if (!confirm('Delete this tour?')) return;
    await api.delete(`/tour/${id}`);
    fetchData();
  };

  return (
    <PageContainer title="Tour Management" description="Tour Management">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Tour Management</Typography>
        <Button variant="contained" color="success" startIcon={<IconPlus size={18} />} href="/apps/vinaday/tours/new">
          Add New Tour
        </Button>
      </Stack>

      {/* Filter bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center" component="form" onSubmit={handleSearch}>
          <TextField
            placeholder="Search by name..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={16} />
                </InputAdornment>
              ),
            }}
          />

          <Select
            size="small"
            value={type}
            displayEmpty
            sx={{ minWidth: 130 }}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value={0}>Default</MenuItem>
            <MenuItem value={1}>Tour</MenuItem>
            <MenuItem value={2}>Daytrip</MenuItem>
          </Select>

          <Select
            size="small"
            value={status}
            displayEmpty
            sx={{ minWidth: 130 }}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value={1}>Active</MenuItem>
            <MenuItem value={0}>Inactive</MenuItem>
            <MenuItem value={2}>Draft</MenuItem>
          </Select>

          <Button type="submit" variant="contained" size="small" startIcon={<IconSearch size={16} />}>
            Search
          </Button>

          {hasFilters && (
            <Button size="small" variant="outlined" color="inherit" startIcon={<IconX size={16} />} onClick={handleClearFilters}>
              Clear
            </Button>
          )}
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                {[
                  { label: 'Id', col: 'id' },
                  { label: 'Name', col: 'name' },
                  { label: 'Type', col: 'type' },
                  { label: 'Location', col: 'location' },
                  { label: 'Price From', col: 'priceFrom' },
                  { label: 'Status', col: 'status' },
                  { label: 'Create Date', col: 'createdDate' },
                ].map(({ label, col }) => (
                  <TableCell key={col}>
                    <TableSortLabel
                      active={sortBy === col}
                      direction={sortBy === col ? sortDir : 'asc'}
                      onClick={() => handleSort(col)}
                    >
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ width: 90 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No tours found</Typography>
                  </TableCell>
                </TableRow>
              ) : data.items.map((tour) => (
                <TableRow key={tour.id} hover>
                  <TableCell>{tour.id}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2" noWrap title={tour.name}>{tour.name}</Typography>
                  </TableCell>
                  <TableCell>{TOUR_TYPE_LABELS[tour.type] ?? '—'}</TableCell>
                  <TableCell>{tour.location ?? '—'}</TableCell>
                  <TableCell>{tour.priceFrom ? `$${tour.priceFrom.toLocaleString()}` : '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[tour.status] ?? 'Unknown'}
                      color={STATUS_COLORS[tour.status] ?? 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(tour.createdDate)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="success" href={`/apps/vinaday/tours/${tour.id}`} title="Edit">
                      <IconEdit size={16} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(tour.id)} title="Delete">
                      <IconTrash size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" color="textSecondary">
            {loading ? '' : `Total: ${data.total} tours`}
          </Typography>
          {data.totalPages > 1 && (
            <Pagination
              count={data.totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
              size="small"
            />
          )}
        </Stack>
      </Paper>
    </PageContainer>
  );
}
