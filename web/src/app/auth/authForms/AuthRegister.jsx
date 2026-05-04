'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import { useAuth } from '@/app/context/AuthContext';

const AuthRegister = ({ title, subtitle, subtext }) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password || !displayName || !email) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await register(username, password, displayName, email);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {title && (
        <Typography variant="h3" sx={{ fontWeight: '700', mb: 1 }}>
          {title}
        </Typography>
      )}

      {subtext}

      <Box sx={{ mt: 3 }}>
        <Divider>
          <Typography component="span" color="textSecondary" variant="h6"
            sx={{ fontWeight: '400', position: 'relative', px: 2 }}>
            Tạo tài khoản mới
          </Typography>
        </Divider>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 1 }}>{error}</Alert>
        )}
        <Stack sx={{ mb: 3 }}>
          <CustomFormLabel htmlFor="username">Tên đăng nhập</CustomFormLabel>
          <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <CustomFormLabel htmlFor="displayName">Tên hiển thị</CustomFormLabel>
          <CustomTextField
            id="displayName"
            variant="outlined"
            fullWidth
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
          <CustomTextField
            id="email"
            type="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <CustomFormLabel htmlFor="password">Mật khẩu</CustomFormLabel>
          <CustomTextField
            id="password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </Stack>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthRegister;
