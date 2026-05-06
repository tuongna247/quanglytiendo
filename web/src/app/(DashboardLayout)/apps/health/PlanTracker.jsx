'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import { IconCheck, IconMoon, IconCircle } from '@tabler/icons-react';
import { getPlanById, getTodayDayIndex } from './lib/workoutPlans';
import PlanDayCard from './PlanDayCard';
import apiClient from '@/app/lib/apiClient';

export default function PlanTracker({ activePlan, onRefresh }) {
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [viewDay, setViewDay] = useState(null);

  const planDef = getPlanById(activePlan.planId);
  const todayIndex = getTodayDayIndex(activePlan.startDate);
  const clampedToday = Math.max(1, Math.min(todayIndex, activePlan.durationDays));
  const currentDay = planDef?.days.find(d => d.dayIndex === clampedToday);
  const displayDay = viewDay !== null ? planDef?.days.find(d => d.dayIndex === viewDay) : currentDay;
  const progress = (activePlan.completedDays.length / activePlan.durationDays) * 100;

  async function abandon() {
    try {
      await apiClient.post(`/api/workout-plan/${activePlan.id}/abandon`);
      onRefresh();
    } catch (err) { console.error(err); }
    setConfirmAbandon(false);
  }

  function dayColor(dayIndex) {
    const day = planDef?.days.find(d => d.dayIndex === dayIndex);
    if (day?.rest) return 'action.selected';
    if (activePlan.completedDays.includes(dayIndex)) return 'success.light';
    if (dayIndex === clampedToday) return 'primary.light';
    return 'action.hover';
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>{activePlan.planName}</Typography>
        <Chip label={`Ngày ${clampedToday} / ${activePlan.durationDays}`} size="small" color="primary" />
        <Button size="small" color="error" variant="outlined" onClick={() => setConfirmAbandon(true)}>Bỏ giáo án</Button>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mb: 2 }} />

      {/* Today's card */}
      {displayDay && (
        <Box sx={{ mb: 2 }}>
          {viewDay !== null && viewDay !== clampedToday && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">Ngày {viewDay}</Typography>
              <Button size="small" onClick={() => setViewDay(null)}>← Về hôm nay</Button>
            </Box>
          )}
          <PlanDayCard plan={activePlan} day={displayDay} onCompleted={onRefresh} />
        </Box>
      )}

      {/* Days grid */}
      <Grid container spacing={0.5}>
        {Array.from({ length: activePlan.durationDays }, (_, i) => i + 1).map(d => {
          const day = planDef?.days.find(dd => dd.dayIndex === d);
          const done = activePlan.completedDays.includes(d);
          const isRest = day?.rest;
          const isToday = d === clampedToday;
          return (
            <Grid key={d} size={{ xs: 'auto' }}>
              <Tooltip title={day?.title ?? `Ngày ${d}`}>
                <Box
                  onClick={() => setViewDay(d === viewDay ? null : d)}
                  sx={{
                    width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', bgcolor: dayColor(d),
                    border: isToday ? '2px solid' : '1px solid transparent',
                    borderColor: isToday ? 'primary.main' : 'transparent',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  {done ? <IconCheck size={14} color="#2e7d32" /> : isRest ? <IconMoon size={14} color="#999" /> : <Typography variant="caption" sx={{ fontWeight: isToday ? 700 : 400 }}>{d}</Typography>}
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={confirmAbandon} onClose={() => setConfirmAbandon(false)}>
        <DialogTitle>Bỏ giáo án "{activePlan.planName}"?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmAbandon(false)}>Hủy</Button>
          <Button color="error" onClick={abandon}>Xác nhận bỏ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
