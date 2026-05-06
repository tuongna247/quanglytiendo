'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { IconCalendar, IconFlame, IconClock } from '@tabler/icons-react';
import { WORKOUT_PLANS, toLocalDateStr } from './lib/workoutPlans';
import apiClient from '@/app/lib/apiClient';

export default function PlanCatalog({ onStarted }) {
  const [starting, setStarting] = useState(null);

  async function startPlan(plan) {
    setStarting(plan.id);
    try {
      await apiClient.post('/api/workout-plan', {
        planId: plan.id,
        planName: plan.name,
        durationDays: plan.durationDays,
        startDate: toLocalDateStr(),
      });
      onStarted();
    } catch (err) { console.error(err); }
    finally { setStarting(null); }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Chọn giáo án</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Video hướng dẫn từ <strong>Darebees</strong> — bài tập không cần dụng cụ.
      </Typography>
      <Grid container spacing={2}>
        {WORKOUT_PLANS.map(plan => (
          <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', borderTop: `4px solid ${plan.color}` }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{plan.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  <Chip icon={<IconCalendar size={12} />} label={`${plan.durationDays} ngày`} size="small" />
                  <Chip icon={<IconFlame size={12} />} label={plan.difficulty} size="small" />
                  <Chip icon={<IconClock size={12} />} label={`~${plan.estimatedMinutesPerDay} phút/ngày`} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary">{plan.description}</Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => startPlan(plan)}
                  disabled={!!starting}
                  startIcon={starting === plan.id ? <CircularProgress size={14} color="inherit" /> : null}
                  sx={{ bgcolor: plan.color, '&:hover': { bgcolor: plan.color, filter: 'brightness(0.9)' } }}
                >
                  {starting === plan.id ? 'Đang bắt đầu...' : 'Bắt đầu'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
