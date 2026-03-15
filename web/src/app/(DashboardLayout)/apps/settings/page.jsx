'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import { IconUser, IconLock, IconLanguage, IconLogout } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import { useAuth } from '@/app/context/AuthContext';
import apiClient from '@/app/lib/apiClient';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('lang') || 'vi';
    return 'vi';
  });

  async function handleSaveName() {
    if (!displayName.trim()) return;
    setSavingName(true);
    setNameSuccess('');
    setNameError('');
    try {
      await apiClient.put('/api/auth/profile', { displayName });
      setNameSuccess('Đã cập nhật tên hiển thị!');
      // Update stored user
      const stored = localStorage.getItem('qlTD_user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('qlTD_user', JSON.stringify({ ...u, displayName }));
      }
    } catch (err) {
      setNameError(err.message || 'Có lỗi xảy ra');
    } finally { setSavingName(false); }
  }

  async function handleSavePwd() {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwdError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Mật khẩu mới không khớp');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setSavingPwd(true);
    setPwdSuccess('');
    setPwdError('');
    try {
      await apiClient.put('/api/auth/change-password', { oldPassword, newPassword });
      setPwdSuccess('Đã đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.message || 'Có lỗi xảy ra');
    } finally { setSavingPwd(false); }
  }

  function handleLangChange(_, value) {
    if (!value) return;
    setLang(value);
    localStorage.setItem('lang', value);
  }

  function handleLogout() {
    if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
      logout();
    }
  }

  return (
    <PageContainer title="Cài đặt" description="Cài đặt tài khoản">
      <Box sx={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* User info */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <IconUser size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Thông tin tài khoản</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                {(user?.displayName || user?.username || '?')[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{user?.displayName || user?.username}</Typography>
                <Typography variant="body2" color="textSecondary">@{user?.username}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {nameSuccess && <Alert severity="success" sx={{ mb: 2 }}>{nameSuccess}</Alert>}
            {nameError && <Alert severity="error" sx={{ mb: 2 }}>{nameError}</Alert>}
            <TextField
              label="Tên hiển thị"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleSaveName} disabled={savingName || !displayName.trim()}>
              {savingName ? 'Đang lưu...' : 'Cập nhật tên'}
            </Button>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <IconLock size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Đổi mật khẩu</Typography>
            </Box>
            {pwdSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwdSuccess}</Alert>}
            {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{pwdError}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Mật khẩu cũ" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} fullWidth />
              <TextField label="Mật khẩu mới" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} fullWidth />
              <TextField label="Xác nhận mật khẩu mới" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} fullWidth />
              <Button variant="contained" onClick={handleSavePwd} disabled={savingPwd}>
                {savingPwd ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Language */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <IconLanguage size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Ngôn ngữ</Typography>
            </Box>
            <ToggleButtonGroup value={lang} exclusive onChange={handleLangChange}>
              <ToggleButton value="vi">Tiếng Việt</ToggleButton>
              <ToggleButton value="en">English</ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <IconLogout size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Đăng xuất</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Đăng xuất khỏi tài khoản của bạn trên thiết bị này.
            </Typography>
            <Button variant="outlined" color="error" onClick={handleLogout} startIcon={<IconLogout size={16} />}>
              Đăng xuất
            </Button>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
}
