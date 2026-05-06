'use client';
import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { IconCheck, IconLeaf } from '@tabler/icons-react';
import ExerciseTipRow from './ExerciseTipRow';
import apiClient from '@/app/lib/apiClient';

export default function PlanDayCard({ plan, day, onCompleted }) {
  const [checkedSets, setCheckedSets] = useState({});
  const [saving, setSaving] = useState(false);

  const isCompleted = plan.completedDays.includes(day.dayIndex);

  // Build set keys: "exerciseIndex-setIndex"
  const allSetKeys = useMemo(() => {
    if (day.rest || !day.exercises) return [];
    return day.exercises.flatMap((ex, ei) =>
      Array.from({ length: ex.sets }, (_, si) => `${ei}-${si}`)
    );
  }, [day]);

  const allChecked = allSetKeys.length > 0 && allSetKeys.every(k => checkedSets[k]);

  function toggleSet(key) {
    setCheckedSets(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleComplete() {
    setSaving(true);
    try {
      const exercises = (day.exercises || []).map(ex => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup ?? null,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          reps: ex.reps ?? null,
          weightKg: null,
          durationSeconds: ex.durationSeconds ?? null,
        })),
      }));
      await apiClient.post(`/api/workout-plan/${plan.id}/complete-day`, {
        dayIndex: day.dayIndex,
        sessionName: `${plan.planName} — ${day.title}`,
        exercises,
      });
      onCompleted();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  if (day.rest) {
    return (
      <Card sx={{ borderRadius: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.light' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconLeaf size={28} color="#4CAF50" />
          <Box>
            <Typography variant="h6" color="success.dark">Nghỉ ngơi hôm nay</Typography>
            <Typography variant="body2" color="text.secondary">Cho cơ bắp phục hồi và phát triển. Uống đủ nước, ngủ đủ giấc.</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{day.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Tick từng set khi hoàn thành để kích hoạt nút lưu.
        </Typography>

        {day.exercises?.map((ex, ei) => (
          <Box key={ei} sx={{ mb: 1 }}>
            <ExerciseTipRow exercise={ex} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pl: 1 }}>
              {Array.from({ length: ex.sets }, (_, si) => (
                <FormControlLabel
                  key={si}
                  control={<Checkbox size="small" checked={!!checkedSets[`${ei}-${si}`]} onChange={() => toggleSet(`${ei}-${si}`)} disabled={isCompleted} />}
                  label={<Typography variant="caption">Set {si + 1}</Typography>}
                  sx={{ mr: 0 }}
                />
              ))}
            </Box>
          </Box>
        ))}

        <Button
          variant="contained"
          color={isCompleted ? 'success' : 'primary'}
          startIcon={isCompleted ? <IconCheck size={16} /> : saving ? <CircularProgress size={14} color="inherit" /> : null}
          onClick={isCompleted ? undefined : handleComplete}
          disabled={(!allChecked && !isCompleted) || saving}
          sx={{ mt: 1 }}
        >
          {isCompleted ? 'Đã hoàn thành' : 'Hoàn thành ngày hôm nay'}
        </Button>
      </CardContent>
    </Card>
  );
}
