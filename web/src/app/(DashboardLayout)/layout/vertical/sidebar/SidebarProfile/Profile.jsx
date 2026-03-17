import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useContext } from 'react'
import { IconPower } from '@tabler/icons-react';
import { CustomizerContext } from '@/app/context/customizerContext'
import { useAuth } from '@/app/context/AuthContext'

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

export const Profile = () => {

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const { isSidebarHover, isCollapse } = useContext(CustomizerContext);
  const hideMenu = lgUp ? isCollapse == 'mini-sidebar' && !isSidebarHover : '';
  const { user, logout } = useAuth();

  const initials = getInitials(user);
  const color = avatarColor(user?.username);

  return (
    (<Box
      sx={{
        display: 'flex',
        alignItems: "center",
        gap: 2,
        m: 3,
        p: 2,
        bgcolor: `${'secondary.light'}`
      }}>
      {!hideMenu ? (
        <>
          <Avatar sx={{ height: 40, width: 40, bgcolor: color, fontSize: 15, fontWeight: 700 }}>
            {initials}
          </Avatar>

          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="h6" noWrap>{user?.displayName || user?.username || ''}</Typography>
            <Typography variant="caption">@{user?.username || ''}</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Logout" placement="top">
              <IconButton
                color="primary"
                onClick={logout}
                aria-label="logout"
                size="small"
              >
                <IconPower size="20" />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      ) : (
        ''
      )}
    </Box>)
  );
};
