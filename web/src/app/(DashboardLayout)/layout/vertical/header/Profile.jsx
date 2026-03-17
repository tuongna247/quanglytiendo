import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/app/context/AuthContext';

const AVATAR_COLORS = [
  '#5C6BC0','#26A69A','#EF5350','#EC407A','#AB47BC',
  '#42A5F5','#FF7043','#66BB6A','#FFA726','#8D6E63',
];

function avatarColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(user) {
  if (!user) return '?';
  const name = user.displayName || user.username || '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const Profile = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();

  const initials = getInitials(user);
  const color = avatarColor(user?.username);

  return (
    <Box>
      <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
        <Avatar sx={{ width: 35, height: 35, bgcolor: color, fontSize: 13, fontWeight: 700 }}>
          {initials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{ paper: { sx: { width: 240, p: 2 } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: color, fontSize: 18, fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {user?.displayName || user?.username || ''}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              @{user?.username || ''}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={() => { setAnchorEl(null); logout(); }}
        >
          Đăng xuất
        </Button>
      </Menu>
    </Box>
  );
};

export default Profile;
