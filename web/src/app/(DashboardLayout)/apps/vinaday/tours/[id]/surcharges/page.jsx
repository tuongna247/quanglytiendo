'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconTrash } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import TourTabNav from '../../_components/TourTabNav';
import { api } from '@/app/lib/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ALL_DAYS = DAYS.join(',');

const EMPTY_FORM = {
  stayDateFrom: '',
  stayDateTo: '',
  surchargeName: '',
  surchargeType: 1,
  price: '',
  days: [...DAYS],
};

export default function TourSurchargesPage() {
  const { id } = useParams();
  const [surcharges, setSurcharges] = useState([]);
  const [surchargeTypes, setSurchargeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get(`/tour/${id}/surcharges`),
      api.get('/surcharge-types'),
    ]).then(([list, types]) => {
      setSurcharges(list || []);
      setSurchargeTypes(types || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const toggleDay = (day) => {
    setForm((p) => ({
      ...p,
      days: p.days.includes(day) ? p.days.filter((d) => d !== day) : [...p.days, day],
    }));
  };

  const handleAdd = async () => {
    if (!form.stayDateFrom || !form.stayDateTo || !form.surchargeName) return;
    await api.post(`/tour/${id}/surcharges`, {
      stayDateFrom: form.stayDateFrom,
      stayDateTo: form.stayDateTo,
      surchargeName: form.surchargeName,
      type: form.surchargeType,
      price: parseFloat(form.price) || null,
      dateOfWeek: form.days.join(','),
    });
    setForm(EMPTY_FORM);
    fetchData();
  };

  const handleDelete = async (surchargeId) => {
    if (!confirm('Delete this surcharge?')) return;
    await api.delete(`/tour/${id}/surcharges/${surchargeId}`);
    fetchData();
  };

  return (
    <PageContainer title="Tour Surcharge" description="Tour Surcharge">
      <Typography variant="h4" mb={0.5}>Tour Surcharge</Typography>
      <Typography variant="body2" color="textSecondary" mb={3}></Typography>

      <Paper>
        <Stack direction="row" justifyContent="flex-end" sx={{ px: 2, pt: 2, pb: 1 }}>
          <TourTabNav tourId={id} active="Surcharges" />
        </Stack>
        <Divider />

        <Box sx={{ p: 3 }}>
          {/* Add form */}
          <Stack direction="row" flexWrap="wrap" gap={1} alignItems="flex-end" mb={2}>
            <TextField size="small" label="Stay date from" type="date" value={form.stayDateFrom} InputLabelProps={{ shrink: true }}
              onChange={(e) => setForm((p) => ({ ...p, stayDateFrom: e.target.value }))} />
            <TextField size="small" label="Stay date to" type="date" value={form.stayDateTo} InputLabelProps={{ shrink: true }}
              onChange={(e) => setForm((p) => ({ ...p, stayDateTo: e.target.value }))} />
            <Select size="small" value={form.surchargeName} displayEmpty sx={{ minWidth: 180 }}
              onChange={(e) => setForm((p) => ({ ...p, surchargeName: e.target.value }))}>
              <MenuItem value=""><em>Select a surcharge</em></MenuItem>
              {surchargeTypes.map((t) => <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>)}
            </Select>
            <Select size="small" value={form.surchargeType} sx={{ minWidth: 120 }}
              onChange={(e) => setForm((p) => ({ ...p, surchargeType: e.target.value }))}>
              <MenuItem value={1}>Price</MenuItem>
              <MenuItem value={2}>Percent</MenuItem>
            </Select>
            <TextField size="small" label="Price" type="number" value={form.price} sx={{ width: 110 }}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            <Button variant="contained" color="info" size="small" onClick={handleAdd}>Add</Button>
          </Stack>

          {/* Day of week checkboxes */}
          <Box sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200', borderRadius: 1, p: 1.5, mb: 3, display: 'inline-flex', gap: 1, flexWrap: 'wrap' }}>
            {DAYS.map((day) => (
              <FormControlLabel
                key={day}
                label={day}
                control={<Checkbox size="small" checked={form.days.includes(day)} onChange={() => toggleDay(day)} />}
                sx={{ mr: 0 }}
              />
            ))}
          </Box>

          {/* Surcharge list */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Stay Date From</TableCell>
                  <TableCell>Stay Date To</TableCell>
                  <TableCell>Surcharge</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {surcharges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">No surcharges yet</Typography>
                    </TableCell>
                  </TableRow>
                ) : surcharges.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.stayDateFrom}</TableCell>
                    <TableCell>{s.stayDateTo}</TableCell>
                    <TableCell>{s.surchargeName}</TableCell>
                    <TableCell>{s.type === 2 ? 'Percent' : 'Price'}</TableCell>
                    <TableCell>{s.price}</TableCell>
                    <TableCell>{s.dateOfWeek}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}>
                        <IconTrash size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="contained" color="success" href={`/apps/vinaday/tours/${id}/promotions`}>
              Save and Continue
            </Button>
            <Button variant="outlined" href="/apps/vinaday/tours">Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </PageContainer>
  );
}
