'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import apiClient from '@/app/lib/apiClient';
import ProgressStats from './ProgressStats';
import ProgressCharts from './ProgressCharts';

const RANGES = [7, 14, 30];

function toLocalDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function ProgressTab() {
  const [days, setDays] = useState(7);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const from = toLocalDateStr(days - 1);
    const to = toLocalDateStr(0);
    apiClient.get(`/api/workout?from=${from}&to=${to}`)
      .then(data => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mr: 1 }}>Tiến độ</Typography>
        {RANGES.map(r => (
          <Chip
            key={r}
            label={`${r} ngày`}
            onClick={() => setDays(r)}
            color={days === r ? 'primary' : 'default'}
            variant={days === r ? 'filled' : 'outlined'}
            size="small"
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <ProgressStats sessions={sessions} />
          <ProgressCharts sessions={sessions} days={days} />
        </>
      )}
    </Box>
  );
}
