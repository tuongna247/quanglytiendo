'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import {
  IconPlus, IconTrash, IconChevronDown, IconChevronUp,
  IconBarbell, IconRun, IconFlame,
} from '@tabler/icons-react';
import apiClient from '@/app/lib/apiClient';

import { EXERCISE_LIBRARY, ALL_EXERCISES } from './lib/exerciseLibrary';

function toLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── SetRow ────────────────────────────────────────────────────────────────────
function SetRow({ set, exerciseId, onUpdated, onDeleted }) {
  const [reps, setReps] = useState(String(set.reps ?? ''));
  const [weight, setWeight] = useState(String(set.weightKg ?? ''));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await apiClient.put(`/api/workout/sets/${set.id}`, {
        reps: reps ? parseInt(reps) : null,
        weightKg: weight ? parseFloat(weight) : null,
      });
      onUpdated();
    } catch {} finally { setSaving(false); }
  }

  async function del() {
    try {
      await apiClient.delete(`/api/workout/sets/${set.id}`);
      onDeleted(set.id);
    } catch {}
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Typography variant="caption" sx={{ minWidth: 28, color: 'text.secondary', fontWeight: 600 }}>
        {set.setNumber}
      </Typography>
      <TextField
        size="small"
        label="Reps"
        type="number"
        value={reps}
        onChange={e => setReps(e.target.value)}
        onBlur={save}
        sx={{ width: 80 }}
        inputProps={{ min: 0 }}
      />
      <TextField
        size="small"
        label="kg"
        type="number"
        value={weight}
        onChange={e => setWeight(e.target.value)}
        onBlur={save}
        placeholder="BW"
        sx={{ width: 80 }}
        inputProps={{ min: 0, step: 0.5 }}
      />
      {saving && <CircularProgress size={14} />}
      <Tooltip title="Xóa set">
        <IconButton size="small" color="error" onClick={del}>
          <IconTrash size={14} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// ── ExerciseCard ──────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, sessionId, onDeleted, onRefresh }) {
  const [sets, setSets] = useState(exercise.sets || []);
  const [adding, setAdding] = useState(false);

  async function addSet() {
    setAdding(true);
    try {
      const nextNum = sets.length > 0 ? Math.max(...sets.map(s => s.setNumber)) + 1 : 1;
      const newSet = await apiClient.post(`/api/workout/exercises/${exercise.id}/sets`, {
        setNumber: nextNum,
        reps: sets.length > 0 ? sets[sets.length - 1].reps : null,
        weightKg: sets.length > 0 ? sets[sets.length - 1].weightKg : null,
      });
      setSets(prev => [...prev, newSet]);
    } catch {} finally { setAdding(false); }
  }

  function removeSet(setId) {
    setSets(prev => prev.filter(s => s.id !== setId));
  }

  async function deleteExercise() {
    try {
      await apiClient.delete(`/api/workout/exercises/${exercise.id}`);
      onDeleted(exercise.id);
    } catch {}
  }

  const totalVolume = sets.reduce((sum, s) => sum + (s.reps || 0) * (s.weightKg || 0), 0);

  return (
    <Card variant="outlined" sx={{ mb: 1.5, borderRadius: 2 }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <IconBarbell size={16} color="#1976d2" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
            {exercise.name}
          </Typography>
          {exercise.muscleGroup && (
            <Chip label={exercise.muscleGroup} size="small" variant="outlined" />
          )}
          {totalVolume > 0 && (
            <Typography variant="caption" color="text.secondary">
              {totalVolume.toLocaleString()} kg tổng
            </Typography>
          )}
          <Tooltip title="Xóa bài tập">
            <IconButton size="small" color="error" onClick={deleteExercise}>
              <IconTrash size={14} />
            </IconButton>
          </Tooltip>
        </Box>

        {sets.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
              <Typography variant="caption" sx={{ minWidth: 28, color: 'text.secondary' }}>Set</Typography>
              <Typography variant="caption" sx={{ width: 80, color: 'text.secondary' }}>Reps</Typography>
              <Typography variant="caption" sx={{ width: 80, color: 'text.secondary' }}>Tạ (kg)</Typography>
            </Box>
            {sets.map(set => (
              <SetRow
                key={set.id}
                set={set}
                exerciseId={exercise.id}
                onUpdated={onRefresh}
                onDeleted={removeSet}
              />
            ))}
          </Box>
        )}

        <Button
          size="small"
          variant="outlined"
          startIcon={adding ? <CircularProgress size={12} /> : <IconPlus size={14} />}
          onClick={addSet}
          disabled={adding}
        >
          Thêm set
        </Button>
      </CardContent>
    </Card>
  );
}

