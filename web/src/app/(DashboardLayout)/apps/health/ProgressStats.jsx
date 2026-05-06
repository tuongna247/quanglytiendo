import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

function StatCard({ label, value, sub }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ py: '12px !important' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {sub && <Typography variant="caption" color="primary.main" display="block">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function ProgressStats({ sessions }) {
  const totalSessions = sessions.length;
  const totalSets = sessions.reduce((s, sess) =>
    s + (sess.exercises || []).reduce((e, ex) => e + (ex.sets?.length || 0), 0), 0);
  const totalCalories = sessions.reduce((s, sess) => s + (sess.caloriesBurned || 0), 0);
  const totalVolume = sessions.reduce((s, sess) =>
    s + (sess.exercises || []).reduce((e, ex) =>
      e + (ex.sets || []).reduce((st, set) =>
        st + (set.reps || 0) * (set.weightKg || 1), 0), 0), 0);

  // streak: consecutive days ending today
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (sessions.some(s => s.date === ds)) { streak++; } else if (i > 0) { break; }
  }

  return (
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      <Grid size={{ xs: 6, sm: 'auto', md: 'auto' }} sx={{ flex: 1 }}>
        <StatCard label="Buổi tập" value={totalSessions} />
      </Grid>
      <Grid size={{ xs: 6, sm: 'auto', md: 'auto' }} sx={{ flex: 1 }}>
        <StatCard label="Streak" value={`${streak} ngày`} />
      </Grid>
      <Grid size={{ xs: 6, sm: 'auto', md: 'auto' }} sx={{ flex: 1 }}>
        <StatCard label="Tổng sets" value={totalSets} />
      </Grid>
      <Grid size={{ xs: 6, sm: 'auto', md: 'auto' }} sx={{ flex: 1 }}>
        <StatCard label="Thể tích" value={`${Math.round(totalVolume).toLocaleString()}`} sub="kg·rep" />
      </Grid>
      <Grid size={{ xs: 6, sm: 'auto', md: 'auto' }} sx={{ flex: 1 }}>
        <StatCard label="Calories" value={totalCalories > 0 ? totalCalories : '—'} />
      </Grid>
    </Grid>
  );
}
