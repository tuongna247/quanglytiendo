'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { Grid } from '@mui/material';
import Logo from '@/app/(DashboardLayout)/layout/shared/logo/Logo';
import PageContainer from '@/app/components/container/PageContainer';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Có lỗi xảy ra');
      }
      setSuccess(true);
      setTimeout(() => router.push('/auth/auth1/login'), 2000);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Alert severity="error">Link đặt lại mật khẩu không hợp lệ.</Alert>
        <Button color="primary" size="large" fullWidth component={Link} href="/auth/auth1/forgot-password">
          Yêu cầu link mới
        </Button>
      </Stack>
    );
  }

  if (success) {
    return (
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Alert severity="success">Mật khẩu đã được đặt lại thành công! Đang chuyển hướng...</Alert>
      </Stack>
    );
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2} sx={{ mt: 4 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <CustomFormLabel htmlFor="new-password">Mật khẩu mới</CustomFormLabel>
      <CustomTextField
        id="new-password"
        type="password"
        variant="outlined"
        fullWidth
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        autoComplete="new-password"
      />
      <CustomFormLabel htmlFor="confirm-password">Xác nhận mật khẩu</CustomFormLabel>
      <CustomTextField
        id="confirm-password"
        type="password"
        variant="outlined"
        fullWidth
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
      />
      <Button
        color="primary"
        variant="contained"
        size="large"
        fullWidth
        type="submit"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
      </Button>
      <Button color="primary" size="large" fullWidth component={Link} href="/auth/auth1/login">
        Quay lại đăng nhập
      </Button>
    </Stack>
  );
}

export default function ResetPasswordPage() {
  return (
    <PageContainer title="Đặt lại mật khẩu" description="Đặt lại mật khẩu">
      <Grid container spacing={0} sx={{ justifyContent: 'center', overflowX: 'hidden' }}>
        <Grid
          sx={{
            position: 'relative',
            '&:before': {
              content: '""',
              background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
              position: 'absolute',
              height: '100%',
              width: '100%',
              opacity: '0.3',
            },
          }}
          size={{ xs: 12, sm: 12, lg: 8, xl: 9 }}
        >
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ px: 3 }}>
              <Logo />
            </Box>
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 12, lg: 4, xl: 3 }}
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Box sx={{ p: 4, width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: '700' }}>
              Đặt lại mật khẩu
            </Typography>
            <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: '400', mt: 2 }}>
              Nhập mật khẩu mới cho tài khoản của bạn.
            </Typography>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
              <ResetPasswordForm />
            </Suspense>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
