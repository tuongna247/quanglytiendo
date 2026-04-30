'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import { LineChart } from '@mui/x-charts/LineChart';
import { IconTrash } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';

const EXERCISE_TYPES = ['Chạy bộ', 'Đi bộ', 'Đạp xe', 'Bơi lội', 'Gym', 'Yoga', 'Khác'];
const INTENSITY_OPTS = [
  { value: 'light', label: 'Nhẹ' },
  { value: 'moderate', label: 'Vừa' },
  { value: 'intense', label: 'Cao' },
];

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

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

const RATING_LABELS = { energy: 'Năng lượng', mood: 'Tâm trạng', sleep: 'Giấc ngủ', stress: 'Căng thẳng' };

export default function HealthPage() {
  const [tab, setTab] = useState(0);

  // Weight tab
  const [weights, setWeights] = useState([]);
  const [weightForm, setWeightForm] = useState({ weight: '', date: new Date().toISOString().split('T')[0], note: '' });
  const [savingWeight, setSavingWeight] = useState(false);

  // Exercise tab
  const [exercises, setExercises] = useState([]);
  const [exForm, setExForm] = useState({ exerciseType: 'Chạy bộ', durationMinutes: '', caloriesBurned: '', date: new Date().toISOString().split('T')[0], intensity: 'moderate', note: '' });
  const [savingEx, setSavingEx] = useState(false);

  // Goal tab
  const [goal, setGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({ targetWeight: '', height: '', targetCaloriesPerDay: '' });
  const [savingGoal, setSavingGoal] = useState(false);

  // Checkin tab
  const [checkin, setCheckin] = useState({ energy: 3, mood: 3, sleep: 3, stress: 3 });
  const [savingCheckin, setSavingCheckin] = useState(false);

  async function fetchAll() {
    try {
      const [w, e, g] = await Promise.allSettled([
        apiClient.get('/api/health/weight'),
        apiClient.get('/api/health/exercise'),
        apiClient.get('/api/health/goal'),
      ]);
      if (w.status === 'fulfilled') setWeights(Array.isArray(w.value) ? w.value : []);
      if (e.status === 'fulfilled') setExercises(Array.isArray(e.value) ? e.value : []);
      if (g.status === 'fulfilled' && g.value) {
        setGoal(g.value);
        setGoalForm({ targetWeight: g.value.targetWeightKg || '', height: g.value.heightCm || '', targetCaloriesPerDay: g.value.dailyCalorieTarget || '' });
      }
    } catch {}
  }

  useEffect(() => { fetchAll(); }, []);

  async function deleteWeight(id) {
    try {
      await apiClient.delete(`/api/health/weight/${id}`);
      const data = await apiClient.get('/api/health/weight');
      setWeights(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }

  async function saveWeight() {
    if (!weightForm.weight) return;
    setSavingWeight(true);
    try {
      await apiClient.post('/api/health/weight', {
        date: weightForm.date,
        weightKg: parseFloat(weightForm.weight),
        notes: weightForm.note || null,
      });
      setWeightForm({ weight: '', date: new Date().toISOString().split('T')[0], note: '' });
      const data = await apiClient.get('/api/health/weight');
      setWeights(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setSavingWeight(false); }
  }

  async function saveExercise() {
    if (!exForm.durationMinutes) return;
    setSavingEx(true);
    try {
      await apiClient.post('/api/health/exercise', {
        date: exForm.date,
        type: exForm.exerciseType,
        name: exForm.exerciseType,
        durationMinutes: parseInt(exForm.durationMinutes),
        caloriesBurned: exForm.caloriesBurned ? parseInt(exForm.caloriesBurned) : null,
        intensity: exForm.intensity,
        notes: exForm.note || null,
      });
      setExForm({ exerciseType: 'Chạy bộ', durationMinutes: '', caloriesBurned: '', date: new Date().toISOString().split('T')[0], intensity: 'moderate', note: '' });
      const data = await apiClient.get('/api/health/exercise');
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setSavingEx(false); }
  }

  async function saveGoal() {
    setSavingGoal(true);
    try {
      await apiClient.post('/api/health/goal', {
        startDate: new Date().toISOString().split('T')[0],
        targetWeightKg: parseFloat(goalForm.targetWeight),
        heightCm: parseFloat(goalForm.height),
        dailyCalorieTarget: goalForm.targetCaloriesPerDay ? parseInt(goalForm.targetCaloriesPerDay) : null,
      });
      await fetchAll();
    } catch (err) { console.error(err); }
    finally { setSavingGoal(false); }
  }

  async function saveCheckin() {
    setSavingCheckin(true);
    try {
      await apiClient.post('/api/health/checkin', { ...checkin, date: new Date().toISOString().split('T')[0] });
      alert('Đã lưu check-in hôm nay!');
    } catch (err) { console.error(err); }
    finally { setSavingCheckin(false); }
  }

  const latestWeight = weights.length > 0 ? weights[weights.length - 1]?.weightKg : null;
  const bmi = calcBMI(latestWeight, goal?.heightCm);
  const bmiStatus = getBMIStatus(bmi);

  const weightChartData = weights.slice(-30);
  const chartDates = weightChartData.map(w => new Date(w.date).toLocaleDateString('vi-VN'));
  const chartWeights = weightChartData.map(w => Number(w.weightKg));

  return (
    <PageContainer title="Sức khỏe" description="Theo dõi sức khỏe">
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tab label="Cân nặng" />
        <Tab label="Tập luyện" />
        <Tab label="BMI & Mục tiêu" />
        <Tab label="Lắng nghe cơ thể" />
      </Tabs>

      {/* Weight Tab */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Ghi cân nặng</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="Cân nặng (kg) *" type="number" value={weightForm.weight} onChange={e => setWeightForm(f => ({ ...f, weight: e.target.value }))} fullWidth inputProps={{ step: 0.1 }} />
                  <TextField label="Ngày" type="date" value={weightForm.date} onChange={e => setWeightForm(f => ({ ...f, date: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
                  <TextField label="Ghi chú" value={weightForm.note} onChange={e => setWeightForm(f => ({ ...f, note: e.target.value }))} fullWidth />
                  <Button variant="contained" onClick={saveWeight} disabled={savingWeight || !weightForm.weight}>
                    {savingWeight ? 'Đang lưu...' : 'Lưu'}
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
      </TabPanel>

      {/* Exercise Tab */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Ghi tập luyện</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Loại bài tập</InputLabel>
                    <Select value={exForm.exerciseType} label="Loại bài tập" onChange={e => setExForm(f => ({ ...f, exerciseType: e.target.value }))}>
                      {EXERCISE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Thời gian (phút) *" type="number" value={exForm.durationMinutes} onChange={e => setExForm(f => ({ ...f, durationMinutes: e.target.value }))} fullWidth inputProps={{ min: 0 }} />
                  <TextField label="Calories đốt" type="number" value={exForm.caloriesBurned} onChange={e => setExForm(f => ({ ...f, caloriesBurned: e.target.value }))} fullWidth inputProps={{ min: 0 }} />
                  <FormControl fullWidth>
                    <InputLabel>Cường độ</InputLabel>
                    <Select value={exForm.intensity} label="Cường độ" onChange={e => setExForm(f => ({ ...f, intensity: e.target.value }))}>
                      {INTENSITY_OPTS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Ngày" type="date" value={exForm.date} onChange={e => setExForm(f => ({ ...f, date: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
                  <TextField label="Ghi chú" value={exForm.note} onChange={e => setExForm(f => ({ ...f, note: e.target.value }))} fullWidth />
                  <Button variant="contained" onClick={saveExercise} disabled={savingEx || !exForm.durationMinutes}>
                    {savingEx ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ngày</TableCell>
                      <TableCell>Bài tập</TableCell>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Calories</TableCell>
                      <TableCell>Cường độ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...exercises].reverse().slice(0, 15).map((e, i) => (
                      <TableRow key={i} hover>
                        <TableCell>{new Date(e.date).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{e.type}</TableCell>
                        <TableCell>{e.durationMinutes} phút</TableCell>
                        <TableCell>{e.caloriesBurned || '-'}</TableCell>
                        <TableCell>{INTENSITY_OPTS.find(o => o.value === e.intensity)?.label || e.intensity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* BMI & Goal Tab */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Mục tiêu sức khỏe</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="Chiều cao (cm)" type="number" value={goalForm.height} onChange={e => setGoalForm(f => ({ ...f, height: e.target.value }))} fullWidth inputProps={{ min: 0 }} />
                  <TextField label="Cân nặng mục tiêu (kg)" type="number" value={goalForm.targetWeight} onChange={e => setGoalForm(f => ({ ...f, targetWeight: e.target.value }))} fullWidth inputProps={{ min: 0, step: 0.1 }} />
                  <TextField label="Calories mỗi ngày" type="number" value={goalForm.targetCaloriesPerDay} onChange={e => setGoalForm(f => ({ ...f, targetCaloriesPerDay: e.target.value }))} fullWidth inputProps={{ min: 0 }} />
                  <Button variant="contained" onClick={saveGoal} disabled={savingGoal}>
                    {savingGoal ? 'Đang lưu...' : 'Lưu mục tiêu'}
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
      </TabPanel>

      {/* Body Check-in Tab */}
      <TabPanel value={tab} index={3}>
        <Card sx={{ borderRadius: 2, maxWidth: 600 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Lắng nghe cơ thể hôm nay</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {Object.entries(RATING_LABELS).map(([key, label]) => (
                <Box key={key}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
                  <ToggleButtonGroup
                    value={checkin[key]}
                    exclusive
                    onChange={(_, v) => v !== null && setCheckin(c => ({ ...c, [key]: v }))}
                    size="small"
                  >
                    {[1, 2, 3, 4, 5].map(v => (
                      <ToggleButton key={v} value={v} sx={{ minWidth: 48 }}>{v}</ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                    {checkin[key] === 1 ? 'Rất thấp' : checkin[key] === 2 ? 'Thấp' : checkin[key] === 3 ? 'Trung bình' : checkin[key] === 4 ? 'Tốt' : 'Rất tốt'}
                  </Typography>
                </Box>
              ))}
              <Button variant="contained" onClick={saveCheckin} disabled={savingCheckin}>
                {savingCheckin ? 'Đang lưu...' : 'Lưu check-in hôm nay'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </PageContainer>
  );
}