// ── SessionCard ───────────────────────────────────────────────────────────────
function SessionCard({ session, onDeleted, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [exercises, setExercises] = useState(session.exercises || []);
  const [addingEx, setAddingEx] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  async function addExercise() {
    if (!selectedExercise) return;
    setAddingEx(true);
    try {
      const name = typeof selectedExercise === 'string' ? selectedExercise : selectedExercise.name;
      const group = typeof selectedExercise === 'string' ? null : selectedExercise.group;
      const newEx = await apiClient.post(`/api/workout/${session.id}/exercises`, {
        name,
        muscleGroup: group,
        orderIndex: exercises.length,
      });
      setExercises(prev => [...prev, { ...newEx, sets: [] }]);
      setSelectedExercise(null);
    } catch {} finally { setAddingEx(false); }
  }

  async function deleteSession() {
    try {
      await apiClient.delete(`/api/workout/${session.id}`);
      onDeleted(session.id);
    } catch {}
  }

  const totalSets = exercises.reduce((sum, e) => sum + (e.sets?.length || 0), 0);

  return (
    <Card sx={{ borderRadius: 2, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{session.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(session.date).toLocaleDateString('vi-VN')}
              {session.durationMinutes ? ` · ${session.durationMinutes} phút` : ''}
              {session.caloriesBurned ? ` · ${session.caloriesBurned} cal` : ''}
              {totalSets > 0 ? ` · ${exercises.length} bài · ${totalSets} sets` : ''}
            </Typography>
          </Box>
          {session.source === 'garmin' && (
            <Chip label="Garmin" size="small" color="success" icon={<IconRun size={12} />} />
          )}
          <IconButton size="small" onClick={() => setExpanded(e => !e)}>
            {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </IconButton>
          <Tooltip title="Xóa buổi tập">
            <IconButton size="small" color="error" onClick={deleteSession}>
              <IconTrash size={16} />
            </IconButton>
          </Tooltip>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ my: 1.5 }} />

          {exercises.map(ex => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              sessionId={session.id}
              onDeleted={id => setExercises(prev => prev.filter(e => e.id !== id))}
              onRefresh={onRefresh}
            />
          ))}

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Autocomplete
              freeSolo
              options={ALL_EXERCISES}
              getOptionLabel={o => typeof o === 'string' ? o : o.name}
              groupBy={o => typeof o === 'string' ? '' : o.group}
              value={selectedExercise}
              onChange={(_, v) => setSelectedExercise(v)}
              renderInput={params => (
                <TextField {...params} size="small" label="Thêm bài tập..." sx={{ flex: 1 }} />
              )}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={addExercise}
              disabled={!selectedExercise || addingEx}
              startIcon={addingEx ? <CircularProgress size={12} /> : <IconPlus size={14} />}
            >
              Thêm
            </Button>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

// ── GymTab ────────────────────────────────────────────────────────────────────
export default function GymTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', date: toLocalDate(), durationMinutes: '', caloriesBurned: '', notes: '' });

  async function fetchSessions() {
    try {
      const data = await apiClient.get('/api/workout');
      setSessions(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchSessions(); }, []);

  async function createSession() {
    if (!form.name) return;
    setCreating(true);
    try {
      const session = await apiClient.post('/api/workout', {
        date: form.date,
        name: form.name,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
        caloriesBurned: form.caloriesBurned ? parseInt(form.caloriesBurned) : null,
        notes: form.notes || null,
      });
      setSessions(prev => [{ ...session, exercises: [] }, ...prev]);
      setForm({ name: '', date: toLocalDate(), durationMinutes: '', caloriesBurned: '', notes: '' });
      setShowForm(false);
    } catch {} finally { setCreating(false); }
  }

  const SESSION_TEMPLATES = ['Ngày Ngực', 'Ngày Lưng', 'Ngày Chân', 'Ngày Vai + Tay', 'Full Body', 'Cardio', 'HIIT'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Lịch tập</Typography>
        <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={() => setShowForm(v => !v)}>
          Buổi tập mới
        </Button>
      </Box>

      <Collapse in={showForm}>
        <Card sx={{ borderRadius: 2, mb: 2, border: '1px solid', borderColor: 'primary.light' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>Tạo buổi tập</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              {SESSION_TEMPLATES.map(t => (
                <Chip key={t} label={t} size="small" variant="outlined" onClick={() => setForm(f => ({ ...f, name: t }))}
                  color={form.name === t ? 'primary' : 'default'} sx={{ cursor: 'pointer' }} />
              ))}
            </Box>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Tên buổi tập *" fullWidth size="small" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Ngày" type="date" fullWidth size="small" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField label="Thời gian (phút)" type="number" fullWidth size="small"
                  value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField label="Calories" type="number" fullWidth size="small"
                  value={form.caloriesBurned} onChange={e => setForm(f => ({ ...f, caloriesBurned: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Ghi chú" fullWidth size="small" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              <Button variant="contained" onClick={createSession} disabled={!form.name || creating}
                startIcon={creating ? <CircularProgress size={14} /> : null}>
                {creating ? 'Đang tạo...' : 'Tạo buổi tập'}
              </Button>
              <Button variant="outlined" onClick={() => setShowForm(false)}>Hủy</Button>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : sessions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <IconBarbell size={48} color="#ccc" />
          <Typography color="text.secondary" sx={{ mt: 1 }}>Chưa có buổi tập nào. Tạo buổi đầu tiên!</Typography>
        </Box>
      ) : (
        sessions.map(session => (
          <SessionCard
            key={session.id}
            session={session}
            onDeleted={id => setSessions(prev => prev.filter(s => s.id !== id))}
            onRefresh={fetchSessions}
          />
        ))
      )}
    </Box>
  );
}
