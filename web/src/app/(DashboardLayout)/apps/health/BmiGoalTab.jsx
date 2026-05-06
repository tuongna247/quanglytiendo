'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import apiClient from '@/app/lib/apiClient';

function calcBMI(weight, height) {
  if (!weight || !height) return null;
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function getBMIStatus(bmi) {
  if (!bmi) return { label: 'Chưa xác định', color: 'text.secondary' };
  if (bmi < 18.5) return { label: 'Thiếu cân', color: 'info.main' };
  if (bmi < 25) return { label: 'Bình thường', color: 'success.main' };
  if (bmi < 30) return { label: 'Thừa cân', color: 'warning.main' };
  return { label: 'Béo phì', color: 'error.main' };
}

export default function BmiGoalTab() {
  const [goal, setGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({ targetWeight: '', height: '', targetCaloriesPerDay: '' });
  const [saving, setSaving] = useState(false);
  const [latestWeight, setLatestWeight] = useState(null);

  async function fetchData() {
    try {
      const [w, g] = await Promise.allSettled([
        apiClient.get('/api/health/weight'),
        apiClient.get('/api/health/goal'),
      ]);
      if (w.status === 'fulfilled') {
        const weights = Array.isArray(w.value) ? w.value : [];
        setLatestWeight(weights.length > 0 ? weights[weights.length - 1]?.weightKg : null);
      }
      if (g.status === 'fulfilled' && g.value) {
        setGoal(g.value);
        setGoalForm({ targetWeight: g.value.targetWeightKg || '', height: g.value.heightCm || '', targetCaloriesPerDay: g.value.dailyCalorieTarget || '' });
      }
    } catch {}
  }

  useEffect(() => { fetchData(); }, []);

  async function saveGoal() {
    setSaving(true);
    try {
      await apiClient.post('/api/health/goal', {
        startDate: new Date().toISOString().split('T')[0],
        targetWeightKg: parseFloat(goalForm.targetWeight),
        heightCm: parseFloat(goalForm.height),
        dailyCalorieTarget: goalForm.targetCaloriesPerDay ? parseInt(goalForm.targetCaloriesPerDay) : null,
      });
      await fetchData();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  const bmi = calcBMI(latestWeight, goal?.heightCm);
  const bmiStatus = getBMIStatus(bmi);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Mục tiêu sức khỏe</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Chiều cao (cm)" type="number" value={goalForm.height} onChange={e => setGoalForm(f => ({ ...f, height: e.target.value }))} fullWidth inputProps={{ min: 0 }} />
              <TextField label="Cân nặng mục tiêu (kg)" type="number" value={goalForm.targetWeight} onChange={e => setGoalForm(f => ({ ...f, targetWeight: e.target.value }))} fullWidth inputProps={{ min: 0, step: 0.1 }} />
              <TextField label="Calories mỗi ngày" type="number" value={goalForm.targetCaloriesPerDay} onChange={e => setGoalForm(f => ({ ...f, targetCaloriesPerDay: e.target.value }))} fullWidth inputProps={{ min: 0 }} />
              <Button variant="contained" onClick={saveGoal} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu mục tiêu'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Chỉ số BMI</Typography>
            {bmi ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{bmi}</Typography>
                  <Typography variant="h6" color={bmiStatus.color}>{bmiStatus.label}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Cân nặng hiện tại: {latestWeight} kg | Chiều cao: {goal?.heightCm} cm
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((parseFloat(bmi) - 10) / 25) * 100, 100)}
                  sx={{ height: 12, borderRadius: 6, mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">Thiếu cân &lt;18.5</Typography>
                  <Typography variant="caption">Bình thường 18.5-24.9</Typography>
                  <Typography variant="caption">Thừa cân &gt;25</Typography>
                </Box>
                {goal?.targetWeightKg && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Tiến độ đến mục tiêu ({goal.targetWeightKg} kg):
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, Math.min(100, 100 - Math.abs(latestWeight - goal.targetWeightKg) / goal.targetWeightKg * 100))}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}
              </Box>
            ) : (
              <Typography color="textSecondary">Hãy ghi chiều cao và cân nặng để tính BMI</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
