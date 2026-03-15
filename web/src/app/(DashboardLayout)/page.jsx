'use client';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useEffect, useState } from 'react';
import { IconCheckbox, IconCurrencyDong, IconHeartbeat, IconListCheck } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import { useAuth } from '@/app/context/AuthContext';
import apiClient from '@/app/lib/apiClient';

const VI_DAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const VI_MONTHS = [
  'tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6',
  'tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12',
];

function formatViDate(date) {
  return `${VI_DAYS[date.getDay()]}, ngày ${date.getDate()} ${VI_MONTHS[date.getMonth()]} năm ${date.getFullYear()}`;
}

function StatCard({ label, value, color, icon: Icon, loading }) {
  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {label}
          </Typography>
          {Icon && (
            <Box sx={{ color: color || 'primary.main', opacity: 0.8 }}>
              <Icon size={24} />
            </Box>
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: color || 'text.primary' }}>
          {loading ? <CircularProgress size={24} /> : value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: null,
    monthTransactions: null,
    latestWeight: null,
    todayPlanner: null,
  });

  const today = new Date();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const todayStr = today.toISOString().split('T')[0];
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        const [tasks, transactions, weights, planner] = await Promise.allSettled([
          apiClient.get('/api/tasks'),
          apiClient.get('/api/transactions', { from: firstOfMonth, to: lastOfMonth }),
          apiClient.get('/api/health/weight'),
          apiClient.get('/api/planner', { date: todayStr }),
        ]);

        const tasksData = tasks.status === 'fulfilled' ? tasks.value : [];
        const transData = transactions.status === 'fulfilled' ? transactions.value : [];
        const weightsData = weights.status === 'fulfilled' ? weights.value : [];
        const plannerData = planner.status === 'fulfilled' ? planner.value : [];

        const latestWeight = Array.isArray(weightsData) && weightsData.length > 0
          ? weightsData[weightsData.length - 1]?.weight ?? weightsData[0]?.weight
          : null;

        setStats({
          totalTasks: Array.isArray(tasksData) ? tasksData.length : 0,
          monthTransactions: Array.isArray(transData) ? transData.length : 0,
          latestWeight: latestWeight,
          todayPlanner: Array.isArray(plannerData) ? plannerData.length : 0,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <PageContainer title="Dashboard" description="Quản Lý Tiến Độ">
      <Box sx={{ mt: 2 }}>
        {/* Greeting */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Xin chào, {user?.displayName || user?.username || 'bạn'}!
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 0.5 }}>
            {formatViDate(today)}
          </Typography>
        </Box>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Tổng công việc"
              value={stats.totalTasks ?? 0}
              color="primary.main"
              icon={IconCheckbox}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Giao dịch tháng này"
              value={stats.monthTransactions ?? 0}
              color="success.main"
              icon={IconCurrencyDong}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Cân nặng gần nhất"
              value={stats.latestWeight != null ? `${stats.latestWeight} kg` : 'Chưa có'}
              color="warning.main"
              icon={IconHeartbeat}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Kế hoạch hôm nay"
              value={stats.todayPlanner ?? 0}
              color="error.main"
              icon={IconListCheck}
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* Quick Info */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Hôm nay
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`${stats.todayPlanner ?? 0} kế hoạch`} color="primary" variant="outlined" />
                  <Chip label="Ghi nhật ký" color="secondary" variant="outlined" />
                  <Chip label="Tĩnh nguyện" color="info" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Tháng này
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`${stats.totalTasks ?? 0} công việc`} color="primary" variant="outlined" />
                  <Chip label={`${stats.monthTransactions ?? 0} giao dịch`} color="success" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
