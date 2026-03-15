'use client';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import PageContainer from '@/app/components/container/PageContainer';
import { api } from '@/app/lib/api';

// Template dashboard components
import YearlyBreakup from '@/app/components/dashboards/modern/YearlyBreakup';
import MonthlyEarnings from '@/app/components/dashboards/modern/MonthlyEarnings';
import RevenueUpdates from '@/app/components/dashboards/modern/RevenueUpdates';
import WeeklyStats from '@/app/components/dashboards/modern/WeeklyStats';
import TopPerformers from '@/app/components/dashboards/modern/TopPerformers';

function StatCard({ label, value, color }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard')
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => (n ?? 0).toLocaleString();
  const fmtCurrency = (n) =>
    (n ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <PageContainer title="Dashboard" description="Vinaday Admin Dashboard">
      <Box sx={{ mt: 3 }}>
        {/* Live stats row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Bookings"
              value={isLoading ? <CircularProgress size={20} /> : fmt(stats?.totalBookings)}
              color="primary.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Customers"
              value={isLoading ? <CircularProgress size={20} /> : fmt(stats?.totalCustomers)}
              color="success.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Revenue"
              value={isLoading ? <CircularProgress size={20} /> : fmtCurrency(stats?.totalRevenue)}
              color="warning.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Unread Requests"
              value={isLoading ? <CircularProgress size={20} /> : fmt(stats?.unreadRequests)}
              color="error.main"
            />
          </Grid>
        </Grid>

        {/* Template components for visual layout */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RevenueUpdates isLoading={isLoading} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                <YearlyBreakup isLoading={isLoading} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                <MonthlyEarnings isLoading={isLoading} />
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <WeeklyStats isLoading={isLoading} />
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <TopPerformers />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
