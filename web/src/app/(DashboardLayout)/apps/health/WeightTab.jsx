'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import { LineChart } from '@mui/x-charts/LineChart';
import { IconTrash } from '@tabler/icons-react';
import apiClient from '@/app/lib/apiClient';

export default function WeightTab() {
  const [weights, setWeights] = useState([]);
  const [form, setForm] = useState({ weight: '', date: new Date().toISOString().split('T')[0], note: '' });
  const [saving, setSaving] = useState(false);

  async function fetchWeights() {
    try {
      const data = await apiClient.get('/api/health/weight');
      setWeights(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }

  useEffect(() => { fetchWeights(); }, []);

  async function deleteWeight(id) {
    try {
      await apiClient.delete(`/api/health/weight/${id}`);
      await fetchWeights();
    } catch (err) { console.error(err); }
  }

  async function saveWeight() {
    if (!form.weight) return;
    setSaving(true);
    try {
      await apiClient.post('/api/health/weight', {
        date: form.date,
        weightKg: parseFloat(form.weight),
        notes: form.note || null,
      });
      setForm({ weight: '', date: new Date().toISOString().split('T')[0], note: '' });
      await fetchWeights();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  const chartData = weights.slice(-30);
  const chartDates = chartData.map(w => new Date(w.date).toLocaleDateString('vi-VN'));
  const chartWeights = chartData.map(w => Number(w.weightKg));

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Ghi cân nặng</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Cân nặng (kg) *" type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} fullWidth inputProps={{ step: 0.1 }} />
              <TextField label="Ngày" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Ghi chú" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} fullWidth />
              <Button variant="contained" onClick={saveWeight} disabled={saving || !form.weight}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        {chartWeights.length > 1 && (
          <Card sx={{ borderRadius: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Biểu đồ cân nặng</Typography>
              <LineChart
                xAxis={[{ scaleType: 'point', data: chartDates }]}
                series={[{ data: chartWeights, label: 'Cân nặng (kg)', color: '#1976d2' }]}
                height={220}
              />
            </CardContent>
          </Card>
        )}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Cân nặng (kg)</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {[...weights].reverse().slice(0, 10).map((w, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{new Date(w.date).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{w.weightKg}</TableCell>
                    <TableCell>{w.notes || '-'}</TableCell>
                    <TableCell sx={{ p: 0.5 }}>
                      <IconButton size="small" color="error" onClick={() => deleteWeight(w.id)}>
                        <IconTrash size={15} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
