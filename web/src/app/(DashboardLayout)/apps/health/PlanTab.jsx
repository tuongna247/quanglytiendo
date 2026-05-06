'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import apiClient from '@/app/lib/apiClient';
import PlanCatalog from './PlanCatalog';
import PlanTracker from './PlanTracker';

export default function PlanTab() {
  const [activePlan, setActivePlan] = useState(undefined); // undefined = loading
  const [history, setHistory] = useState([]);

  async function fetchPlan() {
    try {
      const [active, hist] = await Promise.allSettled([
        apiClient.get('/api/workout-plan/active'),
        apiClient.get('/api/workout-plan/history'),
      ]);
      setActivePlan(active.status === 'fulfilled' ? active.value : null);
      if (hist.status === 'fulfilled') {
        setHistory(Array.isArray(hist.value) ? hist.value.filter(p => p.status !== 'active') : []);
      }
    } catch {
      setActivePlan(null);
    }
  }

  useEffect(() => { fetchPlan(); }, []);

  if (activePlan === undefined) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {activePlan
        ? <PlanTracker activePlan={activePlan} onRefresh={fetchPlan} />
        : <PlanCatalog onStarted={fetchPlan} />
      }

      {history.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 1.5 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Lịch sử giáo án</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {history.map(p => (
              <Chip
                key={p.id}
                label={`${p.planName} — ${p.completedDays.length}/${p.durationDays} ngày`}
                size="small"
                color={p.status === 'completed' ? 'success' : 'default'}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
