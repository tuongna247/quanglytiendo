import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

function buildDateRange(days) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const label = `${d.getDate()}/${d.getMonth()+1}`;
    dates.push({ key, label });
  }
  return dates;
}

export default function ProgressCharts({ sessions, days }) {
  const dateRange = useMemo(() => buildDateRange(days), [days]);

  const byDate = useMemo(() => {
    const map = {};
    for (const sess of sessions) {
      if (!map[sess.date]) map[sess.date] = { count: 0, volume: 0, sets: 0 };
      map[sess.date].count++;
      for (const ex of sess.exercises || []) {
        for (const set of ex.sets || []) {
          map[sess.date].sets++;
          map[sess.date].volume += (set.reps || 0) * (set.weightKg || 1);
        }
      }
    }
    return map;
  }, [sessions]);

  const labels = dateRange.map(d => d.label);
  const freq = dateRange.map(d => byDate[d.key]?.count || 0);
  const volume = dateRange.map(d => Math.round(byDate[d.key]?.volume || 0));
  const sets = dateRange.map(d => byDate[d.key]?.sets || 0);

  const hasData = freq.some(v => v > 0);

  if (!hasData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">Chưa có buổi tập nào trong {days} ngày qua.</Typography>
        <Typography variant="body2" color="text.secondary">Bắt đầu một giáo án để theo dõi tiến độ!</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Tần suất tập luyện</Typography>
            <BarChart
              xAxis={[{ scaleType: 'band', data: labels }]}
              series={[{ data: freq, label: 'Buổi tập', color: '#1976d2' }]}
              height={200}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Thể tích (kg·rep)</Typography>
            <LineChart
              xAxis={[{ scaleType: 'point', data: labels }]}
              series={[{ data: volume, label: 'Thể tích', color: '#4CAF50', area: true }]}
              height={200}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Số sets mỗi ngày</Typography>
            <LineChart
              xAxis={[{ scaleType: 'point', data: labels }]}
              series={[{ data: sets, label: 'Sets', color: '#FF5722' }]}
              height={180}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
