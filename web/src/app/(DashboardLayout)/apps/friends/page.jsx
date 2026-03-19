'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import {
  IconUserPlus, IconUserMinus, IconCheck, IconX, IconSettings,
  IconSearch,
} from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';

function UserAvatar({ displayName, username, avatarColor, size = 40 }) {
  const letter = (displayName?.[0] || username?.[0] || '?').toUpperCase();
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: avatarColor || '#2196f3', fontSize: size * 0.4 }}>
      {letter}
    </Avatar>
  );
}

export default function FriendsPage() {
  const [tab, setTab] = useState(0);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search dialog
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState(null);

  // Share settings dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareSettings, setShareSettings] = useState({ shareTasks: false, sharePlanner: false, shareFinanceSummary: false });
  const [savingSettings, setSavingSettings] = useState(false);

  async function fetchFriends() {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/friends');
      setFriends(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function fetchShareSettings() {
    try {
      const data = await apiClient.get('/api/friends/share-settings');
      setShareSettings(data);
    } catch { }
  }

  useEffect(() => {
    fetchFriends();
    fetchShareSettings();
  }, []);

  const accepted = friends.filter(f => f.status === 'accepted');
  const received = friends.filter(f => f.status === 'pending' && f.direction === 'received');
  const sent = friends.filter(f => f.status === 'pending' && f.direction === 'sent');

  async function handleAccept(friendshipId) {
    try {
      await apiClient.put(`/api/friends/${friendshipId}/accept`);
      await fetchFriends();
      setSuccess('Đã chấp nhận lời mời kết bạn');
    } catch (e) { setError(e.message); }
  }

  async function handleDecline(friendshipId) {
    try {
      await apiClient.put(`/api/friends/${friendshipId}/decline`);
      await fetchFriends();
    } catch (e) { setError(e.message); }
  }

  async function handleRemove(friendshipId) {
    if (!confirm('Hủy kết bạn?')) return;
    try {
      await apiClient.delete(`/api/friends/${friendshipId}`);
      await fetchFriends();
    } catch (e) { setError(e.message); }
  }

  async function handleSearch(query) {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const data = await apiClient.get('/api/friends/search', { username: query });
      setSearchResults(Array.isArray(data) ? data : []);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  }

  async function handleSendRequest(username) {
    setSendingTo(username);
    try {
      await apiClient.post('/api/friends/request', { username });
      setSuccess(`Đã gửi lời mời kết bạn đến @${username}`);
      await handleSearch(searchQuery);
      await fetchFriends();
    } catch (e) { setError(e.message || 'Không thể gửi lời mời'); }
    finally { setSendingTo(null); }
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      await apiClient.put('/api/friends/share-settings', shareSettings);
      setSuccess('Đã lưu cài đặt chia sẻ');
      setSettingsOpen(false);
    } catch (e) { setError(e.message); }
    finally { setSavingSettings(false); }
  }

  function FriendCard({ f }) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
          <UserAvatar displayName={f.displayName} username={f.username} avatarColor={f.avatarColor} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{f.displayName}</Typography>
            <Typography variant="caption" color="textSecondary">@{f.username}</Typography>
          </Box>
          <IconButton size="small" color="error" onClick={() => handleRemove(f.friendshipId)}>
            <IconUserMinus size={16} />
          </IconButton>
        </CardContent>
      </Card>
    );
  }

  function RequestCard({ f }) {
    const isReceived = f.direction === 'received';
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
          <UserAvatar displayName={f.displayName} username={f.username} avatarColor={f.avatarColor} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{f.displayName}</Typography>
            <Typography variant="caption" color="textSecondary">@{f.username}</Typography>
          </Box>
          {isReceived ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" startIcon={<IconCheck size={14} />} onClick={() => handleAccept(f.friendshipId)}>
                Chấp nhận
              </Button>
              <Button size="small" variant="outlined" color="error" startIcon={<IconX size={14} />} onClick={() => handleDecline(f.friendshipId)}>
                Từ chối
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label="Đã gửi" size="small" variant="outlined" />
              <IconButton size="small" color="error" onClick={() => handleRemove(f.friendshipId)}>
                <IconX size={14} />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <PageContainer title="Bạn bè" description="Kết nối và chia sẻ với bạn bè">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>Bạn bè</Typography>
        <Button
          variant="outlined"
          startIcon={<IconSettings size={16} />}
          onClick={() => setSettingsOpen(true)}
          size="small"
        >
          Chia sẻ
        </Button>
        <Button
          variant="contained"
          startIcon={<IconUserPlus size={16} />}
          onClick={() => { setSearchOpen(true); setSearchQuery(''); setSearchResults([]); }}
          size="small"
        >
          Tìm bạn
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Bạn bè${accepted.length ? ` (${accepted.length})` : ''}`} />
          <Tab label={`Lời mời${received.length ? ` (${received.length})` : ''}`} />
          <Tab label={`Đã gửi${sent.length ? ` (${sent.length})` : ''}`} />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tab === 0 && (
            accepted.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                Chưa có bạn bè nào. Nhấn "Tìm bạn" để kết nối!
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {accepted.map(f => (
                  <Grid key={f.friendshipId} size={{ xs: 12, sm: 6, md: 4 }}>
                    <FriendCard f={f} />
                  </Grid>
                ))}
              </Grid>
            )
          )}

          {tab === 1 && (
            received.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                Không có lời mời kết bạn nào
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {received.map(f => <RequestCard key={f.friendshipId} f={f} />)}
              </Box>
            )
          )}

          {tab === 2 && (
            sent.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                Chưa gửi lời mời kết bạn nào
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {sent.map(f => <RequestCard key={f.friendshipId} f={f} />)}
              </Box>
            )
          )}
        </>
      )}

      {/* Search dialog */}
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tìm bạn bè</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            placeholder="Nhập username..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: <IconSearch size={18} style={{ marginRight: 8, color: '#999' }} />,
              endAdornment: searching ? <CircularProgress size={18} /> : null,
            }}
            sx={{ mt: 1, mb: 2 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {searchResults.map(u => (
              <Box key={u.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <UserAvatar displayName={u.displayName} username={u.username} avatarColor={u.avatarColor} size={36} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.displayName}</Typography>
                  <Typography variant="caption" color="textSecondary">@{u.username}</Typography>
                </Box>
                {!u.friendshipStatus && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleSendRequest(u.username)}
                    disabled={sendingTo === u.username}
                  >
                    {sendingTo === u.username ? '...' : 'Kết bạn'}
                  </Button>
                )}
                {u.friendshipStatus === 'pending' && u.direction === 'sent' && (
                  <Chip label="Đã gửi" size="small" variant="outlined" />
                )}
                {u.friendshipStatus === 'pending' && u.direction === 'received' && (
                  <Chip label="Đã nhận lời mời" size="small" color="primary" />
                )}
                {u.friendshipStatus === 'accepted' && (
                  <Chip label="Bạn bè" size="small" color="success" />
                )}
              </Box>
            ))}
            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                Không tìm thấy người dùng
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Share settings dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cài đặt chia sẻ</DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
            Tất cả bạn bè đã chấp nhận sẽ xem được dữ liệu bạn bật chia sẻ.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={shareSettings.shareTasks}
                  onChange={e => setShareSettings(s => ({ ...s, shareTasks: e.target.checked }))}
                />
              }
              label="Chia sẻ Công việc"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={shareSettings.sharePlanner}
                  onChange={e => setShareSettings(s => ({ ...s, sharePlanner: e.target.checked }))}
                />
              }
              label="Chia sẻ Kế hoạch ngày"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={shareSettings.shareFinanceSummary}
                  onChange={e => setShareSettings(s => ({ ...s, shareFinanceSummary: e.target.checked }))}
                />
              }
              label="Chia sẻ Tài chính (chỉ tóm tắt)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveSettings} disabled={savingSettings}>
            {savingSettings ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </PageContainer>
  );
}
