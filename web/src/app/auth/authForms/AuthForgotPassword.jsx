'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';

export default function AuthForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Có lỗi xảy ra');
      }
      setSent(true);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Alert severity="success">
          Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
        </Alert>
        <Button color="primary" size="large" fullWidth component={Link} href="/auth/auth1/login">
          Quay lại đăng nhập
        </Button>
      </Stack>
    );
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2} sx={{ mt: 4 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <CustomFormLabel htmlFor="reset-email">Địa chỉ Email</CustomFormLabel>
      <CustomTextField
        id="reset-email"
        type="email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
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
        {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
      </Button>
      <Button color="primary" size="large" fullWidth component={Link} href="/auth/auth1/login">
        Quay lại đăng nhập
      </Button>
    </Stack>
  );
}
